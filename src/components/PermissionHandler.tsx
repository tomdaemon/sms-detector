import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Button, Card } from '@sms/ui';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

interface PermissionHandlerProps {
  onPermissionGranted: (granted: boolean) => void;
}

const PermissionHandler: React.FC<PermissionHandlerProps> = ({ onPermissionGranted }) => {
  const [permissionStatus, setPermissionStatus] = useState<string>('');

  const smsPermissions: Permission[] = Platform.select({
    android: [
      PERMISSIONS.ANDROID.RECEIVE_SMS,
      PERMISSIONS.ANDROID.READ_SMS,
    ],
    default: [],
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'android') {
      setPermissionStatus('not_android');
      onPermissionGranted(false);
      return;
    }

    try {
      const results = await Promise.all(
        smsPermissions.map(permission => check(permission))
      );
      
      const allGranted = results.every(result => result === RESULTS.GRANTED);
      setPermissionStatus(allGranted ? 'granted' : 'denied');
      onPermissionGranted(allGranted);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus('error');
      onPermissionGranted(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'This app only works on Android devices');
      return;
    }

    try {
      const results = await Promise.all(
        smsPermissions.map(permission => request(permission))
      );
      
      const allGranted = results.every(result => result === RESULTS.GRANTED);
      
      if (allGranted) {
        setPermissionStatus('granted');
        onPermissionGranted(true);
        Alert.alert('Success', 'SMS permissions granted!');
      } else {
        setPermissionStatus('denied');
        onPermissionGranted(false);
        Alert.alert(
          'Permission Denied',
          'SMS permissions are required for this app to function. Please enable them in your device settings.'
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  if (permissionStatus === 'granted') {
    return (
      <Card style={styles.card}>
        <Text style={styles.successText}>✓ SMS permissions granted</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>SMS Permissions Required</Text>
      <Text style={styles.description}>
        This app needs permission to receive and read SMS messages to detect incoming texts.
      </Text>
      <Button
        title="Grant Permissions"
        onPress={requestPermissions}
        variant="primary"
        style={styles.button}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  button: {
    marginTop: 10,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default PermissionHandler;
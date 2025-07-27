import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import { Button, Card } from '@sms/ui';
import PermissionHandler from './src/components/PermissionHandler';
import SmsDetectorService from './src/services/SmsDetectorService';
import { SMS } from './src/types';
import { API_CONFIG } from './src/config/api';

const App: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [smsList, setSmsList] = useState<SMS[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      Alert.alert('Platform Error', 'This app only works on Android devices');
      return;
    }

    // Initialize SMS detector service
    SmsDetectorService.initialize(async (sms: SMS) => {
      setSmsList(prev => [sms, ...prev]);
      
      // Send SMS to webhook server
      try {
        const payload = {
          sms: {
            id: `${Date.now()}-${Math.random()}`,
            sender: sms.sender || 'Unknown',
            message: sms.body,
            timestamp: new Date().toISOString(),
            deviceId: 'android-device',
            isRead: false
          },
          timestamp: new Date().toISOString(),
          deviceInfo: {
            deviceId: 'android-device',
            deviceName: 'SMS Detector',
            appVersion: '1.0.0'
          }
        };
        
        const response = await fetch(`${API_CONFIG.WEBHOOK_URL}${API_CONFIG.ENDPOINTS.SMS}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          console.error('Failed to send SMS to server:', response.status);
        }
      } catch (error) {
        console.error('Error sending SMS to webhook:', error);
      }
    });

    return () => {
      SmsDetectorService.cleanup();
    };
  }, []);

  const handleToggleDetection = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant SMS permissions first');
      return;
    }

    if (isDetecting) {
      await SmsDetectorService.stopDetecting();
      setIsDetecting(false);
    } else {
      const started = await SmsDetectorService.startDetecting();
      setIsDetecting(started);
      if (!started) {
        Alert.alert('Error', 'Failed to start SMS detection');
      }
    }
  };

  const handleClearList = () => {
    setSmsList([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Android SMS Detector</Text>
      </View>
      
      <PermissionHandler onPermissionGranted={setHasPermission} />
      
      <View style={styles.controls}>
        <Button
          title={isDetecting ? 'Stop Detection' : 'Start Detection'}
          onPress={handleToggleDetection}
          variant={isDetecting ? 'secondary' : 'primary'}
        />
        <Button
          title="Clear List"
          onPress={handleClearList}
          variant="outline"
          style={styles.clearButton}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {smsList.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No SMS messages detected yet</Text>
          </Card>
        ) : (
          smsList.map((sms, index) => (
            <Card key={`${sms.timestamp}-${index}`} style={styles.smsCard}>
              <Text style={styles.smsFrom}>From: {sms.from}</Text>
              <Text style={styles.smsBody}>{sms.body}</Text>
              <Text style={styles.smsTime}>
                {new Date(sms.timestamp).toLocaleString()}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  controls: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  smsCard: {
    marginBottom: 15,
    padding: 15,
  },
  smsFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  smsBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  smsTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default App;
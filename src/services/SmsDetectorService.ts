import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { SMS, SmsReceiverModule } from '../types';

class SmsDetectorService {
  private smsReceiver: SmsReceiverModule | null = null;
  private eventEmitter: NativeEventEmitter | null = null;
  private smsHandler: ((sms: SMS) => void) | null = null;

  initialize(onSmsReceived: (sms: SMS) => void) {
    if (Platform.OS !== 'android') {
      console.warn('SmsDetectorService: Only available on Android');
      return;
    }

    this.smsHandler = onSmsReceived;
    
    // Get the native module
    this.smsReceiver = NativeModules.SmsReceiver as SmsReceiverModule;
    
    if (!this.smsReceiver) {
      console.error('SmsDetectorService: Native module not found');
      return;
    }

    // Create event emitter
    this.eventEmitter = new NativeEventEmitter(NativeModules.SmsReceiver);
    
    // Set up event listener
    this.eventEmitter.addListener('onSmsReceived', (sms: SMS) => {
      console.log('SMS received:', sms);
      if (this.smsHandler) {
        this.smsHandler(sms);
      }
    });
  }

  async startDetecting(): Promise<boolean> {
    if (!this.smsReceiver) {
      console.error('SmsDetectorService: Not initialized');
      return false;
    }

    try {
      const result = await this.smsReceiver.startListening();
      console.log('SmsDetectorService: Started detecting SMS');
      return result;
    } catch (error) {
      console.error('SmsDetectorService: Error starting detection:', error);
      return false;
    }
  }

  async stopDetecting(): Promise<void> {
    if (!this.smsReceiver) {
      console.error('SmsDetectorService: Not initialized');
      return;
    }

    try {
      await this.smsReceiver.stopListening();
      console.log('SmsDetectorService: Stopped detecting SMS');
    } catch (error) {
      console.error('SmsDetectorService: Error stopping detection:', error);
    }
  }

  cleanup() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('onSmsReceived');
    }
    this.smsHandler = null;
  }
}

export default new SmsDetectorService();
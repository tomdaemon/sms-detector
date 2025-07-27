export interface SMS {
  from: string;
  body: string;
  timestamp: number;
}

export interface SmsReceiverModule {
  startListening: () => Promise<boolean>;
  stopListening: () => Promise<void>;
  addListener: (eventName: string, handler: (sms: SMS) => void) => void;
  removeAllListeners: (eventName: string) => void;
}
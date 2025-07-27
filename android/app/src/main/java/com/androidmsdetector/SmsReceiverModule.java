package com.androidmsdetector;

import android.content.IntentFilter;
import android.provider.Telephony;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nullable;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SmsReceiverModule";
    private static final String MODULE_NAME = "SmsReceiver";
    private static final String SMS_RECEIVED_EVENT = "onSmsReceived";
    
    private SmsBroadcastReceiver smsReceiver;
    private boolean isListening = false;
    private final ReactApplicationContext reactContext;

    public SmsReceiverModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startListening(Promise promise) {
        try {
            if (isListening) {
                promise.resolve(true);
                return;
            }

            smsReceiver = new SmsBroadcastReceiver();
            smsReceiver.setSmsListener(new SmsBroadcastReceiver.SmsListener() {
                @Override
                public void onSmsReceived(String from, String body, long timestamp) {
                    sendSmsEvent(from, body, timestamp);
                }
            });

            IntentFilter filter = new IntentFilter();
            filter.addAction(Telephony.Sms.Intents.SMS_RECEIVED_ACTION);
            filter.setPriority(IntentFilter.SYSTEM_HIGH_PRIORITY);
            
            reactContext.registerReceiver(smsReceiver, filter);
            isListening = true;
            
            Log.d(TAG, "SMS listener started");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start SMS listener", e);
            promise.reject("START_FAILED", "Failed to start SMS listener", e);
        }
    }

    @ReactMethod
    public void stopListening(Promise promise) {
        try {
            if (!isListening || smsReceiver == null) {
                promise.resolve(null);
                return;
            }

            reactContext.unregisterReceiver(smsReceiver);
            smsReceiver = null;
            isListening = false;
            
            Log.d(TAG, "SMS listener stopped");
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop SMS listener", e);
            promise.reject("STOP_FAILED", "Failed to stop SMS listener", e);
        }
    }

    private void sendSmsEvent(String from, String body, long timestamp) {
        WritableMap params = Arguments.createMap();
        params.putString("from", from);
        params.putString("body", body);
        params.putDouble("timestamp", timestamp);

        sendEvent(SMS_RECEIVED_EVENT, params);
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }
}
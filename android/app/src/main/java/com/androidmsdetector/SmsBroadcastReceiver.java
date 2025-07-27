package com.androidmsdetector;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsBroadcastReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsBroadcastReceiver";
    private static final String SMS_RECEIVED = "android.provider.Telephony.SMS_RECEIVED";
    private SmsListener smsListener;

    public interface SmsListener {
        void onSmsReceived(String from, String body, long timestamp);
    }

    public void setSmsListener(SmsListener listener) {
        this.smsListener = listener;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !SMS_RECEIVED.equals(intent.getAction())) {
            return;
        }

        Bundle bundle = intent.getExtras();
        if (bundle == null) {
            return;
        }

        try {
            Object[] pdus = (Object[]) bundle.get("pdus");
            if (pdus == null || pdus.length == 0) {
                return;
            }

            String format = bundle.getString("format");
            
            for (Object pdu : pdus) {
                SmsMessage smsMessage;
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    smsMessage = SmsMessage.createFromPdu((byte[]) pdu, format);
                } else {
                    smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                }

                if (smsMessage != null) {
                    String from = smsMessage.getDisplayOriginatingAddress();
                    String body = smsMessage.getMessageBody();
                    long timestamp = smsMessage.getTimestampMillis();

                    Log.d(TAG, "SMS received from: " + from);
                    
                    if (smsListener != null) {
                        smsListener.onSmsReceived(from, body, timestamp);
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing SMS", e);
        }
    }
}
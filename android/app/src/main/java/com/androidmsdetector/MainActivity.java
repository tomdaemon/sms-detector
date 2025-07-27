package com.androidmsdetector;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {
    private static final int SMS_PERMISSION_CODE = 123;
    private TextView statusText;
    private Button permissionButton;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        statusText = findViewById(R.id.status_text);
        
        checkSmsPermissions();
    }
    
    private void checkSmsPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED) {
            statusText.setText("SMS Detector Active\n✓ Permissions Granted");
        } else {
            statusText.setText("SMS Permissions Required\nTap below to grant permissions");
            requestSmsPermissions();
        }
    }
    
    private void requestSmsPermissions() {
        ActivityCompat.requestPermissions(this,
            new String[]{Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS},
            SMS_PERMISSION_CODE);
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == SMS_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                statusText.setText("SMS Detector Active\n✓ Permissions Granted");
                Toast.makeText(this, "SMS Detection Started!", Toast.LENGTH_SHORT).show();
            } else {
                statusText.setText("SMS Permissions Denied\nApp cannot function without permissions");
            }
        }
    }
}
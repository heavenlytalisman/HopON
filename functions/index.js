const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document('notification_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    if (data.status !== 'pending') return null;

    const message = {
      to: data.token,
      sound: 'default',
      title: data.title,
      body: data.body,
      data: data.data || {},
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      const responseData = await response.json();
      
      return snap.ref.update({
        status: 'completed',
        response: responseData,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
      return snap.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

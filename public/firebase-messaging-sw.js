
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAXCmORg4CKPQD9Tjlv3zzQ0pPd8Vad6Uk",
  authDomain: "utility-canto-485622-n5.firebaseapp.com",
  projectId: "utility-canto-485622-n5",
  storageBucket: "utility-canto-485622-n5.firebasestorage.app",
  messagingSenderId: "89561317448",
  appId: "1:89561317448:web:9fcad6f2bca04d19c0187d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://pub-9f3e455c1df04b5b98df165c6987ccca.r2.dev/Logo/shotabdi%20logo.png',
    badge: 'https://pub-9f3e455c1df04b5b98df165c6987ccca.r2.dev/Logo/shotabdi%20logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

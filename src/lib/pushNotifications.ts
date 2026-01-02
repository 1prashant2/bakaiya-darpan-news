import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';

export const initializePushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only work on native platforms');
    return null;
  }

  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    
    if (permResult.receive !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Listen for registration token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ', token.value);
      // Store token in database or send to server
      savePushToken(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ', error);
    });

    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
      // Handle foreground notification
    });

    // Listen for notification action
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed: ', action);
      // Handle notification tap - navigate to relevant page
      handleNotificationAction(action);
    });

    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return null;
  }
};

const savePushToken = async (token: string) => {
  // Save token to localStorage for now
  // In production, send to your backend
  localStorage.setItem('push_token', token);
  console.log('Push token saved:', token);
};

const handleNotificationAction = (action: ActionPerformed) => {
  const data = action.notification.data;
  
  if (data?.articleSlug) {
    // Navigate to article
    window.location.href = `/article/${data.articleSlug}`;
  } else if (data?.categorySlug) {
    // Navigate to category
    window.location.href = `/category/${data.categorySlug}`;
  }
};

export const getPushToken = () => {
  return localStorage.getItem('push_token');
};

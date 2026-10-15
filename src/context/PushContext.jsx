import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const PushContext = createContext(null);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushProvider({ children }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setIsSubscribed(true);
        setSubscription(sub);
      } else {
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (e) {
      console.warn('Error checking push subscription:', e);
    }
  };

  const subscribeUser = async () => {
    setIsLoading(true);
    setStatusMessage('');
    try {
      if (!isSupported) {
        throw new Error('Web Push is not supported by this browser.');
      }

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        throw new Error('Notification permission was denied. Please allow notifications in browser settings.');
      }

      // Fetch public VAPID key from backend
      const keyData = await api.getVapidPublicKey();
      if (!keyData || !keyData.public_key) {
        throw new Error('Failed to retrieve VAPID public key from backend.');
      }

      const reg = await navigator.serviceWorker.ready;
      const convertedVapidKey = urlBase64ToUint8Array(keyData.public_key);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const subJson = sub.toJSON();

      // Send subscription to backend SQLite
      await api.subscribePush({
        endpoint: sub.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh || '',
          auth: subJson.keys?.auth || ''
        }
      });

      setIsSubscribed(true);
      setSubscription(sub);
      setStatusMessage('Push notifications enabled successfully!');
      return true;
    } catch (err) {
      setStatusMessage(err.message || 'Failed to enable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeUser = async () => {
    setIsLoading(true);
    try {
      if (subscription) {
        await api.unsubscribePush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      setSubscription(null);
      setStatusMessage('Unsubscribed from push notifications.');
    } catch (err) {
      setStatusMessage(err.message || 'Error unsubscribing');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerTestPush = async () => {
    setIsLoading(true);
    setStatusMessage('');
    try {
      const res = await api.sendTestPush(
        'System Push Test',
        'Web Push delivery is operational on your installed PWA!'
      );
      setStatusMessage(res.message || 'Test push notification dispatched.');
      return true;
    } catch (err) {
      setStatusMessage(err.message || 'Failed to trigger test push');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PushContext.Provider
      value={{
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        statusMessage,
        subscribeUser,
        unsubscribeUser,
        triggerTestPush
      }}
    >
      {children}
    </PushContext.Provider>
  );
}

export function usePush() {
  return useContext(PushContext);
}

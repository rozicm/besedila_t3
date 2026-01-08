/**
 * Utility functions for Web Push Notifications
 */

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Register service worker and request notification permission
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/service-worker.js");
    console.log("Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.log("Notifications not supported");
    return "denied";
  }

  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);
  return permission;
}

/**
 * Subscribe to push notifications
 * 
 * NOTE: For production, you need to generate VAPID keys and add them to your environment variables.
 * Generate keys using: npx web-push generate-vapid-keys
 * 
 * Then add to .env:
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
 * VAPID_PRIVATE_KEY=your_private_key (server-side only)
 */
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscriptionData | null> {
  try {
    // For now, we'll use a placeholder. In production, you MUST generate and use real VAPID keys.
    // This is a public demo key - DO NOT use in production!
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
      "BMryGXNHWiWLBKnZSavHLZQhY8Uf2gVLvCrXjT2X-7cqO5YYKWjKXhEqZD1L3MmVuWCB3K7Aj7TN1Q5CfN1q2Q4";

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    console.log("Push subscription:", subscription);

    const subscriptionJson = subscription.toJSON();

    if (!subscriptionJson.keys || !subscriptionJson.endpoint) {
      throw new Error("Invalid subscription");
    }

    return {
      endpoint: subscriptionJson.endpoint,
      p256dh: subscriptionJson.keys.p256dh || "",
      auth: subscriptionJson.keys.auth || "",
    };
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log("Unsubscribed from push notifications");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    return false;
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isPushSubscribed(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    return false;
  }
}

/**
 * Send a test notification (client-side only - for testing)
 */
export function sendTestNotification(title: string, body: string): void {
  if (!("Notification" in window)) {
    console.log("Notifications not supported");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  }
}


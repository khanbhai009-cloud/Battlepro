"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

/**
 * Initializes Device Token Management:
 * Requests Push Notification permissions and saves fcmToken to Firestore.
 */
export function usePushNotifications(userId?: string) {
  useEffect(() => {
    if (!userId) return; // Only bind if user is logged in
    
    // Only run on actual iOS/Android devices using Capacitor
    if (!Capacitor.isNativePlatform()) return;

    const setupFCM = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        // If permission wasn't granted or denied yet, request it
        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }

        // Register with Apple / Google to receive token
        if (permStatus.receive === "granted") {
          // Register causes pushNotificationToken event
          await PushNotifications.register();
        } else {
          console.warn("User denied push notification permissions");
        }
      } catch (error) {
        console.error("Capacitor Push Error:", error);
      }
    };

    setupFCM();

    // Listen for FCM token registration
    const tokenListener = PushNotifications.addListener(
      "registration",
      async (token) => {
        try {
          if (userId && token.value) {
            // Save fcmToken to corresponding Firestore user document
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
              fcmToken: token.value,
              fcmUpdatedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("FCM Token Save Error:", error);
        }
      }
    );

    const errorListener = PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error("FCM Registration Error:", error);
      }
    );

    // Foreground notification received
    const notifListener = PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Foreground Push Received:", notification);
      }
    );

    return () => {
      tokenListener.then((listener) => listener.remove());
      errorListener.then((listener) => listener.remove());
      notifListener.then((listener) => listener.remove());
    };
  }, [userId]);
}

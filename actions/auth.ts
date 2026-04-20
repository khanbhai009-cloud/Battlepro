"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { sendTargetedPushNotification, sendAdminPushNotification } from "@/lib/fcm-server";

/**
 * Trigger 2: When a new user signs up, send a welcome Push Notification to the user,
 * and an alert to the Admin.
 */
export async function registerNewUser(uid: string, email: string, ffName: string) {
  try {
    const adminDb = getAdminDb();
    // Basic user creation (actual Auth is handled by client or another service)
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.set({
      email,
      ffName,
      wallets: { winning: 0, deposit: 0, bonus: 0 },
      role: "user",
      unreadNotificationCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // We can't send a push to the user immediately if they haven't registered
    // their FCM token yet, but we will send it to the admin:
    await sendAdminPushNotification(
      "New Player Joined 🎮",
      `${ffName} (${email}) has just registered on BattleZone Pro.`
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

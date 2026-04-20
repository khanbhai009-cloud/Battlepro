"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";

/**
 * Resets the unread notification count to 0 when users view their notifications.
 */
export async function clearUnreadCount(userId: string) {
  try {
    const adminDb = getAdminDb();
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      unreadNotificationCount: 0,
    });
    return { success: true };
  } catch (error) {
    console.error("Clear Notification Error:", error);
    return { success: false, error: "Failed to reset notification count" };
  }
}

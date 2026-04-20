import { getAdminDb, admin } from "./firebase-admin";

/**
 * Sends FCM push notifications and increments the unread notification count via Admin SDK
 */
export async function sendTargetedPushNotification(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const adminDb = getAdminDb();
    const validTokens: string[] = [];

    // Safely look up user tokens and locally increment unread badge count
    for (const uid of userIds) {
      if (!uid) continue;
      
      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const fcmToken = userDoc.data()?.fcmToken;
        if (fcmToken) {
          validTokens.push(fcmToken);
        }

        // Atomic increment of the unread badge (The "Red Dot" Optimization)
        await userRef.update({
          unreadNotificationCount: admin.firestore.FieldValue.increment(1),
        });
      }
    }

    if (validTokens.length === 0) return { success: true, message: "No valid FCM tokens found" };

    // Server-Side Push Triggers (Admin SDK)
    const response = await admin.messaging().sendEachForMulticast({
      tokens: validTokens,
      notification: {
        title,
        body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        ...data,
      },
    });

    console.log(`FCM Sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    return { success: true, response };

  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return { success: false, error };
  }
}

/**
 * Helper to notify super admins specifically (e.g., for withdrawal requests)
 */
export async function sendAdminPushNotification(title: string, body: string) {
  try {
    const adminDb = getAdminDb();
    const adminsSnap = await adminDb
      .collection("users")
      .where("role", "==", "admin") // Ensure admins have a role field
      .get();

    const adminIds = adminsSnap.docs.map(doc => doc.id);
    if (adminIds.length > 0) {
      return await sendTargetedPushNotification(adminIds, title, body);
    }
  } catch (error) {
    console.error("Admin FCM Error:", error);
  }
}

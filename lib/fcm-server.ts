import { getAdminDb, admin } from "./firebase-admin";

/**
 * Sends FCM push notifications, increments the unread badge count, AND
 * persists a notifications/{id} document per user. The persisted doc is what
 * powers the in-app notification dropdown — so the user always sees the
 * notification even when the device has no FCM token (e.g. web browsers).
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
    const ts = admin.firestore.FieldValue.serverTimestamp();

    for (const uid of userIds) {
      if (!uid) continue;

      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const fcmToken = userDoc.data()?.fcmToken;
        if (fcmToken) validTokens.push(fcmToken);

        // Atomic increment of the unread badge (red dot)
        await userRef.update({
          unreadNotificationCount: admin.firestore.FieldValue.increment(1),
        });
      }

      // Persist for the in-app notification panel — works even without FCM
      await adminDb.collection("notifications").add({
        userId: uid,
        title,
        body,
        read: false,
        data: data ?? {},
        createdAt: ts,
      });
    }

    if (validTokens.length === 0) {
      return { success: true, message: "No valid FCM tokens, in-app saved" };
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens: validTokens,
      notification: { title, body },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        ...data,
      },
    });

    console.log(
      `FCM Sent. Success: ${response.successCount}, Failure: ${response.failureCount}`
    );
    return { success: true, response };
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return { success: false, error };
  }
}

/**
 * Resolves every administrator UID — both legacy `users` docs that already
 * have role:"admin" AND any account whose email appears in `staff_users`
 * (the admin-managed staff list). Then pushes the notification to all of
 * them at once.
 */
export async function sendAdminPushNotification(title: string, body: string) {
  try {
    const adminDb = getAdminDb();

    const [usersSnap, staffSnap] = await Promise.all([
      adminDb.collection("users").where("role", "in", ["admin", "staff"]).get(),
      adminDb.collection("staff_users").get(),
    ]);

    const adminIds = new Set<string>();
    usersSnap.forEach((d) => adminIds.add(d.id));

    // Resolve staff_users emails → users/{uid}
    const staffEmails = staffSnap.docs
      .map((d) => String(d.data()?.email ?? "").toLowerCase())
      .filter(Boolean);

    if (staffEmails.length > 0) {
      // Firestore "in" query supports up to 30 values per query
      for (let i = 0; i < staffEmails.length; i += 30) {
        const chunk = staffEmails.slice(i, i + 30);
        const matched = await adminDb
          .collection("users")
          .where("email", "in", chunk)
          .get();
        matched.forEach((d) => adminIds.add(d.id));
      }
    }

    if (adminIds.size === 0) {
      console.warn("No admin recipients found for push notification");
      return { success: true, message: "No admins" };
    }

    return await sendTargetedPushNotification(Array.from(adminIds), title, body);
  } catch (error) {
    console.error("Admin FCM Error:", error);
    return { success: false, error };
  }
}

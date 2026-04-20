"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { sendAdminPushNotification } from "@/lib/fcm-server";

export async function requestWithdrawal(userId: string, amount: number) {
  try {
    const adminDb = getAdminDb();
    const userRef = adminDb.collection("users").doc(userId);
    
    await adminDb.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");
      
      const wWin = userDoc.data()?.wallets?.winning || 0;
      const ffName = userDoc.data()?.ffName || "Player";
      
      if (wWin < amount) throw new Error("Insufficient Winning Balance");

      // 1. Deduct instantly from winning wallet
      t.update(userRef, {
        "wallets.winning": wWin - amount
      });

      // 2. Create Withdrawal Request
      const widRef = adminDb.collection("withdrawals").doc();
      t.set(widRef, {
        userId,
        amount,
        status: "Pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3. Create Transaction Log
      const txnRef = adminDb.collection("transactions").doc();
      t.set(txnRef, {
        userId,
        type: "Withdrawal Req",
        desc: "Requested Withdrawal",
        amount,
        status: "Pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Trigger 1 (Withdrawal): Send Push Notification to Super Admin's device token
      sendAdminPushNotification(
        "New Withdrawal Request 💰",
        `₹${amount} withdrawal requested by ${ffName}`
      );
    });

    return { success: true };
  } catch (error: any) {
    console.error("Setup error:", error);
    return { success: false, error: error.message };
  }
}

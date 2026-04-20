"use server";

import Razorpay from "razorpay";
import crypto from "crypto";
import { getAdminDb, admin } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createOrder(amount: number, userId: string) {
  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
      },
    };

    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  userId: string,
  amount: number
) {
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Atomic increment of user wallet using Admin SDK
      const adminDb = getAdminDb();
      const userRef = adminDb.collection("users").doc(userId);
      
      await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error("User not found");

        const userData = userDoc.data()!;
        const currentDeposit = userData.wallets?.deposit || 0;

        transaction.update(userRef, {
          "wallets.deposit": currentDeposit + amount,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Log transaction
        const txnRef = adminDb.collection("transactions").doc();
        transaction.set(txnRef, {
          userId,
          type: "Deposit",
          amount,
          method: "Razorpay",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          status: "Success",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      revalidatePath("/wallet");
      return { success: true };
    } else {
      return { success: false, error: "Invalid signature" };
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return { success: false, error: "Payment verification failed" };
  }
}

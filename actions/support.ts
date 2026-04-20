"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { sendAdminPushNotification } from "@/lib/fcm-server";
import { revalidatePath } from "next/cache";

export async function submitSupportTicket(userId: string, subject: string, message: string, category: string) {
  try {
    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(userId).get();
    const ffName = userDoc.data()?.ffName ?? "Player";
    const email = userDoc.data()?.email ?? "";

    const ticketRef = db.collection("supportTickets").doc();
    await ticketRef.set({
      userId,
      ffName,
      email,
      subject,
      message,
      category,
      status: "Open",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendAdminPushNotification(
      "New Support Ticket 🎫",
      `${ffName}: ${subject}`
    );

    return { success: true, ticketId: ticketRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserTickets(userId: string) {
  try {
    const db = getAdminDb();
    const snap = await db.collection("supportTickets")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function getAllTickets() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("supportTickets").orderBy("createdAt", "desc").limit(100).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function updateTicketStatus(ticketId: string, status: string, adminReply?: string) {
  try {
    const db = getAdminDb();
    await db.collection("supportTickets").doc(ticketId).update({
      status,
      ...(adminReply ? { adminReply, repliedAt: admin.firestore.FieldValue.serverTimestamp() } : {}),
    });
    revalidatePath("/admin/support");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

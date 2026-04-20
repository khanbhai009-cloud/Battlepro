"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { sendTargetedPushNotification } from "@/lib/fcm-server";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  try {
    const db = getAdminDb();
    const [usersSnap, tournamentsSnap, withdrawalsSnap, txnSnap] = await Promise.all([
      db.collection("users").where("role", "==", "user").count().get(),
      db.collection("tournaments").where("status", "==", "live").count().get(),
      db.collection("withdrawals").where("status", "==", "Pending").count().get(),
      db.collection("transactions").where("type", "==", "Deposit").where("status", "==", "Success").get(),
    ]);

    const totalRevenue = txnSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0);

    return {
      totalPlayers: usersSnap.data().count,
      liveMatches: tournamentsSnap.data().count,
      pendingWithdrawals: withdrawalsSnap.data().count,
      totalRevenue,
    };
  } catch {
    return { totalPlayers: 0, liveMatches: 0, pendingWithdrawals: 0, totalRevenue: 0 };
  }
}

export async function getPendingWithdrawals() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("withdrawals").where("status", "==", "Pending").orderBy("createdAt", "desc").limit(20).get();
    const withdrawals = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const withUserData = await Promise.all(
      withdrawals.map(async (w) => {
        const userDoc = await db.collection("users").doc(w.userId).get();
        return { ...w, ffName: userDoc.data()?.ffName ?? "Player", email: userDoc.data()?.email ?? "" };
      })
    );
    return withUserData;
  } catch {
    return [];
  }
}

export async function approveWithdrawal(withdrawalId: string) {
  try {
    const db = getAdminDb();
    const wRef = db.collection("withdrawals").doc(withdrawalId);
    const wDoc = await wRef.get();
    if (!wDoc.exists) throw new Error("Withdrawal not found");

    const { userId, amount } = wDoc.data()!;
    await db.runTransaction(async (t) => {
      t.update(wRef, { status: "Approved", approvedAt: admin.firestore.FieldValue.serverTimestamp() });
      const txnRef = db.collection("transactions").doc();
      t.set(txnRef, {
        userId,
        type: "Withdrawal",
        desc: "Withdrawal Approved",
        amount,
        status: "Approved",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await sendTargetedPushNotification([userId], "Withdrawal Approved ✅", `Your ₹${amount} withdrawal has been approved!`);
    revalidatePath("/admin/withdrawals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectWithdrawal(withdrawalId: string) {
  try {
    const db = getAdminDb();
    const wRef = db.collection("withdrawals").doc(withdrawalId);
    const wDoc = await wRef.get();
    if (!wDoc.exists) throw new Error("Not found");

    const { userId, amount } = wDoc.data()!;
    await db.runTransaction(async (t) => {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await t.get(userRef);
      const currentWin = userDoc.data()?.wallets?.winning ?? 0;
      t.update(userRef, { "wallets.winning": currentWin + amount });
      t.update(wRef, { status: "Rejected" });
    });

    await sendTargetedPushNotification([userId], "Withdrawal Rejected ❌", `Your ₹${amount} withdrawal was rejected. Amount refunded.`);
    revalidatePath("/admin/withdrawals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("users").orderBy("createdAt", "desc").limit(100).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const db = getAdminDb();
    await db.collection("users").doc(userId).update({ role });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addBonusToUser(userId: string, amount: number) {
  try {
    const db = getAdminDb();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error("User not found");
    const currentBonus = userDoc.data()?.wallets?.bonus ?? 0;
    await userRef.update({ "wallets.bonus": currentBonus + amount });
    await sendTargetedPushNotification([userId], "Bonus Added 🎁", `₹${amount} bonus has been added to your wallet!`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllTournaments() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("tournaments").orderBy("createdAt", "desc").limit(50).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function createTournament(data: {
  name: string; game: string; mode: string; prize: number;
  fee: number; max: number; status: string; description?: string;
}) {
  try {
    const db = getAdminDb();
    const ref = await db.collection("tournaments").add({
      ...data,
      joinedUsers: [],
      publishRoom: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath("/matches");
    revalidatePath("/admin/tournaments");
    return { success: true, id: ref.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTournamentStatus(tournamentId: string, status: string) {
  try {
    const db = getAdminDb();
    await db.collection("tournaments").doc(tournamentId).update({ status });
    revalidatePath("/matches");
    revalidatePath("/admin/tournaments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTournament(tournamentId: string) {
  try {
    const db = getAdminDb();
    await db.collection("tournaments").doc(tournamentId).delete();
    revalidatePath("/matches");
    revalidatePath("/admin/tournaments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLiveMatches() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("tournaments")
      .where("status", "in", ["live", "upcoming"])
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

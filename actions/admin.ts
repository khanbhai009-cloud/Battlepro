"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { sendTargetedPushNotification } from "@/lib/fcm-server";
import { revalidatePath } from "next/cache";

// ─── Helper: invalidate the entire Next.js cache across all panels ───────────
function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function getAdminStats() {
  try {
    const db = getAdminDb();
    const [usersSnap, tournamentsSnap, liveSnap, withdrawalsSnap, staffSnap, txnSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("tournaments").get(),
      db.collection("tournaments").where("status", "in", ["live", "Ongoing", "upcoming", "Upcoming"]).count().get(),
      db.collection("withdrawals").where("status", "==", "Pending").count().get(),
      db.collection("staff_users").get(),
      db.collection("transactions").where("type", "==", "Deposit").where("status", "==", "Success").get(),
    ]);

    const totalRevenue = txnSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0);
    let vipCount = 0;
    usersSnap.forEach((d) => {
      const data = d.data();
      if (data.vipExpiry && new Date() < new Date(data.vipExpiry)) vipCount++;
    });

    return {
      totalPlayers: usersSnap.size,
      totalMatches: tournamentsSnap.size,
      liveMatches: liveSnap.data().count,
      pendingWithdrawals: withdrawalsSnap.data().count,
      totalRevenue,
      totalStaff: staffSnap.size,
      totalVip: vipCount,
    };
  } catch {
    return { totalPlayers: 0, totalMatches: 0, liveMatches: 0, pendingWithdrawals: 0, totalRevenue: 0, totalStaff: 0, totalVip: 0 };
  }
}

export async function getPendingWithdrawals() {
  try {
    const db = getAdminDb();
    // Avoid composite index — filter by status only, sort in memory.
    const snap = await db.collection("withdrawals").where("status", "==", "Pending").limit(50).get();
    const withdrawals = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    withdrawals.sort((a, b) => {
      const av = a.createdAt?._seconds ?? a.createdAt?.seconds ?? 0;
      const bv = b.createdAt?._seconds ?? b.createdAt?.seconds ?? 0;
      return bv - av;
    });

    const withUserData = await Promise.all(
      withdrawals.map(async (w) => {
        const userDoc = await db.collection("users").doc(w.userId).get();
        return { ...w, ffName: userDoc.data()?.ffName ?? "Player", email: userDoc.data()?.email ?? "", upiId: userDoc.data()?.upiId ?? "", bankDetails: userDoc.data()?.bankDetails };
      })
    );
    return JSON.parse(JSON.stringify(withUserData));
  } catch (err) {
    console.error("getPendingWithdrawals error:", err);
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

    await sendTargetedPushNotification([userId], "Withdrawal Approved ✅", `Your 🪙${amount} withdrawal has been approved!`);
    revalidateAll();
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

    await sendTargetedPushNotification([userId], "Withdrawal Rejected ❌", `Your 🪙${amount} withdrawal was rejected. Amount refunded.`);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("users").orderBy("createdAt", "desc").limit(200).get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const db = getAdminDb();
    await db.collection("users").doc(userId).update({ role });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function blockUnblockUser(userId: string, status: string) {
  try {
    const db = getAdminDb();
    await db.collection("users").doc(userId).update({ status });
    revalidateAll();
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
    await db.collection("transactions").add({
      userId,
      type: "Admin Bonus",
      desc: `Admin added 🪙${amount} bonus`,
      amount,
      status: "Success",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await sendTargetedPushNotification([userId], "Bonus Added 🎁", `🪙${amount} bonus has been added to your wallet!`);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function grantVipToUser(userId: string, days: number) {
  try {
    const db = getAdminDb();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    await db.collection("users").doc(userId).update({ vipExpiry: expiry.toISOString() });
    await sendTargetedPushNotification([userId], "VIP Activated 👑", `You have been granted VIP for ${days} days!`);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllTournaments() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("tournaments").orderBy("createdAt", "desc").limit(100).get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function createTournament(data: Record<string, any>) {
  try {
    const db = getAdminDb();
    const ref = await db.collection("tournaments").add({
      ...data,
      joinedUsers: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidateAll();
    return { success: true, id: ref.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTournament(id: string, data: Record<string, any>) {
  try {
    const db = getAdminDb();
    await db.collection("tournaments").doc(id).update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTournamentStatus(tournamentId: string, status: string) {
  try {
    const db = getAdminDb();
    await db.collection("tournaments").doc(tournamentId).update({ status });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTournament(tournamentId: string) {
  try {
    const db = getAdminDb();
    const tDoc = await db.collection("tournaments").doc(tournamentId).get();
    if (tDoc.exists) {
      const joinedUsers: any[] = tDoc.data()?.joinedUsers ?? [];
      for (const u of joinedUsers) {
        const uRef = db.collection("users").doc(u.userDocId);
        const uDoc = await uRef.get();
        if (uDoc.exists) {
          const fee = tDoc.data()?.fee ?? 0;
          const currentDep = uDoc.data()?.wallets?.deposit ?? 0;
          await uRef.update({ "wallets.deposit": currentDep + fee });
          await db.collection("transactions").add({
            userId: u.userDocId,
            type: "Match Refund",
            desc: `Refund: ${tDoc.data()?.name}`,
            amount: fee,
            status: "Success",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }
    await db.collection("tournaments").doc(tournamentId).delete();
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLiveMatches() {
  try {
    const db = getAdminDb();
    // Avoid composite-index requirement: fetch recent tournaments and filter
    // in memory (case-insensitively). This is what was causing the staff panel
    // to silently return [].
    const snap = await db.collection("tournaments").orderBy("createdAt", "desc").limit(200).get();
    const allowed = new Set(["live", "upcoming", "ongoing"]);
    const filtered = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as any)
      .filter((m) => allowed.has(String(m.status ?? "").toLowerCase()));
    return JSON.parse(JSON.stringify(filtered));
  } catch (err) {
    console.error("getLiveMatches error:", err);
    return [];
  }
}

// Prize Distribution
export async function getOngoingMatchesForPrize() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("tournaments")
      .where("status", "in", ["Ongoing", "live"])
      .get();
    return JSON.parse(JSON.stringify(
      snap.docs.map((d) => ({ id: d.id, name: d.data().name, joinedUsers: d.data().joinedUsers ?? [], perKill: d.data().perKill ?? 0 }))
    ));
  } catch {
    return [];
  }
}

export async function creditMatchWinnings(matchId: string, results: { userId: string; kills: number; rankPrize: number; extra: number; total: number }[], staffEmail?: string) {
  try {
    const db = getAdminDb();
    const tRef = db.collection("tournaments").doc(matchId);
    const tDoc = await tRef.get();
    if (!tDoc.exists) throw new Error("Match not found");
    const matchName = tDoc.data()?.name ?? "Match";

    for (const r of results) {
      if (r.total <= 0) continue;
      const uRef = db.collection("users").doc(r.userId);
      const uDoc = await uRef.get();
      if (!uDoc.exists) continue;
      const currentWin = uDoc.data()?.wallets?.winning ?? 0;
      const currentMonthWin = uDoc.data()?.currentMonthWinnings ?? 0;
      await uRef.update({
        "wallets.winning": currentWin + r.total,
        currentMonthWinnings: currentMonthWin + r.total,
      });
      await db.collection("transactions").add({
        userId: r.userId,
        type: "Prize Distribution",
        desc: `Prize: ${matchName} | Kills: ${r.kills} | Rank: 🪙${r.rankPrize} | Extra: 🪙${r.extra}`,
        amount: r.total,
        status: "Success",
        matchName,
        staffEmail: staffEmail ?? "ADMIN",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await sendTargetedPushNotification([r.userId], "Prize Credited 🏆", `🪙${r.total} prize credited for ${matchName}!`);
    }

    await tRef.update({ status: "Results", closedAt: admin.firestore.FieldValue.serverTimestamp() });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Banners
export async function getBanners() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("admin_banners").orderBy("createdAt", "desc").get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function saveBanner(data: { url: string; link?: string }, editId?: string) {
  try {
    const db = getAdminDb();
    if (editId) {
      await db.collection("admin_banners").doc(editId).update({ url: data.url, link: data.link ?? "" });
    } else {
      await db.collection("admin_banners").add({ url: data.url, link: data.link ?? "", createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBanner(id: string) {
  try {
    const db = getAdminDb();
    await db.collection("admin_banners").doc(id).delete();
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Game Categories
export async function getGameCategories() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("admin_games").get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function saveGameCategory(data: { name: string; url: string }, editId?: string) {
  try {
    const db = getAdminDb();
    if (editId) {
      await db.collection("admin_games").doc(editId).update(data);
    } else {
      await db.collection("admin_games").add({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGameCategory(id: string) {
  try {
    const db = getAdminDb();
    await db.collection("admin_games").doc(id).delete();
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// App Schedule
export async function getAppSchedule() {
  try {
    const db = getAdminDb();
    const doc = await db.collection("settings").doc("appStatus").get();
    return doc.exists ? JSON.parse(JSON.stringify(doc.data())) : { status: "open", message: "" };
  } catch {
    return { status: "open", message: "" };
  }
}

export async function saveAppSchedule(data: { status: string; message: string; start?: string; end?: string }) {
  try {
    const db = getAdminDb();
    await db.collection("settings").doc("appStatus").set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Staff Management
export async function getStaffUsers() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("staff_users").orderBy("createdAt", "desc").get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function createStaffUser(data: { name: string; email: string; password: string }) {
  try {
    const db = getAdminDb();
    const existing = await db.collection("staff_users").where("email", "==", data.email).get();
    if (!existing.empty) throw new Error("Email already exists");
    // Every staff_user document is automatically granted the "admin" role so the
    // login flow can resolve it correctly and stop the "Access Denied" error.
    await db.collection("staff_users").add({
      ...data,
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStaffUser(id: string, data: { name: string; email: string; password: string }) {
  try {
    const db = getAdminDb();
    // Preserve the auto-injected "admin" role on every update.
    await db.collection("staff_users").doc(id).update({ ...data, role: "admin" });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStaffUser(id: string) {
  try {
    const db = getAdminDb();
    await db.collection("staff_users").doc(id).delete();
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Notifications
export async function sendNotification(data: { title: string; body: string; targetUserId?: string; redeemCode?: string }) {
  try {
    const db = getAdminDb();
    if (data.targetUserId) {
      await db.collection("notifications").add({
        userId: data.targetUserId,
        title: data.title,
        body: data.body,
        redeemCode: data.redeemCode ?? "",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await sendTargetedPushNotification([data.targetUserId], data.title, data.body);
    } else {
      const usersSnap = await db.collection("users").get();
      const batch = db.batch();
      const uids: string[] = [];
      usersSnap.forEach((d) => {
        uids.push(d.id);
        const nRef = db.collection("notifications").doc();
        batch.set(nRef, {
          userId: d.id,
          title: data.title,
          body: data.body,
          redeemCode: data.redeemCode ?? "",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      for (let i = 0; i < uids.length; i += 100) {
        await sendTargetedPushNotification(uids.slice(i, i + 100), data.title, data.body);
      }
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Transaction History
export async function searchUserTransactions(userIdOrEmail: string) {
  try {
    const db = getAdminDb();
    let uid = userIdOrEmail.trim();
    if (uid.includes("@")) {
      const usersSnap = await db.collection("users").where("email", "==", uid).limit(1).get();
      if (!usersSnap.empty) uid = usersSnap.docs[0].id;
    }
    // Avoid composite index — filter by userId only, sort in memory.
    const snap = await db.collection("transactions").where("userId", "==", uid).limit(100).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    items.sort((a, b) => {
      const av = a.createdAt?._seconds ?? a.createdAt?.seconds ?? 0;
      const bv = b.createdAt?._seconds ?? b.createdAt?.seconds ?? 0;
      return bv - av;
    });
    return JSON.parse(JSON.stringify(items.slice(0, 50)));
  } catch (err) {
    console.error("searchUserTransactions error:", err);
    return [];
  }
}

export async function getAllTransactions() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("transactions").orderBy("createdAt", "desc").limit(100).get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

// Leaderboard
export async function getLeaderboard() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("users").orderBy("currentMonthWinnings", "desc").limit(20).get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

// General Settings
export async function getGeneralSettings() {
  try {
    const db = getAdminDb();
    const [genDoc, socialDoc, withdrawDoc, referralDoc, pricingDoc] = await Promise.all([
      db.collection("settings").doc("general").get(),
      db.collection("settings").doc("socials").get(),
      db.collection("settings").doc("withdrawLimits").get(),
      db.collection("settings").doc("referral").get(),
      db.collection("settings").doc("pricing").get(),
    ]);
    return JSON.parse(JSON.stringify({
      general: genDoc.exists ? genDoc.data() : {},
      socials: socialDoc.exists ? socialDoc.data() : {},
      withdrawLimits: withdrawDoc.exists ? withdrawDoc.data() : { min: 100, max: 10000 },
      referral: referralDoc.exists ? referralDoc.data() : { bonusAmount: 10 },
      pricing: pricingDoc.exists ? pricingDoc.data() : {},
    }));
  } catch {
    return { general: {}, socials: {}, withdrawLimits: { min: 100, max: 10000 }, referral: { bonusAmount: 10 }, pricing: {} };
  }
}

export async function saveGeneralSettings(section: string, data: Record<string, any>) {
  try {
    const db = getAdminDb();
    await db.collection("settings").doc(section).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Redeem Codes
export async function getRedeemCodes() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("redeem_codes").orderBy("createdAt", "desc").get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function createRedeemCode(data: { code: string; amount: number; maxUses: number; expiresAt?: string }) {
  try {
    const db = getAdminDb();
    await db.collection("redeem_codes").add({
      ...data,
      usedCount: 0,
      usedBy: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRedeemCode(id: string) {
  try {
    const db = getAdminDb();
    await db.collection("redeem_codes").doc(id).delete();
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

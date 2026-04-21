"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { sendTargetedPushNotification } from "@/lib/fcm-server";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function joinMatch(matchId: string, userId: string, slot: number, ffName: string, ffUid: string) {
  try {
    const adminDb = getAdminDb();
    const matchRef = adminDb.collection("tournaments").doc(matchId);
    const userRef = adminDb.collection("users").doc(userId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const matchDoc = await transaction.get(matchRef);
      const userDoc = await transaction.get(userRef);

      if (!matchDoc.exists) throw new Error("Match not found");
      if (!userDoc.exists) throw new Error("User not found");

      const matchData = matchDoc.data()!;
      const userData = userDoc.data()!;

      const joinedUsers = matchData.joinedUsers || [];
      const entryFee = Number(matchData.fee);

      if (joinedUsers.length >= matchData.max) throw new Error("Match is full");
      if (joinedUsers.some((u: any) => u.slot === slot)) throw new Error(`Slot ${slot} is already taken`);
      if (joinedUsers.some((u: any) => u.userDocId === userId)) throw new Error("You have already joined this match");

      // Wallet deduction — max 40% from bonus, rest from deposit/winning
      const wDep = Number(userData.wallets?.deposit || 0);
      const wWin = Number(userData.wallets?.winning || 0);
      const wBon = Number(userData.wallets?.bonus || 0);

      const maxBonusAllowed = entryFee * 0.40;
      const bonusToUse = Math.min(wBon, maxBonusAllowed);
      const remainingFee = entryFee - bonusToUse;

      if ((wDep + wWin) < remainingFee) throw new Error("Insufficient balance");

      let newDep = wDep;
      let newWin = wWin;
      let newBon = wBon - bonusToUse;
      let remFee = remainingFee;

      if (newDep >= remFee) {
        newDep -= remFee;
        remFee = 0;
      } else {
        remFee -= newDep;
        newDep = 0;
        newWin -= remFee;
      }

      transaction.update(userRef, {
        "wallets.deposit": newDep,
        "wallets.winning": newWin,
        "wallets.bonus": newBon,
      });

      const newPlayer = {
        userDocId: userId,
        ffName,
        ffUid,
        slot,
        joinedAt: new Date().toISOString(),
      };

      transaction.update(matchRef, {
        joinedUsers: admin.firestore.FieldValue.arrayUnion(newPlayer),
      });

      const txnRef = adminDb.collection("transactions").doc();
      transaction.set(txnRef, {
        userId,
        type: "Match Entry",
        desc: `Joined ${matchData.name} (Slot ${slot})`,
        amount: entryFee,
        status: "Success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    });

    // Purge cache for all panels so wallet balances and match slots reflect immediately
    revalidateAll();
    return result;
  } catch (error: any) {
    console.error("Join Match Error:", error);
    return { success: false, error: error.message || "Failed to join match" };
  }
}

export async function updateMatchRoomDetails(matchId: string, roomId: string, roomPass: string) {
  try {
    const adminDb = getAdminDb();
    const matchRef = adminDb.collection("tournaments").doc(matchId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const matchDoc = await transaction.get(matchRef);
      if (!matchDoc.exists) throw new Error("Match not found");
      const matchData = matchDoc.data()!;

      transaction.update(matchRef, {
        roomId,
        roomPass,
        publishRoom: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, matchName: matchData.name, participants: matchData.joinedUsers || [] };
    });

    if (result.success && result.participants.length > 0) {
      const participantUids = result.participants.map((u: any) => u.userDocId);
      await sendTargetedPushNotification(
        participantUids,
        `Room Ready: ${result.matchName} 🎮`,
        `Room ID: ${roomId} | Pass: ${roomPass}. Good luck!`
      );
    }

    revalidateAll();
    return { success: true };
  } catch (error: any) {
    console.error("Update Match Room Error:", error);
    return { success: false, error: error.message };
  }
}

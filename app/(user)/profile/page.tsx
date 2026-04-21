import { getAdminDb } from "@/lib/firebase-admin";
import { formatCurrency } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { destroySession } from "@/actions/session";
import { Trophy, Wallet, Star, GamepadIcon, LogOut, Gift } from "lucide-react";

async function getUserData(uid: string) {
  try {
    const db = getAdminDb();
    const [userDoc, txnSnap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("transactions").where("userId", "==", uid).orderBy("createdAt", "desc").limit(10).get(),
    ]);

    if (!userDoc.exists) return null;

    const transactions = txnSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    return { uid, ...userDoc.data(), transactions } as any;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;

  if (!uid) redirect("/login");

  const user = await getUserData(uid);

  const totalWinnings = user?.wallets?.winning ?? 0;
  const depositBalance = user?.wallets?.deposit ?? 0;
  const bonusBalance = user?.wallets?.bonus ?? 0;
  const totalBalance = totalWinnings + depositBalance + bonusBalance;
  const matchesPlayed = user?.totalMatches ?? 0;
  const level = Math.floor(matchesPlayed / 10) + 1;

  return (
    <div className="space-y-5 max-w-2xl">

      <div className="card-base flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black shrink-0">
          {(user?.ffName ?? user?.email ?? "P")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate flex items-center gap-2">
            {user?.ffName ?? "Mysterious Warrior"}
          </h1>
          <p className="text-sm text-muted truncate">{user?.email ?? uid}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-widest">
              <Star size={10} className="fill-primary text-primary" />Level {level}
            </span>
            <span className="text-border text-xs">·</span>
            <span className="text-[11px] font-bold text-muted uppercase tracking-widest capitalize">{user?.role ?? "Player"}</span>
            {user?.referralCode && (
              <><span className="text-border text-xs">·</span>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1"><Gift size={10} /> {user.referralCode}</span></>
            )}
          </div>
        </div>
        <form action={destroySession}>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border border-red-100">
            <LogOut size={15} />Logout
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Balance", value: formatCurrency(totalBalance), icon: Wallet, color: "text-primary" },
          { label: "Total Winnings", value: formatCurrency(totalWinnings), icon: Trophy, color: "text-amber-500" },
          { label: "Matches Played", value: String(matchesPlayed), icon: GamepadIcon, color: "text-green-600" },
          { label: "Player Level", value: `Lv. ${level}`, icon: Star, color: "text-purple-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-base text-center py-4">
              <Icon size={18} className={`mx-auto mb-2 ${stat.color}`} />
              <div className="text-base font-black text-foreground">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Wallet Breakdown */}
      <div className="card-base">
        <h2 className="font-bold mb-4 text-foreground">Wallet Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Winning Balance", value: totalWinnings, color: "bg-primary", note: "Withdrawable" },
            { label: "Deposit Balance", value: depositBalance, color: "bg-blue-400", note: "For match entry" },
            { label: "Bonus Balance", value: bonusBalance, color: "bg-amber-400", note: "Max 40% per match" },
          ].map((w, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${w.color}`} />
                <div>
                  <div className="text-sm font-bold text-foreground">{w.label}</div>
                  <div className="text-[11px] text-muted">{w.note}</div>
                </div>
              </div>
              <div className="text-sm font-black text-foreground">{formatCurrency(w.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-base">
        <h2 className="font-bold mb-4 text-foreground">Recent Transactions</h2>

        {!user?.transactions || user.transactions.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            No transactions yet. Join a match to get started!
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {user.transactions.map((txn: any) => {
              const isCredit = ["Deposit", "Winning"].includes(txn.type);
              return (
                <div key={txn.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{txn.type}</div>
                    {txn.desc && (
                      <div className="text-xs text-muted truncate mt-0.5">{txn.desc}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-4">
                    <span className={`text-sm font-black ${isCredit ? "text-green-600" : "text-foreground"}`}>
                      {isCredit ? "+" : "−"}{formatCurrency(txn.amount ?? 0)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${
                      txn.status === "Success" ? "text-green-500" : 
                      txn.status === "Pending" ? "text-amber-500" : "text-red-500"
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

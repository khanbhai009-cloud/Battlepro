"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Wallet, Star, GamepadIcon } from "lucide-react";

export type ProfileInitialData = {
  winning: number;
  deposit: number;
  bonus: number;
  totalMatches: number;
};

export default function ProfileSection({
  uid,
  initialData,
}: {
  uid: string;
  initialData: ProfileInitialData;
}) {
  const [data, setData] = useState<ProfileInitialData>(initialData);

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = snap.data() as any;
        if (!d) return;
        setData({
          winning: Number(d?.wallets?.winning ?? d?.balance ?? d?.wallet ?? 0),
          deposit: Number(d?.wallets?.deposit ?? 0),
          bonus: Number(d?.wallets?.bonus ?? 0),
          totalMatches: Number(d?.totalMatches ?? 0),
        });
      },
      () => {
        // Permission/network errors — keep showing initial server data.
      }
    );
    return () => unsub();
  }, [uid]);

  const totalBalance = data.winning + data.deposit + data.bonus;
  const level = Math.floor(data.totalMatches / 10) + 1;

  const stats = [
    { label: "Total Balance", value: formatCurrency(totalBalance), icon: Wallet, color: "text-primary" },
    { label: "Total Winnings", value: formatCurrency(data.winning), icon: Trophy, color: "text-amber-500" },
    { label: "Matches Played", value: String(data.totalMatches), icon: GamepadIcon, color: "text-green-600" },
    { label: "Player Level", value: `Lv. ${level}`, icon: Star, color: "text-purple-500" },
  ];

  const wallets = [
    { label: "Winning Balance", value: data.winning, color: "bg-primary", note: "Withdrawable" },
    { label: "Deposit Balance", value: data.deposit, color: "bg-blue-400", note: "For match entry" },
    { label: "Bonus Balance", value: data.bonus, color: "bg-amber-400", note: "Max 40% per match" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
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

      <div className="card-base">
        <h2 className="font-bold mb-4 text-foreground">Wallet Breakdown</h2>
        <div className="space-y-3">
          {wallets.map((w, i) => (
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
    </>
  );
}

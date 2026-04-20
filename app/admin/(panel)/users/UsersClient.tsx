"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { updateUserRole, addBonusToUser } from "@/actions/admin";
import { Loader2, Search, Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";

const roles = ["user", "staff", "admin"];

interface User {
  id: string;
  ffName?: string;
  email?: string;
  role?: string;
  wallets?: { winning?: number; deposit?: number; bonus?: number };
  totalMatches?: number;
}

export function UsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bonusModal, setBonusModal] = useState<{ userId: string; name: string } | null>(null);
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusLoading, setBonusLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    (u.ffName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, role: string) => {
    setLoadingId(userId);
    await updateUserRole(userId, role);
    setLoadingId(null);
    window.location.reload();
  };

  const handleAddBonus = async () => {
    if (!bonusModal || !bonusAmount) return;
    setBonusLoading(true);
    const result = await addBonusToUser(bonusModal.userId, Number(bonusAmount));
    setBonusLoading(false);
    if (result.success) {
      setMsg(`₹${bonusAmount} bonus added to ${bonusModal.name}`);
      setBonusModal(null);
      setBonusAmount("");
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 border border-green-200 text-green-700">{msg}</div>}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" className="auth-input pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="text-xs text-muted font-medium">{filtered.length} users found</div>

      <div className="space-y-2">
        {filtered.map((user) => {
          const totalBalance = (user.wallets?.winning ?? 0) + (user.wallets?.deposit ?? 0) + (user.wallets?.bonus ?? 0);
          return (
            <div key={user.id} className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                  {(user.ffName ?? user.email ?? "P")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground truncate">{user.ffName ?? "—"}</div>
                  <div className="text-xs text-muted truncate">{user.email ?? user.id}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black text-foreground">{formatCurrency(totalBalance)}</div>
                  <div className="text-[10px] text-muted font-bold uppercase">Balance</div>
                </div>
                <button
                  onClick={() => setBonusModal({ userId: user.id, name: user.ffName ?? "User" })}
                  className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                  title="Add Bonus"
                >
                  <Gift size={15} />
                </button>
                <select
                  className="text-xs border border-border rounded-lg px-2 py-1.5 font-bold bg-white"
                  value={user.role ?? "user"}
                  disabled={loadingId === user.id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  {roles.map((r) => <option key={r}>{r}</option>)}
                </select>
                {loadingId === user.id && <Loader2 size={14} className="animate-spin text-primary" />}
              </div>
            </div>
          );
        })}
      </div>

      {bonusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold">Add Bonus to {bonusModal.name}</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Amount (₹)</label>
              <input type="number" className="auth-input" placeholder="e.g. 50" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleAddBonus} disabled={bonusLoading}>
                {bonusLoading ? <Loader2 size={14} className="animate-spin" /> : "Add Bonus"}
              </Button>
              <button onClick={() => setBonusModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm font-bold text-muted hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

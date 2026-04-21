"use client";

import { useState } from "react";
import { updateUserRole, addBonusToUser, blockUnblockUser, grantVipToUser } from "@/actions/admin";
import { Loader2, Search, Gift, Crown, ShieldOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bonusModal, setBonusModal] = useState<{ userId: string; name: string } | null>(null);
  const [vipModal, setVipModal] = useState<{ userId: string; name: string } | null>(null);
  const [bonusAmount, setBonusAmount] = useState("");
  const [vipDays, setVipDays] = useState("30");
  const [bonusLoading, setBonusLoading] = useState(false);
  const [vipLoading, setVipLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    (u.ffName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.id ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, role: string) => {
    setLoadingId(userId);
    await updateUserRole(userId, role);
    setLoadingId(null);
    window.location.reload();
  };

  const handleBlockToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Blocked" ? "Active" : "Blocked";
    if (!confirm(`${newStatus} this user?`)) return;
    setLoadingId(userId);
    await blockUnblockUser(userId, newStatus);
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
      setBonusModal(null); setBonusAmount("");
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleGrantVip = async () => {
    if (!vipModal) return;
    setVipLoading(true);
    const result = await grantVipToUser(vipModal.userId, Number(vipDays));
    setVipLoading(false);
    if (result.success) {
      setMsg(`VIP granted to ${vipModal.name} for ${vipDays} days!`);
      setVipModal(null); setVipDays("30");
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 border border-green-200 text-green-700">{msg}</div>}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" className="auth-input pl-9" placeholder="Search by name, email, or UID..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <p className="text-xs text-muted">{filtered.length} users found</p>

      <div className="space-y-2">
        {filtered.map((user) => {
          const total = (user.wallets?.winning ?? 0) + (user.wallets?.deposit ?? 0) + (user.wallets?.bonus ?? 0);
          const isVip = user.vipExpiry && new Date() < new Date(user.vipExpiry);
          const isBlocked = user.status === "Blocked";
          return (
            <div key={user.id} className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                  {(user.avatar && !user.avatar.startsWith("http")) ? user.avatar : (user.ffName ?? "P")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground flex items-center gap-1 flex-wrap">
                    {user.ffName ?? "—"}
                    {isVip && <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">VIP 👑</span>}
                    {isBlocked && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">Blocked</span>}
                  </div>
                  <div className="text-xs text-muted truncate">{user.email}</div>
                  <div className="text-[10px] text-muted font-mono">{user.id?.substring(0, 12)}...</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black text-foreground">₹{total}</div>
                  <div className="text-[9px] text-muted">W:{user.wallets?.winning ?? 0} D:{user.wallets?.deposit ?? 0} B:{user.wallets?.bonus ?? 0}</div>
                </div>
                <button onClick={() => setBonusModal({ userId: user.id, name: user.ffName ?? "User" })} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50" title="Add Bonus">
                  <Gift size={14} />
                </button>
                <button onClick={() => setVipModal({ userId: user.id, name: user.ffName ?? "User" })} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50" title="Grant VIP">
                  <Crown size={14} />
                </button>
                <button onClick={() => handleBlockToggle(user.id, user.status ?? "Active")} disabled={loadingId === user.id} className={`p-1.5 rounded-lg ${isBlocked ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50"}`} title={isBlocked ? "Unblock" : "Block"}>
                  {loadingId === user.id ? <Loader2 size={14} className="animate-spin" /> : isBlocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                </button>
                <select className="text-xs border border-border rounded-lg px-2 py-1.5 font-bold bg-white" value={user.role ?? "user"} disabled={loadingId === user.id} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                  {["user", "staff", "admin"].map((r) => <option key={r}>{r}</option>)}
                </select>
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
              <button onClick={() => setBonusModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm font-bold text-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {vipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Crown size={16} className="text-amber-500" /> Grant VIP to {vipModal.name}</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Duration (Days)</label>
              <div className="grid grid-cols-4 gap-2">
                {["7", "14", "30", "90"].map((d) => (
                  <button key={d} onClick={() => setVipDays(d)} className={`py-2 rounded-lg text-sm font-bold border ${vipDays === d ? "bg-amber-500 text-white border-amber-500" : "border-border text-muted"}`}>{d}d</button>
                ))}
              </div>
              <input type="number" className="auth-input mt-2" placeholder="Custom days" value={vipDays} onChange={(e) => setVipDays(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleGrantVip} disabled={vipLoading}>
                {vipLoading ? <Loader2 size={14} className="animate-spin" /> : "Grant VIP 👑"}
              </Button>
              <button onClick={() => setVipModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm font-bold text-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

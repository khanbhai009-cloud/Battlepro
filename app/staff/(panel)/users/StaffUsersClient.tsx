"use client";
import { useState } from "react";
import { blockUnblockUser } from "@/actions/admin";
import { Search, Users } from "lucide-react";

export function StaffUsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    (u.ffName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.id ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleBlock = async (uid: string, current: string) => {
    const newStatus = current === "Blocked" ? "Active" : "Blocked";
    if (!confirm(`${newStatus === "Blocked" ? "Block" : "Unblock"} this user?`)) return;
    await blockUnblockUser(uid, newStatus);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="auth-input pl-9" placeholder="Search by name, email, or UID..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <p className="text-xs text-muted">{filtered.length} users found</p>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Player</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Balance</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 text-muted">
                <Users size={32} className="mx-auto mb-2 text-gray-200" />
                No users found.
              </td></tr>
            ) : filtered.map((u) => {
              const total = (u.wallets?.winning ?? 0) + (u.wallets?.deposit ?? 0) + (u.wallets?.bonus ?? 0);
              const isVip = u.vipExpiry && new Date() < new Date(u.vipExpiry);
              const isBlocked = u.status === "Blocked";
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">{(u.ffName ?? "P")[0].toUpperCase()}</div>
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-1">
                          {u.ffName ?? "Player"}
                          {isVip && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">VIP 👑</span>}
                        </div>
                        <div className="text-xs text-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">₹{total}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleBlock(u.id, u.status ?? "Active")} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isBlocked ? "bg-red-100 text-red-600 border-red-200" : "bg-green-100 text-green-700 border-green-200"}`}>
                      {isBlocked ? "Blocked" : "Active"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

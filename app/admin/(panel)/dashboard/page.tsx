import { Banknote, Users, Trophy, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAdminStats, getPendingWithdrawals } from "@/actions/admin";
import { approveWithdrawal, rejectWithdrawal } from "@/actions/admin";
import { WithdrawalActions } from "./WithdrawalActions";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [stats, withdrawals] = await Promise.all([
    getAdminStats(),
    getPendingWithdrawals(),
  ]);

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { label: "Active Players", value: stats.totalPlayers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Live Matches", value: String(stats.liveMatches), icon: Trophy, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Pending Withdrawals", value: String(stats.pendingWithdrawals), icon: Banknote, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Overview</h1>
        <p className="text-muted text-sm font-medium">Live system performance and metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <div className="text-2xl font-black mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="font-bold">Pending Withdrawals</h2>
          <a href="/admin/withdrawals" className="text-xs font-bold text-primary hover:underline">View All</a>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm font-medium">No pending withdrawals. All clear! ✅</div>
        ) : (
          <div className="divide-y divide-border">
            {withdrawals.slice(0, 5).map((w: any) => (
              <div key={w.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {w.ffName}
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{w.email}</span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">UPI / Bank details needed for manual transfer</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-black text-foreground">{formatCurrency(w.amount)}</div>
                  <WithdrawalActions withdrawalId={w.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

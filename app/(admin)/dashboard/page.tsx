import { Banknote, Users, Trophy, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
        <p className="text-muted text-sm font-medium">System performance and active metrics.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(1250400), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
          { label: "Active Players", value: "2,845", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Live Matches", value: "14", icon: Trophy, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Pending Withdrawals", value: "32", icon: Banknote, color: "text-purple-600", bg: "bg-purple-100" },
        ].map((stat, i) => {
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

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Pending Withdrawals */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h2 className="font-bold">Urgent Withdrawals</h2>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border">
            {[
              { id: "W-9284", user: "Rishi Pro", amt: 1500, time: "10 mins ago" },
              { id: "W-9285", user: "GamerBoy99", amt: 500, time: "45 mins ago" },
              { id: "W-9286", user: "ToxicSniper", amt: 2500, time: "2 hours ago" },
            ].map((w) => (
              <div key={w.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {w.user} <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{w.id}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Requested {w.time}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-black text-foreground">{formatCurrency(w.amt)}</div>
                  <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: System Status */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <h2 className="font-bold mb-6">System Health</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Firestore Reads (Free Tier)</span>
                <span className="text-amber-600">42K / 50K</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[84%] bg-amber-500 h-full rounded-full"></div>
              </div>
              <p className="text-[10px] text-muted mt-2 font-medium">Approaching daily Spark plan limit. Consider enabling Maintenance Mode.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Capacitor Push Delivery Rate</span>
                <span className="text-green-600">99.8%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[99.8%] bg-green-500 h-full rounded-full"></div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <button className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-700 py-3 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors">
                Enable Maintenance Mode
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { Trophy, Clock, CheckCircle2 } from "lucide-react";

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Staff Dashboard</h1>
        <p className="text-muted text-sm">Manage matches and update room credentials.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Live Matches", value: "3", icon: Trophy, color: "text-green-600", bg: "bg-green-100" },
          { label: "Pending Room IDs", value: "5", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Completed Today", value: "12", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-base shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={stat.color} />
              </div>
              <div className="text-2xl font-black text-foreground mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="card-base shadow-sm">
        <h2 className="font-bold mb-3 text-foreground">Pending Room Updates</h2>
        <p className="text-sm text-muted">
          Match Room ID management coming soon. Use the Matches tab to update credentials and trigger player notifications.
        </p>
      </div>
    </div>
  );
}

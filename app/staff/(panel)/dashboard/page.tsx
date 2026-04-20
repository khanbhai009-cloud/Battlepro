import { getAdminDb } from "@/lib/firebase-admin";
import { Trophy, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

async function getStaffStats() {
  try {
    const db = getAdminDb();
    const [liveSnap, upcomingSnap, endedSnap] = await Promise.all([
      db.collection("tournaments").where("status", "==", "live").count().get(),
      db.collection("tournaments").where("status", "==", "upcoming").where("publishRoom", "==", false).count().get(),
      db.collection("tournaments").where("status", "==", "ended").count().get(),
    ]);
    return {
      live: liveSnap.data().count,
      pendingRooms: upcomingSnap.data().count,
      completed: endedSnap.data().count,
    };
  } catch {
    return { live: 0, pendingRooms: 0, completed: 0 };
  }
}

export default async function StaffDashboardPage() {
  const stats = await getStaffStats();

  const kpis = [
    { label: "Live Matches", value: String(stats.live), icon: Trophy, color: "text-green-600", bg: "bg-green-100" },
    { label: "Pending Room IDs", value: String(stats.pendingRooms), icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Completed Today", value: String(stats.completed), icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Staff Dashboard</h1>
        <p className="text-muted text-sm">Manage matches and update room credentials.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((stat, i) => {
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
        <h2 className="font-bold mb-3 text-foreground">Room ID Management</h2>
        <p className="text-sm text-muted mb-4">
          Go to the Matches tab to update Room IDs and Passwords for live or upcoming matches. Joined players will automatically receive a push notification with the credentials.
        </p>
        <Link
          href="/staff/matches"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Trophy size={15} />
          Manage Matches
        </Link>
      </div>
    </div>
  );
}

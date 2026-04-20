import { getLiveMatches } from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";
import { StaffMatchesClient } from "./StaffMatchesClient";

export const revalidate = 0;

export default async function StaffMatchesPage() {
  const matches = await getLiveMatches();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Match Management</h1>
        <p className="text-muted text-sm font-medium">Update Room ID and Password to notify all joined players.</p>
      </div>
      <StaffMatchesClient matches={matches as any[]} />
    </div>
  );
}

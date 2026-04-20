import { getAllTournaments } from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";
import { TournamentsClient } from "./TournamentsClient";

export const revalidate = 0;

export default async function AdminTournamentsPage() {
  const tournaments = await getAllTournaments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Tournaments</h1>
        <p className="text-muted text-sm font-medium">Create and manage all tournaments.</p>
      </div>
      <TournamentsClient tournaments={tournaments as any[]} />
    </div>
  );
}

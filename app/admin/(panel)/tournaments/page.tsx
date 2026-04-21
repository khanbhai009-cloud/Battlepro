import { getAllTournaments, getGameCategories } from "@/actions/admin";
import { TournamentsClient } from "./TournamentsClient";

export const revalidate = 0;

export default async function AdminTournamentsPage() {
  const [tournaments, categories] = await Promise.all([getAllTournaments(), getGameCategories()]);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Tournament Management</h1>
        <p className="text-sm text-muted mt-1">Create, edit, and manage all matches with full details.</p>
      </div>
      <TournamentsClient tournaments={tournaments as any[]} categories={categories as any[]} />
    </div>
  );
}

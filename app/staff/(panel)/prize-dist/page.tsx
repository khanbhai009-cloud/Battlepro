import { getOngoingMatchesForPrize } from "@/actions/admin";
import { PrizeDistClient } from "@/app/admin/(panel)/prize-dist/PrizeDistClient";

export const revalidate = 0;

export default async function StaffPrizeDistPage() {
  const matches = await getOngoingMatchesForPrize();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Prize Distribution</h1>
        <p className="text-sm text-muted mt-1">Select an ongoing match, enter kills &amp; rank prizes, then credit winnings.</p>
      </div>
      <PrizeDistClient matches={matches as any[]} />
    </div>
  );
}

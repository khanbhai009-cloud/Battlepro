import { getOngoingMatchesForPrize } from "@/actions/admin";
import { PrizeDistClient } from "./PrizeDistClient";

export const revalidate = 0;

export default async function PrizeDistPage() {
  const matches = await getOngoingMatchesForPrize();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Prize Distribution</h1>
        <p className="text-sm text-muted mt-1">Select an ongoing match, enter kills &amp; rank prizes, then credit winnings to all players.</p>
      </div>
      <PrizeDistClient matches={matches as any[]} />
    </div>
  );
}

import { getAllTransactions } from "@/actions/admin";
import { TransactionsClient } from "@/app/admin/(panel)/transactions/TransactionsClient";

export const revalidate = 0;

export default async function StaffTransactionsPage() {
  const txns = await getAllTransactions();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Transaction History</h1>
        <p className="text-sm text-muted mt-1">Search and view all platform transactions.</p>
      </div>
      <TransactionsClient initialTxns={txns as any[]} />
    </div>
  );
}

import { getPendingWithdrawals } from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";
import { WithdrawalActions } from "../dashboard/WithdrawalActions";
import { Banknote } from "lucide-react";

export const revalidate = 0;

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getPendingWithdrawals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Withdrawals</h1>
        <p className="text-muted text-sm font-medium">Approve or reject pending withdrawal requests.</p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold">Pending Requests ({withdrawals.length})</h2>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <Banknote size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-muted text-sm font-medium">No pending withdrawals. All clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{w.ffName}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{w.email}</span>
                  </div>
                  <div className="text-xs text-muted font-medium">
                    Manual transfer required · Notify user once sent
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-foreground text-lg">{formatCurrency(w.amount)}</div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase">Pending</div>
                  </div>
                  <WithdrawalActions withdrawalId={w.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-xs font-medium">
          <strong>Note:</strong> Withdrawals are processed manually. After approving, transfer the amount via UPI/Bank and mark as done. The user&apos;s winning balance has already been deducted upon their request.
        </p>
      </div>
    </div>
  );
}

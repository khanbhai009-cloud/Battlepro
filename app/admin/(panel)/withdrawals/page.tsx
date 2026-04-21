import { getPendingWithdrawals } from "@/actions/admin";
import AdminWithdrawalsClient from "./AdminWithdrawalsClient";

export const revalidate = 0;

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getPendingWithdrawals();
  return <AdminWithdrawalsClient initial={withdrawals as any[]} />;
}

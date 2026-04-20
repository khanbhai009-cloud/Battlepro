import { getAllTickets } from "@/actions/support";
import { AdminSupportClient } from "./AdminSupportClient";

export const revalidate = 0;

export default async function AdminSupportPage() {
  const tickets = await getAllTickets();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Support Tickets</h1>
        <p className="text-muted text-sm font-medium">Respond to player support requests.</p>
      </div>
      <AdminSupportClient tickets={tickets as any[]} />
    </div>
  );
}

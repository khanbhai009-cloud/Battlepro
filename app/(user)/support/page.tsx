import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserTickets } from "@/actions/support";
import { SupportClient } from "./SupportClient";

export default async function SupportPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const tickets = await getUserTickets(uid);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">Support</h1>
        <p className="text-muted text-sm font-medium">Submit a ticket and our team will respond within 24h.</p>
      </div>
      <SupportClient userId={uid} tickets={tickets as any[]} />
    </div>
  );
}

import { VipChatClient } from "./VipChatClient";
import { getAllUsers } from "@/actions/admin";

export const revalidate = 0;

export default async function StaffVipChatPage() {
  const allUsers = await getAllUsers();
  const vipUsers = (allUsers as any[]).filter((u) => u.vipExpiry && new Date() < new Date(u.vipExpiry));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">VIP Chat</h1>
        <p className="text-sm text-muted mt-1">Direct messages with VIP members.</p>
      </div>
      <VipChatClient vipUsers={vipUsers} senderType="staff" senderName="Staff Support" />
    </div>
  );
}

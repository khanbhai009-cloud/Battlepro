import { GlobalChatClient } from "./GlobalChatClient";

export default function StaffGlobalChatPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Global Chat</h1>
        <p className="text-sm text-muted mt-1">Send messages visible to all users in the global chat.</p>
      </div>
      <GlobalChatClient senderType="staff" senderName="Staff" />
    </div>
  );
}

import { NotificationsClient } from "./NotificationsClient";

export default function NotificationsPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-bold">Push Notifications</h1>
        <p className="text-sm text-muted mt-1">Send push notifications to all users or a specific user.</p>
      </div>
      <NotificationsClient />
    </div>
  );
}

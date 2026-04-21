import { NotificationsClient } from "@/app/admin/(panel)/notifications/NotificationsClient";

export default function StaffNotificationsPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-bold">Push Notifications</h1>
        <p className="text-sm text-muted mt-1">Send notifications to all users or specific players.</p>
      </div>
      <NotificationsClient />
    </div>
  );
}

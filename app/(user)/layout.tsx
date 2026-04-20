import { Sidebar, BottomNav } from "@/components/user/Navigation";
import { AppStatusListener } from "@/components/user/AppStatusListener";
import { NotificationsProvider } from "@/components/user/NotificationsProvider";

const TEMP_USER_ID = "user123";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppStatusListener />
      <NotificationsProvider userId={TEMP_USER_ID} />

      {/* Desktop Sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav — visible only on mobile */}
      <BottomNav />
    </div>
  );
}

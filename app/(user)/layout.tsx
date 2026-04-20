import { Sidebar, BottomNav } from "@/components/user/Navigation";
import { AppStatusListener } from "@/components/user/AppStatusListener";
import { NotificationsProvider } from "@/components/user/NotificationsProvider";

// Dummy ID, in real app fetch via session/cookie
const TEMP_USER_ID = "user123";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <AppStatusListener />
      <NotificationsProvider userId={TEMP_USER_ID} />
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto pb-20 sm:pb-0 relative">
        <div className="max-w-6xl mx-auto px-6 py-8 sm:py-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

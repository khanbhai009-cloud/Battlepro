import { Sidebar, BottomNav } from "@/components/user/Navigation";
import { AppStatusListener } from "@/components/user/AppStatusListener";
import { NotificationsProvider } from "@/components/user/NotificationsProvider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session")?.value;
  if (!userId) redirect("/login");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppStatusListener />
      <NotificationsProvider userId={userId} />

      <Sidebar userId={userId} />

      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

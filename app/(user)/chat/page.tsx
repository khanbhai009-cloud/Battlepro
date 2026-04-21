import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserChatClient } from "./UserChatClient";

export const revalidate = 0;

async function getUserData(uid: string) {
  try {
    const db = getAdminDb();
    const doc = await db.collection("users").doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
}

export default async function ChatPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const user = await getUserData(uid);

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Community Chat</h1>
        <p className="text-sm text-muted mt-1">Chat with other players in the global chat room.</p>
      </div>
      <UserChatClient uid={uid} ffName={user?.ffName ?? "Player"} />
    </div>
  );
}

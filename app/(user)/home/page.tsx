import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export const revalidate = 0;

async function getHomeData(uid: string) {
  try {
    const db = getAdminDb();
    const [userDoc, matchSnap, bannersSnap, gamesSnap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("tournaments").orderBy("createdAt", "desc").limit(100).get(),
      db.collection("admin_banners").orderBy("createdAt", "desc").get(),
      db.collection("admin_games").get(),
    ]);

    // JSON round-trip strips Firestore Timestamps so it's safe to pass to Client Components.
    const user = userDoc.exists
      ? (JSON.parse(JSON.stringify(userDoc.data())) as any)
      : null;
    const matches = JSON.parse(
      JSON.stringify(matchSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];
    const banners = JSON.parse(
      JSON.stringify(bannersSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];
    const games = JSON.parse(
      JSON.stringify(gamesSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];

    return { user, matches, banners, games };
  } catch {
    return { user: null, matches: [], banners: [], games: [] };
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const { user, matches, banners, games } = await getHomeData(uid);

  return (
    <HomeClient
      userId={uid}
      initialUser={user}
      initialMatches={matches}
      initialBanners={banners}
      initialGames={games}
    />
  );
}

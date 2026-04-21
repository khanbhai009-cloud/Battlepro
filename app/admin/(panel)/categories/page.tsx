import { getGameCategories } from "@/actions/admin";
import { CategoriesClient } from "./CategoriesClient";

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getGameCategories();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Game Categories</h1>
        <p className="text-sm text-muted mt-1">Manage game categories shown on user home screen and in tournament form.</p>
      </div>
      <CategoriesClient categories={categories as any[]} />
    </div>
  );
}

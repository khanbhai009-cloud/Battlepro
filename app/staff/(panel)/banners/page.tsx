import { getBanners } from "@/actions/admin";
import { BannersClient } from "@/app/admin/(panel)/banners/BannersClient";

export const revalidate = 0;

export default async function StaffBannersPage() {
  const banners = await getBanners();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Promotion Banners</h1>
        <p className="text-sm text-muted mt-1">Manage banners shown on user home screen.</p>
      </div>
      <BannersClient banners={banners as any[]} />
    </div>
  );
}

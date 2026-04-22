"use client";
import SafeImage from "@/components/SafeImage";

export function HomeBanners({ banners }: { banners: { id: string; url: string; link?: string }[] }) {
  if (banners.length === 0) return null;

  return (
    <>
      {banners.map((b) => (
        <div key={b.id} className="flex-shrink-0 w-full aspect-[16/9] rounded-xl bg-[#f8f9fa] border border-[#e9ecef] cursor-pointer box-shadow-md transition-transform active:scale-95">
          {b.link ? (
            <a href={b.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <SafeImage src={b.url} alt="banner" className="w-full h-full object-cover rounded-xl" />
            </a>
          ) : (
            <SafeImage src={b.url} alt="banner" className="w-full h-full object-cover rounded-xl" />
          )}
        </div>
      ))}
    </>
  );
}

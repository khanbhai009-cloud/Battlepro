"use client";
import { useState, useEffect } from "react";

export function HomeBanners({ banners }: { banners: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const b = banners[current];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/1" }}>
      {b.link ? (
        <a href={b.link} target="_blank" rel="noopener noreferrer">
          <img src={b.url} alt="banner" className="w-full h-full object-cover" />
        </a>
      ) : (
        <img src={b.url} alt="banner" className="w-full h-full object-cover" />
      )}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/50"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

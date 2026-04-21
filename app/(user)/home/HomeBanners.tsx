"use client";
import { useState, useEffect } from "react";
import SafeImage from "@/components/SafeImage";

export function HomeBanners({ banners }: { banners: { id: string; url: string; link?: string }[] }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % banners.length);
        setVisible(true);
      }, 250);
    }, 3500);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const b = banners[current];

  return (
    <div className="relative overflow-hidden rounded-2xl w-full" style={{ aspectRatio: "16 / 9" }}>
      <div
        className="w-full h-full transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {b.link ? (
          <a href={b.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <SafeImage src={b.url} alt="banner" className="w-full h-full object-cover" />
          </a>
        ) : (
          <SafeImage src={b.url} alt="banner" className="w-full h-full object-cover" />
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setVisible(true); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-5" : "bg-white/50 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

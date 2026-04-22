"use client";
import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";

export function HomeBanners({ banners }: { banners: { id: string; url: string; link?: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // Auto swipe every 3 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="flex-shrink-0 w-full aspect-[16/9] bg-[#f8f9fa] border border-[#e9ecef] cursor-pointer shadow-lg">
            {b.link ? (
              <a href={b.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                <SafeImage src={b.url} alt="banner" className="w-full h-full object-fill rounded-xl" />
              </a>
            ) : (
              <SafeImage src={b.url} alt="banner" className="w-full h-full object-fill rounded-xl" />
            )}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-[#ff8c00]" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

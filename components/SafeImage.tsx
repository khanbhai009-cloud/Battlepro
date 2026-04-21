"use client";

import * as React from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function SafeImage({ src, alt, className }: SafeImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

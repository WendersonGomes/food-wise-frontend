"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

type FoodImageProps = {
  alt: string;
  eager?: boolean;
  src?: string;
};

export function FoodImage({ alt, eager = false, src }: FoodImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shouldShowImage = Boolean(src && src !== failedSrc);

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-(--accent-soft) sm:h-20 sm:w-20">
      {shouldShowImage && src ? (
        <Image
          unoptimized
          alt={alt}
          className="object-cover"
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="96px"
          src={src}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-(--accent)">
          <ImageOff className="h-7 w-7" strokeWidth={1.9} />
        </div>
      )}
    </div>
  );
}

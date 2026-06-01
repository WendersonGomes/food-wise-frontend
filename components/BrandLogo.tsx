"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  onClick?: () => void;
};

export function BrandLogo({ href = "/", onClick }: BrandLogoProps) {
  return (
    <Link href={href} className="flex items-center gap-3" onClick={onClick}>
      <Image
        src="/coala-logo-variant.svg"
        alt="FoodWise logo"
        width={44}
        height={44}
        priority
        className="h-11 w-11 rounded-3xl shadow-[0_16px_36px_rgba(47,125,70,0.16)]"
      />
      <span className="text-lg font-bold text-foreground">
        FoodWise
      </span>
    </Link>
  );
}

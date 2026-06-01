"use client";

import Image from "next/image";
import { useState } from "react";
import { UserRound } from "lucide-react";

type AccountAvatarProps = {
  avatarUrl?: string;
  initial: string;
  size?: "sm" | "lg";
};

export function AccountAvatar({
  avatarUrl,
  initial,
  size = "sm",
}: AccountAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const sizeClasses = size === "lg" ? "h-12 w-12" : "h-8 w-8";

  if (avatarUrl && avatarUrl !== failedAvatarUrl) {
    return (
      <Image
        unoptimized
        src={avatarUrl}
        alt=""
        width={size === "lg" ? 48 : 32}
        height={size === "lg" ? 48 : 32}
        className={`${sizeClasses} rounded-full object-cover`}
        onError={() => setFailedAvatarUrl(avatarUrl)}
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClasses} shrink-0 items-center justify-center rounded-full bg-(--accent-soft) text-sm font-bold text-(--accent)`}
    >
      {initial || <UserRound className="h-4 w-4" strokeWidth={1.9} />}
    </span>
  );
}

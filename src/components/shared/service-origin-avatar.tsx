import Image from "next/image";
import type { ReactElement } from "react";
import { cn } from "@/lib/utils/cn";

type ServiceOriginAvatarProps = {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
};

export function ServiceOriginAvatar({ src, alt, className }: ServiceOriginAvatarProps): ReactElement {
  return (
    <span className={cn("relative inline-flex size-9 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-white", className)}>
      <Image src={src} alt={alt} fill sizes="36px" className="object-contain p-1" />
    </span>
  );
}

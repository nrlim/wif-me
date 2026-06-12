"use client";

import type { ReactElement, ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { useCartStore } from "@/hooks/use-cart-store";

type CategoryLinkProps = {
  readonly slug: string;
  readonly basePath?: string;
  readonly className?: string;
  readonly children: ReactNode;
};

export function CategoryLink({ slug, basePath = "/services", className, children }: CategoryLinkProps): ReactElement {
  const primaryLocationId = useCartStore((state) => state.getPrimaryLocationId());
  const href = primaryLocationId ? `${basePath}/${slug}?loc=${primaryLocationId}` : `${basePath}/${slug}`;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

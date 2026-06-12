import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { requireRoleSession } from "@/lib/auth/current-session";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout Booking" };

export default async function JamaahCheckoutPage(): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);

  return (
    <CheckoutClient />
  );
}

import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { requireRoleSession } from "@/lib/auth/current-session";
import { CheckoutClient } from "../jamaah/checkout/checkout-client";

export const metadata: Metadata = { title: "Checkout Booking" };

export default async function CheckoutPage(): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);
  return <CheckoutClient />;
}

import { LocationType } from "@prisma/client";
import { z } from "zod";

const LOCATION_SORT_FIELDS = ["name", "type", "countryCode", "latest"] as const;
const LOCATION_PAGE_SIZES = [10, 20, 50] as const;

export const locationListQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  type: z.union([z.literal(""), z.nativeEnum(LocationType)]).catch(""),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).or(z.literal("")).catch(""),
  isMaster: z.enum(["", "master", "custom"]).catch(""),
  sort: z.enum(LOCATION_SORT_FIELDS).catch("name"),
  order: z.enum(["asc", "desc"]).catch("asc"),
  page: z.coerce.number().int().min(1).catch(1),
  perPage: z.coerce.number().int().refine((value) => LOCATION_PAGE_SIZES.includes(value as (typeof LOCATION_PAGE_SIZES)[number])).catch(10),
});

export const locationMutationSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  type: z.nativeEnum(LocationType),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  isMaster: z.union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")]).optional(),
});

export const deleteLocationSchema = z.object({
  id: z.string().uuid(),
});

export type LocationListQuery = z.infer<typeof locationListQuerySchema>;
export type LocationMutationInput = z.infer<typeof locationMutationSchema>;

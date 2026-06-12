import "server-only";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// We use the service role key for server-side uploads to bypass RLS policies
// If migrating to a local filesystem later, this file can be replaced entirely
// with local fs operations without changing the Next.js API route that calls it.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kfzyvdfbwojcqawfvntw.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key-for-build";
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET ?? "wif-me-bucket";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("Supabase credentials are not fully configured. File uploads may fail.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

export async function uploadProviderLogo(providerId: string, file: File): Promise<string> {
  return uploadFile(`providers/${providerId}`, "logo", file);
}

export async function uploadPaymentProof(paymentId: string, file: File): Promise<string> {
  return uploadFile(`payments/${paymentId}`, "proof", file);
}

export async function ensureStorageBucket(): Promise<void> {
  const { data } = await supabase.storage.getBucket(BUCKET_NAME);
  if (data) return;

  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create storage bucket: ${error.message}`);
  }
}

async function uploadFile(directory: string, prefix: string, file: File): Promise<string> {
  await ensureStorageBucket();
  const extension = file.name.split(".").pop() || "bin";
  const uniqueId = uuidv4();
  const filePath = `${directory}/${prefix}-${uniqueId}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
}

export function getPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("https://")) return path;
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedStorageUrl(path: string | null, expiresIn = 60 * 60): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("https://")) return path;

  await ensureStorageBucket();
  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, expiresIn);
  if (error) return getPublicUrl(path);
  return data.signedUrl;
}

export async function deleteProviderLogo(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) {
    console.error(`Failed to delete logo at ${path}:`, error.message);
  }
}

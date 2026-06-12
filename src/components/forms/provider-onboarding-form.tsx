"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "@/i18n/routing";
import { CheckCircle2, ChevronRight, UploadCloud } from "lucide-react";

export function ProviderOnboardingForm(): ReactElement {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "travel_agent",
    registrationNumber: "",
    taxId: "",
    phone: "",
    whatsapp: "",
    website: "",
    address: "",
    baseCity: "",
    country: "ID",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Capabilities
  const [services, setServices] = useState<string[]>([]);
  const [languages] = useState<string[]>(["Indonesia"]);

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran logo maksimal 5MB");
        return;
      }
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let logoPath = null;
      if (logoFile) {
        const logoData = new FormData();
        logoData.append("logo", logoFile);
        
        const logoRes = await fetch("/api/provider/logo", {
          method: "POST",
          body: logoData,
        });

        if (!logoRes.ok) {
          throw new Error("Gagal mengunggah logo. Pastikan file berupa gambar dan kurang dari 5MB.");
        }
        
        const logoBody = (await logoRes.json()) as { readonly path?: string };
        logoPath = logoBody.path ?? null;
      }

      // We will send the rest to a server action or API route.
      // For now we will hit a new api route or action we create.
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      payload.append("services", services.join(","));
      payload.append("languages", languages.join(","));
      if (logoPath) payload.append("logoUrl", logoPath);

      const res = await fetch("/api/provider/onboarding", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        throw new Error("Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.");
      }

      router.push("/provider");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim data pengajuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8 flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${step === s ? "bg-[var(--emerald)] text-white" : step > s ? "bg-[var(--emerald-light)] text-white opacity-50" : "bg-gray-100 text-gray-400"}`}>
            {step > s ? <CheckCircle2 className="size-4" /> : s}
          </div>
          {s < 5 && <ChevronRight className="size-4 text-gray-300" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm md:p-10">
      {renderStepIndicator()}
      
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">Identitas Perusahaan</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Informasi legal instansi Anda</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs font-bold">Nama Perusahaan / Organisasi *</label>
              <input required type="text" className="auth-input" value={formData.companyName} onChange={(e) => updateForm("companyName", e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold">Tipe Perusahaan *</label>
              <select className="auth-input" value={formData.companyType} onChange={(e) => updateForm("companyType", e.target.value)}>
                <option value="travel_agent">Biro Perjalanan / Travel</option>
                <option value="transport_company">Perusahaan Transportasi</option>
                <option value="visa_agency">Agensi Visa</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold">Nomor Registrasi (NIB/SIUP)</label>
              <input type="text" className="auth-input" value={formData.registrationNumber} onChange={(e) => updateForm("registrationNumber", e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold">NPWP Perusahaan</label>
              <input type="text" className="auth-input" value={formData.taxId} onChange={(e) => updateForm("taxId", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button disabled={!formData.companyName} onClick={() => setStep(2)} className="rounded-lg bg-[var(--emerald)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--emerald-light)] disabled:opacity-50">Lanjut</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">Kontak & Lokasi</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Kemana kami dapat menghubungi Anda?</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs font-bold">Nomor Telepon Kantor *</label>
              <input required type="tel" className="auth-input" value={formData.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold">WhatsApp Admin *</label>
              <input required type="tel" className="auth-input" value={formData.whatsapp} onChange={(e) => updateForm("whatsapp", e.target.value)} />
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <label className="text-xs font-bold">Website / Sosial Media</label>
              <input type="url" className="auth-input" value={formData.website} onChange={(e) => updateForm("website", e.target.value)} />
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <label className="text-xs font-bold">Alamat Lengkap Kantor *</label>
              <textarea required className="auth-input min-h-20 py-2" value={formData.address} onChange={(e) => updateForm("address", e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold">Kota Basis *</label>
              <input required type="text" className="auth-input" value={formData.baseCity} onChange={(e) => updateForm("baseCity", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold hover:bg-gray-50">Kembali</button>
            <button disabled={!formData.phone || !formData.whatsapp || !formData.baseCity || !formData.address} onClick={() => setStep(3)} className="rounded-lg bg-[var(--emerald)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--emerald-light)] disabled:opacity-50">Lanjut</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">Layanan & Kapabilitas</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Apa saja yang perusahaan Anda sediakan?</p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold">Jenis Layanan</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "PROVIDER_MUTHAWIF", label: "Muthawif (Grup/B2B)" },
                  { id: "TRANSPORTATION", label: "Transportasi / Armada" },
                  { id: "VISA_PROCESSING", label: "Pengurusan Visa" },
                  { id: "ADDITIONAL_SERVICE", label: "Layanan Tambahan Lainnya" },
                ].map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-[var(--emerald)]">
                    <input type="checkbox" className="size-4 accent-[var(--emerald)]" checked={services.includes(s.id)} onChange={(e) => {
                      if (e.target.checked) setServices([...services, s.id]);
                      else setServices(services.filter((id) => id !== s.id));
                    }} />
                    <span className="text-sm font-bold">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold hover:bg-gray-50">Kembali</button>
            <button onClick={() => setStep(4)} className="rounded-lg bg-[var(--emerald)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--emerald-light)]">Lanjut</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">Logo Perusahaan</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Logo ini akan muncul pada pencarian layanan oleh jamaah.</p>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 p-10 text-center hover:border-[var(--emerald)]">
            {logoPreview ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Logo preview" className="size-32 rounded-lg object-contain shadow-sm" />
                <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="text-sm font-bold text-red-600 hover:underline">Hapus Logo</button>
              </div>
            ) : (
              <>
                <UploadCloud className="size-10 text-gray-400" />
                <div>
                  <p className="text-sm font-bold">Pilih gambar logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG maksimal 5MB</p>
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="mt-2 text-sm" />
              </>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(3)} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold hover:bg-gray-50">Kembali</button>
            <button disabled={!logoFile} onClick={() => setStep(5)} className="rounded-lg bg-[var(--emerald)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--emerald-light)] disabled:opacity-50">Lanjut</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">Review & Submit</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Pastikan semua data sudah benar sebelum diajukan ke admin.</p>
          </div>
          <div className="rounded-xl bg-[var(--ivory)] p-5 text-sm">
            <ul className="grid gap-3 divide-y divide-gray-200">
              <li className="flex justify-between py-1"><span className="text-gray-500">Perusahaan</span><span className="font-bold">{formData.companyName}</span></li>
              <li className="flex justify-between py-1"><span className="text-gray-500">Kontak</span><span className="font-bold">{formData.phone}</span></li>
              <li className="flex justify-between py-1"><span className="text-gray-500">Lokasi</span><span className="font-bold">{formData.baseCity}</span></li>
            </ul>
          </div>
          <div className="flex justify-between pt-4">
            <button disabled={isSubmitting} onClick={() => setStep(4)} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold hover:bg-gray-50 disabled:opacity-50">Kembali</button>
            <button disabled={isSubmitting} onClick={submitForm} className="rounded-lg bg-[var(--emerald)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--emerald-light)] disabled:opacity-50">
              {isSubmitting ? "Memproses..." : "Ajukan untuk Verifikasi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findLinkByOriginalSlug, findLinkByTeaserSlug } from "@/lib/db";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; slug?: string }>;
}) {
  const { mode, slug } = await searchParams;
  const isBlur = mode === "blur";

  const link = isBlur
    ? await findLinkByTeaserSlug(slug ?? "")
    : await findLinkByOriginalSlug(slug ?? "");
  if (!link) notFound();

  const imagePath = isBlur
    ? link.teaser_storage_path
    : link.original_storage_path;
  const href = `/${isBlur ? "t" : "o"}/${slug}`;

  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const fullUrl = `${proto}://${host}${href}`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Link berhasil dibuat
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isBlur
              ? "bg-purple-500/15 text-purple-300 ring-1 ring-purple-400/30"
              : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
          }`}
        >
          {isBlur ? "Teaser Blur" : "Original"}
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagePath ?? undefined}
          alt="Pratinjau"
          className="max-h-80 w-full object-contain"
        />
      </div>

      <div className="w-full rounded-xl border border-white/10 bg-gray-900/60 px-4 py-3">
        <p className="mb-1.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
          Tautan {isBlur ? "Blur" : "Original"} Anda
        </p>
        <p className="break-all text-center font-mono text-sm text-blue-300">
          {fullUrl}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <CopyButton link={fullUrl} className="flex-1" />
        <a
          href={imagePath ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10"
        >
          Buka Gambar
        </a>
        <Link
          href="/history"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10"
        >
          Riwayat
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { listLinks } from "@/lib/db";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HistoryPage() {
  const links = await listLinks();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="animate-fade-up mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Riwayat</h1>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-400 ring-1 ring-white/10">
          {links.length} {links.length === 1 ? "link" : "link"}
        </span>
      </div>

      {links.length === 0 ? (
        <div className="animate-fade-up anim-delay-1 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-16 text-center">
          <span className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-500">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15l6-6m-5.5.5h3v3M7 11.5V19a2 2 0 002 2h9a2 2 0 002-2v-5M10 5H6a2 2 0 00-2 2v4"
              />
            </svg>
          </span>
          <div>
            <p className="font-medium text-gray-300">Belum ada link</p>
            <p className="mt-1 text-sm text-gray-500">
              Buat tautan pertama Anda dari halaman Beranda.
            </p>
          </div>
          <Link
            href="/"
            className="shine-card rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/40"
          >
            Buat Tautan
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {links.map((link, index) => {
            const isBlur = link.mode === "blur";
            const slug = isBlur ? link.teaser_slug : link.original_slug;
            const imagePath = isBlur
              ? link.teaser_storage_path
              : link.original_storage_path;
            const href = `/${isBlur ? "t" : "o"}/${slug}`;

            return (
              <li
                key={link.id}
                style={{ animationDelay: `${Math.min(index * 90, 540)}ms` }}
                className="group animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-blue-500/10 sm:flex-nowrap sm:gap-4"
              >
                <Link
                  href={href}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-900 ring-1 ring-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePath ?? undefined}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isBlur
                          ? "bg-purple-500/15 text-purple-300 ring-1 ring-purple-400/30"
                          : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                      }`}
                    >
                      {isBlur ? "Blur" : "Original"}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {formatDate(link.created_at)}
                    </span>
                  </div>
                  <a
                    href={imagePath ?? href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate font-mono text-sm text-blue-300 transition-colors hover:text-blue-200"
                    title={imagePath ?? href}
                  >
                    {imagePath}
                  </a>
                </div>
                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                  <CopyButton link={imagePath ?? href} label="Salin" />
                  <DeleteButton id={link.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

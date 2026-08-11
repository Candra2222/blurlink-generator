import { notFound } from "next/navigation";
import { findLinkByOriginalSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OriginalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = await findLinkByOriginalSlug(id);
  if (!link?.original_storage_path) notFound();

  return (
    <div className="flex flex-1 items-center justify-center bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={link.original_storage_path}
        alt="Gambar Original"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

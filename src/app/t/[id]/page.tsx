import { notFound } from "next/navigation";
import { findLinkByTeaserSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeaserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = await findLinkByTeaserSlug(id);
  if (!link?.teaser_storage_path) notFound();

  return (
    <div className="flex flex-1 items-center justify-center bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={link.teaser_storage_path}
        alt="Teaser Blur"
        className="animate-fade-in max-h-full max-w-full object-contain"
      />
    </div>
  );
}

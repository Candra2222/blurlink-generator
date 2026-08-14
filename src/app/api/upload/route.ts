import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateSlug } from "@/lib/slugs";
import {
  insertLink,
  findLinkByTeaserSlug,
  findLinkByOriginalSlug,
} from "@/lib/db";
import { saveImage } from "@/lib/storage";
import {
  extForMimetype,
  isAllowedType,
  processBlurImage,
  processLiveImage,
  MAX_SIZE,
} from "@/lib/processImage";
import type { ImageLink, Mode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function uniqueSlug(length: number): Promise<string> {
  let slug = generateSlug(length);
  while (
    (await findLinkByTeaserSlug(slug)) ||
    (await findLinkByOriginalSlug(slug))
  ) {
    slug = generateSlug(length);
  }
  return slug;
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  const file = form.get("file");
  const modeRaw = String(form.get("mode") ?? "");
  const mode: Mode =
    modeRaw === "blur" ? "blur" : modeRaw === "live" ? "live" : "original";

  let blurPercent = 40;
  const parsed = Number(form.get("blur"));
  if (mode === "blur" && !Number.isNaN(parsed)) {
    blurPercent = Math.min(100, Math.max(0, Math.round(parsed)));
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Pilih file gambar terlebih dahulu" },
      { status: 400 }
    );
  }
  if (!isAllowedType(file.type)) {
    return NextResponse.json(
      { error: "Format harus JPG, PNG, atau WebP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran maksimal 5MB" },
      { status: 400 }
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  const ext = extForMimetype(file.type);

  const link: ImageLink = {
    id: randomUUID(),
    mode,
    teaser_slug: null,
    original_slug: null,
    teaser_storage_path: null,
    original_storage_path: null,
    created_at: new Date().toISOString(),
  };

  if (mode === "blur" || mode === "live") {
    const teaserSlug = await uniqueSlug(8);
    const processed =
      mode === "live"
        ? await processLiveImage(input, blurPercent, teaserSlug)
        : await processBlurImage(input, blurPercent);
    link.teaser_slug = teaserSlug;
    link.teaser_storage_path = await saveImage(
      "blur",
      `${teaserSlug}.${ext}`,
      processed
    );
  } else {
    const originalSlug = await uniqueSlug(8);
    link.original_slug = originalSlug;
    link.original_storage_path = await saveImage(
      "originals",
      `${originalSlug}.${ext}`,
      input
    );
  }

  await insertLink(link);

  const slug = link.teaser_slug ?? link.original_slug;
  const url = new URL(
    mode === "blur" || mode === "live" ? `/t/${slug}` : `/o/${slug}`,
    req.url
  );

  return NextResponse.json({
    success: true,
    mode,
    slug,
    url: url.toString(),
    imageUrl: link.teaser_storage_path ?? link.original_storage_path,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { deleteLink } from "@/lib/db";
import { deleteImageByPublicPath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const removed = await deleteLink(id);
  if (!removed) {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }

  await Promise.all([
    deleteImageByPublicPath(removed.teaser_storage_path),
    deleteImageByPublicPath(removed.original_storage_path),
  ]);

  return NextResponse.json({ success: true });
}

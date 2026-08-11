import sharp from "sharp";

export const MAX_SIZE = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAllowedType(type: string): boolean {
  return (ALLOWED_TYPES as readonly string[]).includes(type);
}

export function extForMimetype(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "png";
}

function buildOverlaySvg(width: number, height: number): string {
  const emojiSize = Math.round(height * 0.1);
  const textSize = Math.round(height * 0.05);
  const pillW = Math.round(width * 0.5);
  const pillH = Math.round(height * 0.26);
  const pillX = Math.round((width - pillW) / 2);
  const pillY = Math.round(height * 0.37);
  const centerX = Math.round(width / 2);
  const emojiY = Math.round(height * 0.46);
  const textY = Math.round(height * 0.58);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${Math.round(pillH / 2)}" fill="rgba(0,0,0,0.5)"/>
  <text x="${centerX}" y="${emojiY}" text-anchor="middle" font-size="${emojiSize}" font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif">👁️</text>
  <text x="${centerX}" y="${textY}" text-anchor="middle" font-size="${textSize}" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#ffffff" letter-spacing="2">show now</text>
</svg>`;
}

export async function processBlurImage(
  input: Buffer,
  blurPercent: number
): Promise<Buffer> {
  const sigma = Math.round((blurPercent / 100) * 30 * 10) / 10;
  const blurred = await sharp(input)
    .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
    .blur(sigma)
    .toBuffer();

  const meta = await sharp(blurred).metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 600;

  return sharp(blurred)
    .composite([
      {
        input: Buffer.from(buildOverlaySvg(width, height)),
        gravity: "center",
      },
    ])
    .toBuffer();
}

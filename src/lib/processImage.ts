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
  const centerX = Math.round(width / 2);

  const badgeH = Math.round(height * 0.06);
  const badgeW = Math.round(badgeH * 2.7);
  const badgeX = Math.round(width * 0.02);
  const badgeY = Math.round(height * 0.04);
  const badgeFont = Math.round(badgeH * 0.55);

  const eyeY = Math.round(height * 0.4);
  const eyeHalfW = Math.round(width * 0.08);
  const eyeTopCtl = eyeY - Math.round(height * 0.06);
  const eyeBotCtl = eyeY + Math.round(height * 0.06);
  const scleraR = Math.round(width * 0.02);
  const pupilR = Math.round(width * 0.01);
  const eyeStroke = Math.round(width * 0.005);

  const textSize = Math.round(height * 0.042);
  const textY = Math.round(height * 0.52);

  const pillW = Math.round(width * 0.18);
  const pillH = Math.round(height * 0.09);
  const pillX = Math.round((width - pillW) / 2);
  const pillY = Math.round(height * 0.58);
  const pillFont = Math.round(pillH * 0.45);
  const pillTextY = pillY + Math.round(pillH * 0.65);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="${Math.round(badgeH / 2)}" fill="#ef4444"/>
  <text x="${badgeX + Math.round(badgeW / 2)}" y="${badgeY + Math.round(badgeH * 0.68)}" text-anchor="middle" font-size="${badgeFont}" font-family="Arial, Helvetica, sans-serif" font-weight="800" fill="#ffffff" letter-spacing="1">LIVE</text>
  <path d="M${centerX - eyeHalfW},${eyeY} C${centerX - Math.round(eyeHalfW * 0.6)},${eyeTopCtl} ${centerX + Math.round(eyeHalfW * 0.6)},${eyeTopCtl} ${centerX + eyeHalfW},${eyeY} C${centerX + Math.round(eyeHalfW * 0.6)},${eyeBotCtl} ${centerX - Math.round(eyeHalfW * 0.6)},${eyeBotCtl} ${centerX - eyeHalfW},${eyeY} Z" fill="rgba(0,0,0,0.55)" stroke="#ffffff" stroke-width="${eyeStroke}" stroke-linejoin="round"/>
  <circle cx="${centerX}" cy="${eyeY}" r="${scleraR}" fill="#ffffff"/>
  <circle cx="${centerX}" cy="${eyeY}" r="${pupilR}" fill="#111827"/>
  <circle cx="${centerX - Math.round(pupilR * 0.4)}" cy="${eyeY - Math.round(pupilR * 0.4)}" r="${Math.round(pupilR * 0.35)}" fill="#ffffff"/>
  <text x="${centerX}" y="${textY}" text-anchor="middle" font-size="${textSize}" font-family="Arial, Helvetica, sans-serif" font-weight="600" fill="#ffffff" letter-spacing="1">click the show button</text>
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${Math.round(pillH / 2)}" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
  <text x="${centerX}" y="${pillTextY}" text-anchor="middle" font-size="${pillFont}" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#ffffff" letter-spacing="2">show</text>
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

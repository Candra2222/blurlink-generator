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

  const frame = Math.round(width * 0.05);
  const frameX1 = frame;
  const frameY1 = frame;
  const frameX2 = width - frame;
  const frameY2 = height - frame;
  const bracket = Math.round(width * 0.05);
  const bracketW = Math.round(width * 0.004);

  const recFont = Math.round(height * 0.07);
  const recY = Math.round(height * 0.2);
  const recDotR = Math.round(recFont * 0.2);
  const recDotCX = centerX - Math.round(recFont * 1.7);
  const recDotCY = recY - Math.round(recFont * 0.38);
  const recTextX = centerX + Math.round(recFont * 0.5);

  const capW = Math.round(width * 0.46);
  const capH = Math.round(height * 0.06);
  const capX = Math.round((width - capW) / 2);
  const textSize = Math.round(height * 0.035);
  const textY = Math.round(height * 0.5);
  const capY = textY - Math.round(capH * 0.55);

  const btnW = Math.round(width * 0.16);
  const btnH = Math.round(height * 0.08);
  const btnX = Math.round((width - btnW) / 2);
  const btnY = Math.round(height * 0.59);
  const btnFont = Math.round(height * 0.045);
  const btnTextY = btnY + Math.round(btnH * 0.68);

  const blinkR = Math.round(width * 0.008);
  const blinkCX = centerX;
  const blinkCY = Math.round(height * 0.78);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="M${frameX1},${frameY1 + bracket} V${frameY1} H${frameX1 + bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <path d="M${frameX2},${frameY1 + bracket} V${frameY1} H${frameX2 - bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <path d="M${frameX1},${frameY2 - bracket} V${frameY2} H${frameX1 + bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <path d="M${frameX2},${frameY2 - bracket} V${frameY2} H${frameX2 - bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <circle cx="${recDotCX}" cy="${recDotCY}" r="${recDotR}" fill="#ff3b30"/>
  <text x="${recTextX}" y="${recY}" text-anchor="middle" font-size="${recFont}" font-family="Arial, Helvetica, sans-serif" font-weight="800" fill="#ff3b30" letter-spacing="2">REC</text>
  <rect x="${capX}" y="${capY}" width="${capW}" height="${capH}" rx="${Math.round(capH / 2)}" fill="rgba(0,0,0,0.55)"/>
  <text x="${centerX}" y="${textY}" text-anchor="middle" font-size="${textSize}" font-family="Arial, Helvetica, sans-serif" font-weight="600" fill="#ffffff" letter-spacing="1">click the show button</text>
  <rect x="${btnX}" y="${btnY}" width="${btnW}" height="${btnH}" rx="${Math.round(btnH / 2)}" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
  <text x="${centerX}" y="${btnTextY}" text-anchor="middle" font-size="${btnFont}" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#ffffff" letter-spacing="2">show</text>
  <circle cx="${blinkCX}" cy="${blinkCY}" r="${blinkR}" fill="#ff3b30"/>
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

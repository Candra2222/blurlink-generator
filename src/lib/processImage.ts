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

  const playRingR = Math.round(width * 0.032);
  const playHalf = Math.round(width * 0.017);
  const playCY = Math.round(height * 0.5);
  const playX = centerX - Math.round(playHalf * 0.5);
  const playTopY = playCY - playHalf;
  const playBotY = playCY + playHalf;
  const playTipX = centerX + Math.round(playHalf * 0.5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="M${frameX1},${frameY1 + bracket} V${frameY1} H${frameX1 + bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <path d="M${frameX2},${frameY1 + bracket} V${frameY1} H${frameX2 - bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <path d="M${frameX1},${frameY2 - bracket} V${frameY2} H${frameX1 + bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <path d="M${frameX2},${frameY2 - bracket} V${frameY2} H${frameX2 - bracket}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="${bracketW}" stroke-linecap="round"/>
  <circle cx="${centerX}" cy="${playCY}" r="${playRingR}" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.9)" stroke-width="${bracketW}"/>
  <polygon points="${playX},${playTopY} ${playX},${playBotY} ${playTipX},${playCY}" fill="#ffffff"/>
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

import sharp from "sharp";
import { textSvg, textWidth } from "./opentype";

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

/* ------------------------------------------------------------------ */
/*  Live-streaming overlay (TikTok / YouTube style)                    */
/* ------------------------------------------------------------------ */

const LIVE_NAMES = [
  "Liam", "Noah", "Emma", "Olivia", "Lucas", "Sophia", "Mia", "Jack",
  "Ethan", "Amelia", "Oliver", "Charlotte", "Max", "Leo", "Nora", "Elena",
  "Viktor", "Hans", "Alice", "Hugo", "Isla", "Felix", "Ingrid", "Oscar",
  "Freya", "Theo",
];

const LIVE_COMMENTS = [
  "That's incredible!",
  "Can't wait for more!",
  "Love this stream!",
  "WOW!",
  "How did you do that?",
  "Keep it going!",
  "First time here, awesome!",
  "You're so talented!",
  "This is so good!",
  "So cool!",
  "Never stop, please!",
  "Best stream ever!",
  "Hello from London!",
  "Amazing vibes!",
  "That camera work is unreal!",
  "Totally hooked!",
  "Please react to this!",
  "This made my day!",
  "Epic!",
  "Would love more of this!",
];

const LIVE_AVATARS: [string, string][] = [
  ["#6366f1", "#8b5cf6"],
  ["#f43f5e", "#fb7185"],
  ["#10b981", "#34d399"],
  ["#f59e0b", "#fbbf24"],
  ["#0ea5e9", "#38bdf8"],
  ["#ec4899", "#f472b6"],
];

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(n);
}

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function heartSvg(cx: number, cy: number, size: number, fill: string, opacity = 1): string {
  return `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})"${opacity < 1 ? ` opacity="${opacity}"` : ""}><path d="${HEART_PATH}" fill="${fill}"/></g>`;
}

function centerBaseline(centerY: number, fontSize: number): number {
  return Math.round(centerY + fontSize * 0.36);
}

function buildLiveOverlaySvg(width: number, height: number, seed: string): string {
  const W = width;
  const H = height;
  const rand = mulberry32(hashSeed(seed));

  const viewerCount = formatCount(3000 + Math.floor(rand() * 120000));
  const likeCount = formatCount(800 + Math.floor(rand() * 90000));
  const watchingText = `${viewerCount} watching`;
  const likesText = `${likeCount} likes`;

  const comments: {
    name: string;
    text: string;
    colors: [string, string];
  }[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 4; i++) {
    let name = pick(LIVE_NAMES, rand);
    while (used.has(name)) name = pick(LIVE_NAMES, rand);
    used.add(name);
    comments.push({
      name,
      text: pick(LIVE_COMMENTS, rand),
      colors: pick(LIVE_AVATARS, rand),
    });
  }

  /* layout metrics */
  const pillH = 40;
  const pillTop = 20;
  const rightEdge = W - 22;

  const livePillX = 22;
  const livePillW = 100;
  const livePillCy = pillTop + pillH / 2;

  const watchingW = textWidth(watchingText, 15, "medium") + 28;
  const watchingX = livePillX + livePillW + 10;
  const watchingCy = pillTop + pillH / 2;

  const likesW = textWidth(likesText, 15, "medium") + 44;
  const likesX = rightEdge - likesW;
  const likesCy = pillTop + pillH / 2;

  const bubbleW = 404;
  const bubbleX = W - 22 - bubbleW;
  const bubbleH = 54;
  const bubbleGap = 8;
  const bubbleBottom = 556;
  const bubbleTops: number[] = [];
  for (let i = 0; i < comments.length; i++) {
    bubbleTops.unshift(bubbleBottom - bubbleH - i * (bubbleH + bubbleGap));
  }

  const inputY = H - 64;
  const inputH = 50;
  const inputCy = inputY + inputH / 2;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<defs>`,
    `<linearGradient id="live-scrim" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="#000000" stop-opacity="0"/>`,
    `<stop offset="0.55" stop-color="#000000" stop-opacity="0.35"/>`,
    `<stop offset="1" stop-color="#000000" stop-opacity="0.75"/>`,
    `</linearGradient>`,
    `<radialGradient id="live-vignette" cx="0.5" cy="0.5" r="0.72">`,
    `<stop offset="0.5" stop-color="#000000" stop-opacity="0"/>`,
    `<stop offset="1" stop-color="#000000" stop-opacity="0.5"/>`,
    `</radialGradient>`,
    ...comments.map(
      (_, i) =>
        `<linearGradient id="live-av-${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${comments[i].colors[0]}"/><stop offset="1" stop-color="${comments[i].colors[1]}"/></linearGradient>`
    ),
    `</defs>`,
    /* scrims */
    `<rect width="${W}" height="${H}" fill="url(#live-vignette)"/>`,
    `<rect width="${W}" height="${H}" fill="url(#live-scrim)"/>`,
    /* LIVE badge */
    `<rect x="${livePillX}" y="${pillTop}" width="${livePillW}" height="${pillH}" rx="20" fill="#ff2d4e"/>`,
    `<circle cx="${livePillX + 21}" cy="${livePillCy}" r="6" fill="#ffffff"/>`,
    textSvg("LIVE", { x: livePillX + 36, y: centerBaseline(livePillCy, 20), size: 20, weight: "bold" }),
    /* watching pill */
    `<rect x="${watchingX}" y="${pillTop}" width="${watchingW}" height="${pillH}" rx="20" fill="rgba(0,0,0,0.45)"/>`,
    textSvg(watchingText, { x: watchingX + 14, y: centerBaseline(watchingCy, 15), size: 15, weight: "medium", fill: "#e5e7eb" }),
    /* likes pill (top-right) */
    `<rect x="${likesX}" y="${pillTop}" width="${likesW}" height="${pillH}" rx="20" fill="rgba(0,0,0,0.45)"/>`,
    heartSvg(likesX + 17, likesCy, 15, "#ff2d4e"),
    textSvg(likesText, { x: likesX + 30, y: centerBaseline(likesCy, 15), size: 15, weight: "medium", fill: "#e5e7eb" }),
    /* floating hearts */
    heartSvg(1055, 150, 34, "#ff2d4e", 0.85),
    heartSvg(1128, 96, 24, "#fb7185", 0.65),
    heartSvg(1010, 244, 28, "#f43f5e", 0.7),
    heartSvg(1150, 170, 18, "#fda4af", 0.55)
  );

  /* chat bubbles */
  comments.forEach((c, i) => {
    const top = bubbleTops[i];
    const cy = top + bubbleH / 2;
    parts.push(
      `<rect x="${bubbleX}" y="${top}" width="${bubbleW}" height="${bubbleH}" rx="14" fill="rgba(0,0,0,0.55)"/>`,
      `<circle cx="${bubbleX + 32}" cy="${cy}" r="15" fill="url(#live-av-${i})" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>`,
      textSvg(c.name.charAt(0), {
        x: bubbleX + 32,
        y: cy + 5,
        size: 14,
        weight: "bold",
        align: "center",
      }),
      textSvg(c.name, { x: bubbleX + 56, y: top + 22, size: 14, weight: "bold", fill: "#c7d2fe" }),
      textSvg(c.text, { x: bubbleX + 56, y: top + 42, size: 14, weight: "regular", fill: "#f3f4f6" })
    );
  });

  /* input bar */
  parts.push(
    `<rect x="22" y="${inputY}" width="${W - 44}" height="${inputH}" rx="25" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>`,
    textSvg("Send a message...", { x: 48, y: centerBaseline(inputCy, 16), size: 16, fill: "#9ca3af" }),
    `<circle cx="1082" cy="${inputCy}" r="17" fill="rgba(255,255,255,0.12)"/>`,
    heartSvg(1082, inputCy, 16, "#ffffff"),
    `<rect x="1118" y="${inputY + 8}" width="62" height="34" rx="17" fill="#3b82f6"/>`,
    textSvg("Send", { x: 1149, y: centerBaseline(inputCy, 14), size: 14, weight: "bold", align: "center" })
  );

  parts.push(`</svg>`);
  return parts.join("\n");
}

export async function processLiveImage(
  input: Buffer,
  blurPercent: number,
  seed: string
): Promise<Buffer> {
  const sigma = Math.round((blurPercent / 100) * 30 * 10) / 10;
  let pipeline = sharp(input).autoOrient().resize({
    width: 1200,
    height: 630,
    fit: "cover",
    position: "centre",
  });
  if (sigma > 0) pipeline = pipeline.blur(sigma);
  const blurred = await pipeline.toBuffer();

  const meta = await sharp(blurred).metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 630;

  return sharp(blurred)
    .composite([
      {
        input: Buffer.from(buildLiveOverlaySvg(width, height, seed)),
        gravity: "center",
      },
    ])
    .withMetadata({ orientation: 1 })
    .toBuffer();
}

export async function processBlurImage(
  input: Buffer,
  blurPercent: number
): Promise<Buffer> {
  const sigma = Math.round((blurPercent / 100) * 30 * 10) / 10;
  let pipeline = sharp(input).autoOrient().resize({
    width: 1200,
    height: 630,
    fit: "cover",
    position: "centre",
  });
  if (sigma > 0) pipeline = pipeline.blur(sigma);
  const blurred = await pipeline.toBuffer();

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
    .withMetadata({ orientation: 1 })
    .toBuffer();
}

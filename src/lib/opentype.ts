import fs from "fs";
import path from "path";
import { parse, type Font } from "opentype.js";

export type FontWeight = "regular" | "medium" | "bold";

const FONT_FILES: Record<FontWeight, string> = {
  regular: "Roboto-Regular.ttf",
  medium: "Roboto-Medium.ttf",
  bold: "Roboto-Bold.ttf",
};

const cache: Partial<Record<FontWeight, Font>> = {};

function loadFont(weight: FontWeight): Font {
  if (cache[weight]) return cache[weight]!;
  const file = path.join(
    process.cwd(),
    "src",
    "lib",
    "fonts",
    FONT_FILES[weight]
  );
  const data = fs.readFileSync(file);
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.length);
  const font = parse(ab);
  cache[weight] = font;
  return font;
}

export function textWidth(
  text: string,
  size: number,
  weight: FontWeight = "regular"
): number {
  return loadFont(weight).getAdvanceWidth(text, size);
}

export function textSvg(
  text: string,
  opts: {
    x: number;
    y: number;
    size: number;
    weight?: FontWeight;
    fill?: string;
    opacity?: number;
    align?: "left" | "center" | "right";
  }
): string {
  const {
    x,
    y,
    size,
    weight = "regular",
    fill = "#ffffff",
    opacity = 1,
    align = "left",
  } = opts;
  const font = loadFont(weight);
  const w = font.getAdvanceWidth(text, size);
  let dx = 0;
  if (align === "center") dx = -w / 2;
  else if (align === "right") dx = -w;
  const glyphPath = font.getPath(text, 0, 0, size);
  const attrs = [`translate(${x + dx} ${y})`, `fill="${fill}"`];
  if (opacity < 1) attrs.push(`opacity="${opacity}"`);
  return `<g transform="${attrs[0]}" ${attrs.slice(1).join(" ")}><path d="${glyphPath.toPathData()}"/></g>`;
}

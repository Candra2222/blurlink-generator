declare module "opentype.js" {
  interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  interface Path {
    commands: unknown[];
    bounds: BoundingBox;
    toPathData(decimalPlaces?: number): string;
  }

  interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    getPath(
      text: string,
      x: number,
      y: number,
      fontSize: number,
      options?: Record<string, unknown>
    ): Path;
    getAdvanceWidth(
      text: string,
      fontSize: number,
      options?: Record<string, unknown>
    ): number;
  }

  export function parse(buffer: ArrayBuffer): Font;
}

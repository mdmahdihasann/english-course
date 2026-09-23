import { ImageResponse } from "next/og";

const SIZES = ["180", "192", "512"];

export const dynamicParams = false;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

/** App icon: "En" on the brand green, rendered at 180 (apple), 192 and 512 (manifest). */
export async function GET(_req: Request, ctx: RouteContext<"/icons/[size]">) {
  const { size } = await ctx.params;
  const s = Number(size);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b6e4f",
          color: "#fff",
          fontSize: s * 0.42,
          fontWeight: 700,
          letterSpacing: -s * 0.01,
        }}
      >
        En
      </div>
    ),
    { width: s, height: s },
  );
}

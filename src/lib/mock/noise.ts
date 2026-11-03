// The film-grain tile from crates/appearance/src/pattern.rs.
export const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
	`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
)}")`;

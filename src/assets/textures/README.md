# Paper tiles

The WebP tiles are pre-rasterized versions of the site's original SVG paper and grain. The originals in `sources/` are not loaded by the site. Render each SVG on a transparent background at its declared size and encode to lossless WebP. For the soft mottle, downsample to 158 × 158; the grayscale film grain uses WebP quality 72. Tile sizes in CSS are unchanged.

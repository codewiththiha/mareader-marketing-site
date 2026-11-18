# Site font assets

Inter, Literata and Liberation are Latin subsets of the original WOFF2 assets. They retain the original faces, hinting, and the Literata weight and optical-size axes. System fallbacks cover characters outside the range; the Red Chamber pane still uses its separate Traditional Chinese subset. The licenses are in this directory.

To recreate a subset using FontTools with WOFF2 support, run this on the corresponding full asset:

```sh
pyftsubset "$FULL_FONT" --flavor=woff2 --output-file="$SITE_FONT" \
  --unicodes='U+0020-007E,U+00A0-00FF,U+0152-0153,U+0178,U+2010-203A,U+2044,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+FFFD' \
  --layout-features='*'
```

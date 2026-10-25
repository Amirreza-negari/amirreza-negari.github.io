# Collaborator basemap

`world.svg` is a local, equirectangular world map generated from Natural Earth's
1:110m country outlines. It matches Leaflet's `L.CRS.EPSG4326` and bounds
`[[-90, -180], [90, 180]]`. Country borders are geographic context, not location precision.

Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson

Downloaded October 25, 2026. Source SHA-256:
`6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`.

Natural Earth data is public domain:
https://www.naturalearthdata.com/about/terms-of-use/

To regenerate after deliberately downloading the source file:

```sh
python3 scripts/generate-collaborator-basemap.py /path/to/ne_110m_admin_0_countries.geojson
```

Hugo builds and page loads use the committed SVG and bundled Leaflet files.
Do not replace them with a runtime CDN or hosted tile service: the previous
CARTO endpoint started returning an "API key required" image with HTTP 200.

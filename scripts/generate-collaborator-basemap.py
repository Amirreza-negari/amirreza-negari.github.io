"""Generate the bundled SVG from Natural Earth's ne_110m_admin_0_countries.geojson.

Usage: python3 scripts/generate-collaborator-basemap.py /path/to/countries.geojson
The generated asset is committed; Hugo builds do not need Python or network access.
"""

import json
import sys
from html import escape
from pathlib import Path


def project(lon, lat):
    # Equirectangular projection, matching Leaflet's CRS.EPSG4326.
    return (lon + 180) * 4, (90 - lat) * 4


def generate(source):
    countries = json.loads(source.read_text())
    svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720">',
        '<title>World map</title>',
        '<desc>Public-domain Natural Earth country outlines. Equirectangular projection.</desc>',
        '<rect width="1440" height="720" fill="#e6edf0"/>',
        '<g fill="#f7f8f4" stroke="#b7c7cd" stroke-width="0.65" stroke-linejoin="round">',
    ]
    for feature in countries['features']:
        geometry = feature['geometry']
        polygons = geometry['coordinates']
        if geometry['type'] == 'Polygon':
            polygons = [polygons]
        for polygon in polygons:
            path = []
            for ring in polygon:
                points = [project(*point[:2]) for point in ring]
                path.append('M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in points) + 'Z')
            svg.append(f'<path d="{"".join(path)}" fill-rule="evenodd"/>')
    svg.append('</g>')
    svg.append('<g fill="#627980" font-family="sans-serif" font-size="10" text-anchor="middle">')
    for name, lon, lat in [
        ('CANADA', -105, 59), ('UNITED STATES', -102, 36),
        ('SOUTH AMERICA', -60, -20), ('EUROPE', 18, 63),
        ('AFRICA', 20, 5), ('ASIA', 95, 47), ('AUSTRALIA', 135, -25),
    ]:
        x, y = project(lon, lat)
        svg.append(f'<text x="{x:.2f}" y="{y:.2f}">{escape(name)}</text>')
    svg.append('</g></svg>')
    destination = Path(__file__).resolve().parents[1] / 'static/images/maps/world.svg'
    destination.write_text('\n'.join(svg) + '\n')
    print(f'Generated {destination} ({destination.stat().st_size:,} bytes)')


if __name__ == '__main__':
    generate(Path(sys.argv[1]))

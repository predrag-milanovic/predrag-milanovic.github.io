# CAD Thumbnails

This folder stores 2D preview images for the CAD models.

## Purpose

- Thumbnail images (PNG/JPEG/SVG) for each model in `assets/cad/models`.
- Quick visual preview while the 3D `<model-viewer>` is loading.
- Static fallback on slow devices or when WebGL/3D is unavailable.
- Images that can be reused for social/OG previews of CAD projects.

## Recommended usage

- Name thumbnails to match model IDs or GLB files, for example:
	- `bearing-assembly.png`
	- `planetary-gearbox.jpg`
	- `robotic-gripper.png`
- Reference them from `assets/cad/models.json` (e.g. via a future `thumbnail` field)
	and/or use them in additional list/grid views that do not need full 3D.

Actual CAD model files (GLB) stay in `assets/cad/models/`; this folder is only
for their 2D preview images.


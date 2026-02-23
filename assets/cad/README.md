## JSON template for a model entry

Any model object you add to `assets/cad/models.json` (following the structure
below) will show up automatically on the CAD portfolio page.

```json
{
  "models": [
    {
      "id": "bearing-assembly",
      "title": "Precision Bearing Assembly",
      "description": "High-speed ball bearing assembly optimized for low friction and durability.",
      "software": "SolidWorks",
      "file": "assets/cad/models/bearing-assembly.glb",
      "sizeMB": 4.2,
      "metadata": {
        "category": "Rotating Machinery",
        "material": "52100 Bearing Steel",
        "year": 2025
      },
      "tags": ["bearing", "assembly", "rotational", "mechanism"]
    }
  ]
}
```

Notes:
- `file` must point to a GLB stored in `assets/cad/models/`.
- `id` should be unique for each model.
- `sizeMB` is used only for display; keep it roughly in sync with the real file size.
- `metadata` and `tags` drive the information and filters shown on the CAD page.
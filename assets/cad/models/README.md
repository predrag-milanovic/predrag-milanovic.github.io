# CAD Models and Metadata

This folder stores the actual GLB files for the CAD models that appear on the
website. The list of models and their metadata is defined in:

- `assets/cad/models.json`

## Converting CAD models to GLB with Blender

1. **Export from your CAD tool** (SolidWorks, Inventor, NX, etc.) to a neutral format:
   - STEP (`.step` / `.stp`) or STL (`.stl`) usually works well.
2. **Open Blender and import the file**:
   - `File → Import → STL` (or the matching format you exported).
3. **Clean up and simplify** (optional but recommended):
   - Remove unused objects, reduce polygon count (Decimate modifier).
   - Apply transforms (`Ctrl + A → All Transforms`) so scale/rotation are correct.
4. **Set origin and orientation**:
   - Move the model near the world origin and align it so Z is up.
5. **Export to GLB**:
   - `File → Export → glTF 2.0 (.glb)`.
   - Choose **Format**: `glTF Binary (.glb)`.
   - Enable **Apply Modifiers**, disable extras you don’t need (animations, cameras, lights).
   - Aim to keep file size around **5–10 MB** for fast loading when possible.
6. **Save the exported `.glb`** into this folder:
   - `assets/cad/models/your-model-name.glb`.
7. **Update `assets/cad/models.json`**:
   - Add or edit a model entry using the JSON template described in `assets/cad/README.md`,
     pointing `file` to your new GLB.

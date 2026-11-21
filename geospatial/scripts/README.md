# Earth Engine scripts

| Script | What it does |
|---|---|
| [`01_ventaquemada_vegetation_change.js`](01_ventaquemada_vegetation_change.js) | Builds cloud-masked Sentinel-2 dry-season composites (2023 vs. 2024) and computes NDVI, NDMI, NDWI and NBR. Flags NDVI decline inside páramo altitude (> 3,000 m). It separates crop-cycle changes from decline in natural vegetation (ESA WorldCover natural classes) and reports areas in hectares. |
| [`02_montoya_critical_areas.js`](02_montoya_critical_areas.js) | Reproduces the thesis decision rule: páramo altitude ∩ land-cover pressure (ESA WorldCover 2021), read against protected areas (WDPA). Adds tree-cover loss (Hansen GFC) and annual precipitation (GPM IMERG V07). Selects 10 field targets as the centroids of the largest critical patches. |

## How to run

1. Open the [Earth Engine Code Editor](https://code.earthengine.google.com) with an Earth Engine-enabled account.
2. Paste the script and click **Run**.
3. Area statistics and the target list appear in the *Console*. Exports appear in the *Tasks* tab.

## Version note

Both scripts started as exploratory analyses written during the thesis (2024–2025). In 2026 they were revised for reproducibility:

- **Surface reflectance with cloud screening.** `COPERNICUS/S2_SR_HARMONIZED` with Cloud Score+ masking replaces the deprecated `COPERNICUS/S2`. This is essential in the páramo, where cloud cover is near-permanent.
- **Seasonal composites.** Dry-season windows (Dec–Feb) replace single-month windows.
- **Index definitions aligned with the literature.**
  - NDWI (B3/B8) is labeled as open water and wetlands, not water quality.
  - The ad-hoc "NDFI" was replaced with NBR/dNBR, a standard disturbance index.
- **Current dataset versions.** Hansen GFC v1.11 (loss through 2023) and GPM IMERG V07.
- **Correct units.** IMERG precipitation (mm/hr) is converted to mm/year.
- **Masked loss pixels.** Non-loss pixels are masked before targets are extracted.
- **Reproducible targets.** Field targets come from contiguous critical patches, ranked by area.
- **Natural vegetation versus crops.** Year-to-year NDVI decline is split into all-cover decline, which includes harvest and ploughing, and decline in natural vegetation. Only the second is read as pressure on the páramo.

The official vereda boundary used in the thesis was a private asset. Script 02 therefore uses an approximate bounding box so that anyone can run it.

Data credits and licenses: see [`../../DATA_SOURCES.md`](../../DATA_SOURCES.md).

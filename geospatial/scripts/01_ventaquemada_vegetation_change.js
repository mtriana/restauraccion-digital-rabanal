/**
 * Vegetation, moisture and disturbance change — Ventaquemada (Boyacá, Colombia)
 *
 * Project : RestaurAcción Digital (M.Ed. thesis, Universidad de Cundinamarca, 2025)
 * Author  : María Fernanda Triana Barrantes
 * History : Exploratory version written during the thesis (2024).
 *           Revised in 2026: surface-reflectance collection, Cloud Score+ cloud
 *           masking, dry-season composites, corrected index definitions,
 *           area statistics restricted to páramo altitude, and separation of
 *           crop-cycle changes from decline in natural vegetation.
 *
 * Run in the Google Earth Engine Code Editor (https://code.earthengine.google.com).
 */

// ---------------------------------------------------------------------------
// 1. Study area: Ventaquemada municipality (FAO GAUL level 2)
// ---------------------------------------------------------------------------
var municipality = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM2_NAME', 'Ventaquemada'));
var region = municipality.geometry();

Map.centerObject(municipality, 11);

// ---------------------------------------------------------------------------
// 2. Cloud-masked Sentinel-2 composites
//    The páramo has near-permanent cloud cover, so every pixel is screened
//    with Cloud Score+ (cs_cdf) and composites cover the Dec–Feb dry season.
// ---------------------------------------------------------------------------
var CLEAR_THRESHOLD = 0.60;   // higher = stricter cloud screening
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');

function dryseasonComposite(start, end) {
  return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(region)
    .filterDate(start, end)
    .linkCollection(csPlus, ['cs_cdf'])
    .map(function (img) {
      return img.updateMask(img.select('cs_cdf').gte(CLEAR_THRESHOLD))
                .select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12'])
                .divide(10000);                       // to reflectance
    })
    .median()
    .clip(region);
}

var before = dryseasonComposite('2022-12-01', '2023-03-01');
var after  = dryseasonComposite('2023-12-01', '2024-03-01');

// ---------------------------------------------------------------------------
// 3. Spectral indices
// ---------------------------------------------------------------------------
function addIndices(img) {
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');   // vegetation vigor
  var ndmi = img.normalizedDifference(['B8', 'B11']).rename('NDMI');  // vegetation / canopy moisture
  var ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI');   // open water and wetlands (McFeeters, 1996)
  var nbr  = img.normalizedDifference(['B8', 'B12']).rename('NBR');   // disturbance and burn severity
  return ndvi.addBands([ndmi, ndwi, nbr]);
}

var idxBefore = addIndices(before);
var idxAfter  = addIndices(after);

var dNDVI = idxAfter.select('NDVI').subtract(idxBefore.select('NDVI')).rename('dNDVI');
var dNBR  = idxBefore.select('NBR').subtract(idxAfter.select('NBR')).rename('dNBR'); // positive = disturbance

// ---------------------------------------------------------------------------
// 4. Páramo mask (> 3,000 m a.s.l., legal threshold for the Eastern Cordillera)
//    and NDVI-decline flags
// ---------------------------------------------------------------------------
var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation').clip(region);
var paramo = elevation.gt(3000);

var ndviDecline = dNDVI.lt(-0.10)                      // clear loss of vigor
  .and(idxBefore.select('NDVI').gt(0.30))              // pixel was vegetated before
  .and(paramo)
  .rename('ndvi_decline');

// Year-to-year NDVI decline in the páramo includes normal crop cycles
// (harvest, ploughing, fallow). To isolate pressure on natural vegetation,
// the flag is also restricted to natural cover classes of ESA WorldCover 2021:
// 10 tree cover, 20 shrubland, 30 grassland, 90 herbaceous wetland, 100 moss/lichen.
var worldcover = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map').clip(region);
var natural = worldcover.remap([10, 20, 30, 90, 100], [1, 1, 1, 1, 1], 0);
var naturalDecline = ndviDecline.and(natural).rename('natural_decline');

// ---------------------------------------------------------------------------
// 5. Area statistics (hectares)
// ---------------------------------------------------------------------------
function areaHa(mask) {
  return ee.Image.pixelArea().divide(1e4).updateMask(mask)
    .reduceRegion({reducer: ee.Reducer.sum(), geometry: region,
                   scale: 20, maxPixels: 1e10, bestEffort: true})
    .values().get(0);
}
print('Páramo area > 3,000 m (ha)', areaHa(paramo));
print('NDVI decline in páramo, all cover incl. crop cycles (ha)', areaHa(ndviDecline));
print('NDVI decline in natural páramo vegetation (ha)', areaHa(naturalDecline));

// ---------------------------------------------------------------------------
// 6. Map layers
// ---------------------------------------------------------------------------
var rdYlGn = ['d73027', 'fee08b', '1a9850'];
Map.addLayer(after.select(['B4', 'B3', 'B2']), {min: 0, max: 0.15}, 'True color 2024', false);
Map.addLayer(idxAfter.select('NDVI'), {min: -0.2, max: 0.8, palette: rdYlGn}, 'NDVI 2024');
Map.addLayer(dNDVI, {min: -0.3, max: 0.3, palette: rdYlGn}, 'NDVI change 2023→2024');
Map.addLayer(idxAfter.select('NDMI'), {min: -0.5, max: 0.5, palette: ['8c510a', 'f6e8c3', '01665e']}, 'Vegetation moisture (NDMI)', false);
Map.addLayer(idxAfter.select('NDWI'), {min: -0.5, max: 0.5, palette: ['ffffff', '74a9cf', '045a8d']}, 'Open water / wetlands (NDWI)', false);
Map.addLayer(dNBR, {min: -0.3, max: 0.3, palette: ['1a9850', 'ffffbf', 'd73027']}, 'Disturbance (dNBR)', false);
Map.addLayer(paramo.selfMask(), {palette: ['ffd700'], opacity: 0.35}, 'Páramo > 3,000 m', false);
Map.addLayer(ndviDecline.selfMask(), {palette: ['ff9900']}, 'NDVI decline (all cover)', false);
Map.addLayer(naturalDecline.selfMask(), {palette: ['ff0000']}, 'NDVI decline in natural vegetation');
Map.addLayer(municipality.style({color: '0000ff', width: 2, fillColor: '00000000'}), {}, 'Ventaquemada');

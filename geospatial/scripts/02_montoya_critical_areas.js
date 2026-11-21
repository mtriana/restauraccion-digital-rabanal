/**
 * Critical páramo areas and field targets — Vereda Montoya, Ventaquemada (Colombia)
 *
 * Project : RestaurAcción Digital (M.Ed. thesis, Universidad de Cundinamarca, 2025)
 * Author  : María Fernanda Triana Barrantes
 * History : Exploratory version written during the thesis (2024–2025).
 *           Revised in 2026 to reproduce the thesis decision rule
 *           (páramo altitude ∩ land-cover pressure, read against protected areas),
 *           with current dataset versions, corrected precipitation units,
 *           masked loss pixels and a patch-based selection of field targets.
 *
 * Run in the Google Earth Engine Code Editor (https://code.earthengine.google.com).
 */

// ---------------------------------------------------------------------------
// 1. Study area
//    The thesis used the official vereda boundary (regional veredas layer)
//    as a private asset. To keep this script runnable by anyone, an
//    approximate bounding box around the thesis visit area is used.
//    Replace it with your own boundary asset if available:
//    var montoya = ee.FeatureCollection('projects/<your-project>/assets/<veredas>')
//                    .filter(ee.Filter.eq('<name_field>', 'MONTOYA')).geometry();
// ---------------------------------------------------------------------------
var montoya = ee.Geometry.Rectangle([-73.50, 5.32, -73.40, 5.42]);
Map.centerObject(montoya, 12);

// ---------------------------------------------------------------------------
// 2. Input layers
// ---------------------------------------------------------------------------
// Elevation: páramo threshold for the Eastern Cordillera (> 3,000 m a.s.l.)
var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation').clip(montoya);
var paramo = elevation.gt(3000);

// Land cover: ESA WorldCover 2021 (10 m)
// 40 = cropland, 50 = built-up, 60 = bare / sparse vegetation
var worldcover = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map').clip(montoya);
var pressure = worldcover.eq(40).or(worldcover.eq(50)).or(worldcover.eq(60));

// Protected areas (WDPA)
var protectedAreas = ee.FeatureCollection('WCMC/WDPA/current/polygons').filterBounds(montoya);
var protectedMask = ee.Image(0).paint(protectedAreas, 1).clip(montoya);

// Tree-cover loss since 2001 (Hansen et al., Global Forest Change)
var forestLoss = ee.Image('UMD/hansen/global_forest_change_2023_v1_11')
  .select('lossyear').selfMask().clip(montoya);

// Precipitation: GPM IMERG monthly (V07). Units are mm/hr → convert to mm/year.
var annualRain = ee.ImageCollection('NASA/GPM_L3/IMERG_MONTHLY_V07')
  .filterDate('2023-01-01', '2024-01-01')
  .select('precipitation')
  .mean()
  .multiply(24 * 365.25)
  .rename('rain_mm_yr')
  .clip(montoya);

// ---------------------------------------------------------------------------
// 3. Decision rule (thesis):
//    critical = páramo altitude AND land-cover pressure
//    priority = critical AND outside protected areas
// ---------------------------------------------------------------------------
var critical = paramo.and(pressure).rename('critical').toInt();
var priority = critical.and(protectedMask.not()).rename('priority').toInt();

// ---------------------------------------------------------------------------
// 4. Area statistics (hectares)
// ---------------------------------------------------------------------------
function areaHa(mask) {
  return ee.Image.pixelArea().divide(1e4).updateMask(mask)
    .reduceRegion({reducer: ee.Reducer.sum(), geometry: montoya,
                   scale: 10, maxPixels: 1e10, bestEffort: true})
    .values().get(0);
}
print('Páramo area (ha)', areaHa(paramo));
print('Critical area: páramo ∩ pressure (ha)', areaHa(critical));
print('Priority area: critical, unprotected (ha)', areaHa(priority));

// ---------------------------------------------------------------------------
// 5. Field targets: centroids of the 10 largest contiguous critical patches
// ---------------------------------------------------------------------------
var patches = critical.selfMask().reduceToVectors({
  geometry: montoya,
  scale: 10,
  geometryType: 'polygon',
  eightConnected: true,
  labelProperty: 'critical',
  maxPixels: 1e10,
  bestEffort: true
}).map(function (f) {
  return f.set('area_ha', f.geometry().area(1).divide(1e4));
});

var targets = patches.sort('area_ha', false).limit(10).map(function (f) {
  var c = f.geometry().centroid(1);
  var xy = c.coordinates();
  return ee.Feature(c, {area_ha: f.get('area_ha'), lon: xy.get(0), lat: xy.get(1)});
});
print('Field targets (10 largest critical patches)', targets);

// ---------------------------------------------------------------------------
// 6. Map layers with a toggle panel
// ---------------------------------------------------------------------------
var layers = [
  Map.addLayer(paramo.selfMask(), {palette: ['ffd700'], opacity: 0.4}, 'Páramo > 3,000 m'),
  Map.addLayer(worldcover, {}, 'ESA WorldCover 2021', false),
  Map.addLayer(protectedMask.selfMask(), {palette: ['1a9850'], opacity: 0.4}, 'Protected areas (WDPA)'),
  Map.addLayer(forestLoss, {min: 1, max: 23, palette: ['ffffb2', 'bd0026']}, 'Tree-cover loss 2001–2023', false),
  Map.addLayer(annualRain, {min: 600, max: 1600, palette: ['f7fbff', '6baed6', '08306b']}, 'Precipitation 2023 (mm/yr)', false),
  Map.addLayer(critical.selfMask(), {palette: ['000000']}, 'Critical: páramo ∩ pressure'),
  Map.addLayer(targets, {color: 'ff0000'}, 'Field targets')
];

var panel = ui.Panel({style: {position: 'top-left', width: '260px'}});
panel.add(ui.Label('Vereda Montoya — layers', {fontWeight: 'bold'}));
layers.forEach(function (layer) {
  panel.add(ui.Checkbox({
    label: layer.getName(),
    value: layer.getShown(),
    onChange: function (checked) { layer.setShown(checked); }
  }));
});
Map.add(panel);

// ---------------------------------------------------------------------------
// 7. Export targets (coordinates stay private: they may fall on private land)
// ---------------------------------------------------------------------------
Export.table.toDrive({
  collection: targets,
  description: 'montoya_field_targets',
  fileFormat: 'CSV'
});

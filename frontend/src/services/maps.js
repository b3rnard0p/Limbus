// ---------------------------------------------------------------------------
// Registro central de todos os mapas do projeto.
//
// tileMode: true  → Leaflet usa tiles reais (OSM) com CRS EPSG:3857
//                   Neste modo x = longitude, y = latitude
// tileMode: false → Leaflet usa CRS.Simple + imageOverlay (mapa estático)
//                   Neste modo x e y são pixels dentro da imagem
//
// portals: []     → portais SÃO cadastrados pelo admin como pins do tipo
//                   "portal". Este array fica sempre vazio — não use aqui.
// ---------------------------------------------------------------------------

export const MAPS = {
  "home-medieval": {
    id: "home-medieval",
    label: "Mapa Medieval",
    image: "/Medieval.webp",
    width: 12500,
    height: 6250,
    parentId: null,
    tileMode: false,
    portals: []
  },
  "earth-modern": {
    id: "earth-modern",
    label: "Mapa Atual (mundo real)",
    image: null,
    width: null,
    height: null,
    parentId: null,
    tileMode: true,
    portals: []
  },
  inferno: {
    id: "inferno",
    label: "Inferno",
    image: "/Inferno.webp",
    width: 8750,
    height: 6250,
    parentId: "home-medieval",
    tileMode: false,
    portals: []
  },
  purgatorio: {
    id: "purgatorio",
    label: "Purgatório",
    image: "/Purgatorio.webp",
    width: 6250,
    height: 7188,
    parentId: "home-medieval",
    tileMode: false,
    portals: []
  },
  paraiso: {
    id: "paraiso",
    label: "Paraíso",
    image: "/Paraiso.webp",
    width: 3125,
    height: 4688,
    parentId: "home-medieval",
    tileMode: false,
    portals: []
  }
};

export const MAP_OPTIONS = Object.values(MAPS).map((map) => ({
  id: map.id,
  label: map.label
}));

export function getMapConfig(mapId) {
  return MAPS[mapId] || MAPS["home-medieval"];
}

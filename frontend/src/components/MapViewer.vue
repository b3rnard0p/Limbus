<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";
import OpenSeadragon from "openseadragon";
import Globe from "globe.gl";
import { getMapConfig } from "../services/maps";

const props = defineProps({
  mapId: {
    type: String,
    required: true
  },
  allPins: {
    type: Array,
    default: () => []
  },
  pins: {
    type: Array,
    default: () => []
  },
  admin: {
    type: Boolean,
    default: false
  },
  alwaysShowLabels: {
    type: Boolean,
    default: false
  },
  globeMode: {
    type: Boolean,
    default: false
  },
  showJourney: {
    type: Boolean,
    default: false
  },
  showPoliticalDivision: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["map-click", "pin-select", "portal-select", "pin-admin-click"]);

const leafletElement = ref(null);
const osdElement = ref(null);
const globeElement = ref(null);

let leafletMap = null;
let markerLayerInstance = null;
let tileLayerInstance = null;
let osdViewer = null;
let globeInstance = null;

let mountedMapId = null;
let resizeListener = null;
let resizeObserver = null;

const mapConfig = computed(() => getMapConfig(props.mapId));
const isLeaflet = computed(() => mapConfig.value.tileMode && !props.globeMode);
const isGlobe = computed(() => mapConfig.value.tileMode && props.globeMode);

function destroyLeaflet() {
  if (resizeListener) {
    window.removeEventListener("resize", resizeListener);
    resizeListener = null;
  }
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
    markerLayerInstance = null;
    tileLayerInstance = null;
  }
}

async function renderLeaflet() {
  destroyLeaflet();
  
  leafletMap = L.map(leafletElement.value, {
    crs: L.CRS.EPSG3857,
    minZoom: 1,
    maxZoom: 19,
    zoomSnap: 1,
    zoomDelta: 1,
    attributionControl: true,
    wheelPxPerZoomLevel: 80,
    touchZoom: true,
    zoomControl: false,
    maxBoundsViscosity: 0.85
  });

  markerLayerInstance = L.layerGroup().addTo(leafletMap);

  leafletMap.on("click", (event) => {
    if (!props.admin) return;
    emit("map-click", {
      x: parseFloat(event.latlng.lng.toFixed(6)),
      y: parseFloat(event.latlng.lat.toFixed(6))
    });
  });

  const lyrs = props.showPoliticalDivision ? 'y' : 's';
  tileLayerInstance = L.tileLayer(
    `https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&hl=pt-BR`,
    {
      maxZoom: 19,
      attribution: "© Google Maps",
      noWrap: true
    }
  ).addTo(leafletMap);

  const southWest = L.latLng(-89.98155760646617, -180);
  const northEast = L.latLng(89.99346179538875, 180);
  const worldBounds = L.latLngBounds(southWest, northEast);
  
  leafletMap.setMaxBounds(worldBounds);
  
  const setExactMinZoom = () => {
    if (!leafletMap) return;
    const minZoom = leafletMap.getBoundsZoom(worldBounds, true);
    leafletMap.setMinZoom(minZoom);
    return minZoom;
  };

  setTimeout(() => {
    if (leafletMap) {
      leafletMap.invalidateSize();
      const minZoom = setExactMinZoom();
      leafletMap.setView([20, 15], minZoom, { animate: false });
    }
  }, 100);

  resizeListener = () => {
    if (leafletMap) leafletMap.invalidateSize();
    setExactMinZoom();
  };
  window.addEventListener("resize", resizeListener);
}

function destroyGlobe() {
  if (globeInstance) {
    if (globeInstance.pauseAnimation) globeInstance.pauseAnimation();
    if (globeElement.value) globeElement.value.innerHTML = '';
    globeInstance = null;
  }
  if (resizeListener) {
     window.removeEventListener("resize", resizeListener);
     resizeListener = null;
  }
  if (resizeObserver) {
     resizeObserver.disconnect();
     resizeObserver = null;
  }
}

async function renderGlobe() {
  destroyGlobe();
  
  if (!globeElement.value) return;

  globeInstance = Globe()(globeElement.value)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .pointOfView({ lat: 20, lng: 15, altitude: 2 });

  let fetchProm = Promise.resolve();
  
  if (props.showPoliticalDivision) {
    fetchProm = fetch('/countries-pt.json')
      .then(res => res.json())
      .then(data => {
        if (globeInstance && props.showPoliticalDivision) {
          globeInstance.labelsData(data.ref_country_codes)
            .labelLat(d => d.latitude)
            .labelLng(d => d.longitude)
            .labelText(d => d.country)
            .labelSize(1.2)
            .labelDotRadius(0.3)
            .labelColor(() => 'rgba(255, 255, 255, 0.7)')
            .labelResolution(2)
            .labelAltitude(0.01);
        }
      })
      .catch(err => console.error("Erro ao carregar nomes dos países:", err));
  }
    
  if (props.admin) {
    globeInstance.onGlobeClick(({ lat, lng }) => {
      emit("map-click", {
        x: parseFloat(lng.toFixed(6)),
        y: parseFloat(lat.toFixed(6))
      });
    });
  }

  resizeObserver = new ResizeObserver(() => {
    if (globeInstance && globeElement.value) {
      globeInstance.width(globeElement.value.clientWidth);
      globeInstance.height(globeElement.value.clientHeight);
    }
  });
  if (globeElement.value) resizeObserver.observe(globeElement.value);
}

function destroyOSD() {
  if (osdViewer) {
    osdViewer.destroy();
    osdViewer = null;
  }
}

async function renderOSD(cfg) {
  destroyOSD();

  let fileName = cfg.image;
  if (fileName) {
    fileName = fileName.replace(/^\//, ''); // remove barra inicial
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const dziPath = `/tiles/${baseName}.dzi`;

    osdViewer = OpenSeadragon({
      element: osdElement.value,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      tileSources: dziPath,
      showNavigationControl: false,
      visibilityRatio: 1.0,
      constrainDuringPan: true,
      homeFillsViewer: true,
      gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
      gestureSettingsTouch: { flickEnabled: true, pinchToZoom: true },
      defaultZoomLevel: 0,
      minZoomImageRatio: 1, 
      maxZoomPixelRatio: 2, 
      showRotationControl: false,
    });

    const enforceMinZoom = () => {
      if (osdViewer && osdViewer.viewport) {
        osdViewer.viewport.minZoomLevel = osdViewer.viewport.getHomeZoom();
      }
    };

    osdViewer.addHandler('open', () => {
      enforceMinZoom();
      drawPins();
    });
    
    osdViewer.addHandler('resize', enforceMinZoom);

    osdViewer.addHandler('canvas-click', (event) => {
      if (!event.quick) return; 
      
      if (!props.admin) return;

      const viewportPoint = osdViewer.viewport.pointFromPixel(event.position);
      const imagePoint = osdViewer.viewport.viewportToImageCoordinates(viewportPoint);
      
      emit("map-click", {
        x: Math.round(imagePoint.x),
        y: Math.round(imagePoint.y)
      });
    });
  }
}

async function mountMap(mapId) {
  const cfg = getMapConfig(mapId);
  mountedMapId = mapId;

  await nextTick();

  if (cfg.tileMode && !props.globeMode) {
    destroyOSD();
    destroyGlobe();
    await renderLeaflet();
  } else if (cfg.tileMode && props.globeMode) {
    destroyOSD();
    destroyLeaflet();
    await renderGlobe();
  } else {
    destroyLeaflet();
    destroyGlobe();
    await renderOSD(cfg);
  }
  
  drawPins();
}

function drawPins() {
  if (markerLayerInstance) {
    markerLayerInstance.clearLayers();
  }
  if (osdViewer) {
    osdViewer.clearOverlays();
  }
  if (globeInstance) {
    globeInstance.htmlElementsData([]);
  }

  const pinElementsData = [];
  
  let globalJourneyPins = [];
  let pinsToDraw = [...props.pins];
  
  if (props.showJourney) {
    const pool = (props.allPins && props.allPins.length > 0) ? props.allPins : props.pins;
    globalJourneyPins = pool
      .filter(p => !p.isCuriosity && p.canto !== undefined && p.canto !== null)
      .sort((a, b) => a.canto - b.canto);
      
    pinsToDraw = pinsToDraw
      .filter(p => !p.isCuriosity && p.canto !== undefined && p.canto !== null)
      .sort((a, b) => a.canto - b.canto);
  }

  pinsToDraw.forEach((pin) => {
    const isPortal = pin.pinType === 'portal';
    let iconBaseHtml = isPortal 
      ? `<div class="portal-pin"><span></span></div>` 
      : `<div class="story-pin"><span></span></div>`;

    if (pin.pinImageUrl) {
      iconBaseHtml = `
        <div class="relative flex items-center justify-center w-[48px] h-[48px]">
          <img src="${pin.pinImageUrl}" class="w-[40px] h-[40px] object-cover" alt="Pin" onerror="this.style.opacity='0'" />
        </div>
      `;
    }
    
    let journeyBadge = '';
    if (props.showJourney) {
      let globalIndex = globalJourneyPins.findIndex(gp => gp._id === pin._id);
      if (globalIndex === -1) globalIndex = 0; 

      journeyBadge = `
        <div class="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-br from-[#d4af37] to-[#aa7c11] rounded-full border-2 border-[#151820] flex items-center justify-center shadow-lg z-[60]">
          <span class="text-[#151820] font-bold text-xs" style="font-family: 'Cinzel Decorative', serif;">${globalIndex + 1}</span>
        </div>
      `;
    }

    const labelVisibility = props.alwaysShowLabels ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';
    const iconHtml = `
      <div class="group relative flex flex-col items-center">
        ${journeyBadge}
        ${iconBaseHtml}
        <div class="pin-label-content absolute top-full mt-1 px-2 py-1 bg-[#241b16] text-[#f4e7c5] font-semibold text-sm rounded shadow-md whitespace-nowrap transition-opacity duration-200 ${labelVisibility} pointer-events-none z-50">
          ${pin.title || 'Ponto'}
        </div>
      </div>
    `;

    if (isLeaflet.value && markerLayerInstance) {
      const icon = L.divIcon({ html: iconHtml, className: 'bg-transparent border-0' });
      const marker = L.marker([pin.y, pin.x], { icon }).addTo(markerLayerInstance);
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (props.admin) {
          emit("pin-admin-click", pin);
        } else {
          if (isPortal) emit("portal-select", pin);
          else emit("pin-select", pin);
        }
      });
    } else if (isGlobe.value && globeInstance) {
      pinElementsData.push({
        lat: pin.y,
        lng: pin.x,
        ...pin,
        html: iconHtml
      });
    } else if (!isLeaflet.value && !isGlobe.value && osdViewer && osdViewer.isOpen()) {
      const el = document.createElement("div");
      el.innerHTML = iconHtml;
      el.className = "cursor-pointer absolute origin-center transform -translate-x-1/2 -translate-y-1/2";
      
      el.addEventListener("pointerdown", (e) => e.stopPropagation());
      el.addEventListener("mousedown", (e) => e.stopPropagation());
      el.addEventListener("touchstart", (e) => e.stopPropagation());
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (props.admin) {
          emit("pin-admin-click", pin);
        } else {
          if (isPortal) emit("portal-select", pin);
          else emit("pin-select", pin);
        }
      });
      
      const loc = osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(parseFloat(pin.x), parseFloat(pin.y)));
      osdViewer.addOverlay({
        element: el,
        location: loc,
        placement: OpenSeadragon.Placement.CENTER
      });
    }
  });

  if (isGlobe.value && globeInstance) {
    globeInstance
      .htmlElementsData(pinElementsData)
      .htmlLat(d => d.lat)
      .htmlLng(d => d.lng)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.innerHTML = d.html;
        el.className = "cursor-pointer transform -translate-x-1/2 -translate-y-1/2";
        el.style.pointerEvents = 'auto'; 
        
        const labelDiv = el.querySelector('.pin-label-content');
        if (labelDiv && !props.alwaysShowLabels) {
          el.addEventListener('mouseenter', () => {
            labelDiv.style.opacity = '1';
          });
          el.addEventListener('mouseleave', () => {
            labelDiv.style.opacity = '0';
          });
        }
        
        const pin = d;
        const isPortal = pin.pinType === 'portal';
        
        el.addEventListener("pointerdown", (e) => e.stopPropagation());
        el.addEventListener("pointerup", (e) => e.stopPropagation());
        el.addEventListener("mousedown", (e) => e.stopPropagation());
        el.addEventListener("mouseup", (e) => e.stopPropagation());
        el.addEventListener("touchstart", (e) => e.stopPropagation());
        el.addEventListener("touchend", (e) => e.stopPropagation());
        
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (props.admin) {
            emit("pin-admin-click", pin);
          } else {
            if (isPortal) emit("portal-select", pin);
            else emit("pin-select", pin);
          }
        });
        
        return el;
      });
  }
}

function focusAt(x, y) {
  const cfg = getMapConfig(mountedMapId);
  
  if (cfg.tileMode && !props.globeMode && leafletMap) {
    leafletMap.flyTo([y, x], leafletMap.getMaxZoom() - 1, { animate: true, duration: 0.6 });
  } else if (cfg.tileMode && props.globeMode && globeInstance) {
    globeInstance.pointOfView({ lat: y, lng: x, altitude: 0.5 }, 1000);
  } else if (!cfg.tileMode && !props.globeMode && osdViewer) {
    const viewportPoint = osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(x, y));
    osdViewer.viewport.panTo(viewportPoint);
    osdViewer.viewport.zoomTo(osdViewer.viewport.getMaxZoom() * 0.8);
  }
}

function zoomIn() {
  if (isLeaflet.value && leafletMap) leafletMap.zoomIn();
  if (isGlobe.value && globeInstance) {
    const current = globeInstance.pointOfView();
    globeInstance.pointOfView({ ...current, altitude: Math.max(0.1, current.altitude - 0.5) }, 500);
  }
  if (!isLeaflet.value && !isGlobe.value && osdViewer) osdViewer.viewport.zoomBy(1.2);
}

function zoomOut() {
  if (isLeaflet.value && leafletMap) leafletMap.zoomOut();
  if (isGlobe.value && globeInstance) {
    const current = globeInstance.pointOfView();
    globeInstance.pointOfView({ ...current, altitude: Math.min(4, current.altitude + 0.5) }, 500);
  }
  if (!isLeaflet.value && !isGlobe.value && osdViewer) {
    const minZoom = osdViewer.viewport.getHomeZoom();
    const targetZoom = osdViewer.viewport.getZoom() * 0.8;
    osdViewer.viewport.zoomTo(Math.max(targetZoom, minZoom));
  }
}

defineExpose({ focusAt, zoomIn, zoomOut });

onMounted(() => mountMap(props.mapId));

watch(
  () => props.mapId,
  (newId) => mountMap(newId)
);

watch(() => props.globeMode, () => mountMap(props.mapId));

watch(() => props.showPoliticalDivision, (newVal) => {
  if (tileLayerInstance) {
    const lyrs = newVal ? 'y' : 's';
    tileLayerInstance.setUrl(`https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&hl=pt-BR`);
  }
  
  if (globeInstance) {
    if (newVal) {
      fetch('/countries-pt.json')
        .then(res => res.json())
        .then(data => {
          if (globeInstance && props.showPoliticalDivision) {
            globeInstance.labelsData(data.ref_country_codes);
          }
        });
    } else {
      globeInstance.labelsData([]);
    }
  }
});

watch(
  () => props.pins,
  () => drawPins(),
  { deep: true }
);

watch(() => props.showJourney, () => drawPins());

watch(
  () => props.alwaysShowLabels,
  () => drawPins()
);

onBeforeUnmount(() => {
  destroyLeaflet();
  destroyGlobe();
  destroyOSD();
});
</script>

<template>
  <div class="h-full w-full relative bg-night custom-cursor">
    <!-- Contêiner do Leaflet (Usado para o mapa Moderno) -->
    <div 
      v-if="isLeaflet" 
      ref="leafletElement" 
      class="absolute inset-0"
    />
    
    <!-- Contêiner do Globe (Usado para o globo Moderno) -->
    <div 
      v-if="isGlobe" 
      ref="globeElement" 
      class="absolute inset-0"
    />
    
    <!-- Contêiner do OpenSeadragon (Usado para mapas de alta resolução DZI) -->
    <div 
      v-if="!isLeaflet && !isGlobe" 
      ref="osdElement" 
      class="absolute inset-0"
    />
  </div>
</template>

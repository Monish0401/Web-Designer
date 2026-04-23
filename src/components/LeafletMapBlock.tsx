import React, { useEffect, useRef } from 'react';
import { BlockContent } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMapBlockProps {
  mapData?: BlockContent['mapData'];
}

const getAssetUrls = (basePath: string) => ({
  js: `${basePath.replace(/\/$/, '')}./leaflet.js`,
  css: `${basePath.replace(/\/$/, '')}./leaflet.css`,
});

const ensureLeafletLoaded = async (assetBasePath: string) => {
  const { js, css } = getAssetUrls(assetBasePath);

  if (!document.querySelector(`link[href="${css}"]`)) {
    const cssTag = document.createElement('link');
    cssTag.rel = 'stylesheet';
    cssTag.href = css;
    document.head.appendChild(cssTag);
  }

  if (window.L) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = js;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Leaflet script from ${js}`));
    document.body.appendChild(script);
  });
};

const getTileLayers = (L: any, mapData?: BlockContent['mapData']) => {
  const mode = mapData?.tileSourceMode ?? 'offline';

  if (mode === 'offline') {
    const urlTemplate = mapData?.tileUrlTemplate || './map-tiles/{z}/{x}/{y}.png';

    return {
      offline: L.tileLayer(urlTemplate, {
        attribution: 'Offline tiles',
        maxZoom: 19,
      }),
    };
  }

  return {
    street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenTopoMap contributors',
      maxZoom: 17,
    }),
    satellite: L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }
    ),
  };
};

export const LeafletMapBlock: React.FC<LeafletMapBlockProps> = ({ mapData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const assetBasePath = mapData?.leafletAssetPath || '/leaflet';
        await ensureLeafletLoaded(assetBasePath);
        if (cancelled || !mapRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const L = window.L;
        const latitude = mapData?.latitude ?? 20.5937;
        const longitude = mapData?.longitude ?? 78.9629;
        const zoom = mapData?.zoom ?? 5;

        const map = L.map(mapRef.current, {
          zoomControl: mapData?.showZoomControl ?? true,
          scrollWheelZoom: mapData?.enableScrollZoom ?? true,
        }).setView([latitude, longitude], zoom);

        mapInstanceRef.current = map;

        const tileLayers = getTileLayers(L, mapData);
        const isOfflineMode = (mapData?.tileSourceMode ?? 'offline') === 'offline';
        const selectedLayer = isOfflineMode ? 'offline' : mapData?.tileStyle || 'street';

        tileLayers[selectedLayer].addTo(map);

        if ((mapData?.showLayerControl ?? true) && !isOfflineMode) {
          L.control
            .layers(
              {
                Street: tileLayers.street,
                Terrain: tileLayers.terrain,
                Satellite: tileLayers.satellite,
              },
              undefined,
              { collapsed: true }
            )
            .addTo(map);
        }

        if (mapData?.showScale ?? true) {
          L.control.scale().addTo(map);
        }

        markerRef.current = L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(mapData?.markerLabel || 'Selected location')
          .openPopup();

        if (mapData?.enableLiveLocation && navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude: lat, longitude: lng } = position.coords;
              markerRef.current?.setLatLng([lat, lng]);
              map.panTo([lat, lng]);
            },
            () => undefined,
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      } catch (error) {
        if (mapRef.current) {
          mapRef.current.innerHTML = `<div class="map-error">Map failed. Place Leaflet assets in <code>${mapData?.leafletAssetPath || '/leaflet'}</code>.</div>`;
        }
        console.error(error);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [mapData]);

  return <div ref={mapRef} className="leaflet-map-wrapper" />;
};

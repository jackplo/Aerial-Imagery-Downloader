import { MapContainer, TileLayer, useMap, useMapEvent } from 'react-leaflet'
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css'
import './App.css'
import { LatLngBounds, LatLngExpression } from 'leaflet';
import MapControls from './MapControls';
import { useEffect, useState, useRef } from 'react';
import fetchTile from './services/FetchTile';
import latLngToTileCoords from './services/LatLngToTile';
import crashData from '../2024_crash.json';
import randomZoomRange from './services/RandomZoomRange';
import L from 'leaflet';

function Map() {
    const [isCaptureMode, setIsCaptureMode] = useState(false);
    const mapUrl = `https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    const position: LatLngExpression = [27.9944024, -81.7602544];
    const floridaBounds = new LatLngBounds(
        [24.396308, -87.634918],
        [31.000968, -80.031362]
    );

    const toggleCaptureMode = () => {
        setIsCaptureMode((prev) => !prev);
    }
    
    return (
        <div className="map-wrapper">
        <MapContainer maxBounds={floridaBounds} minZoom={7} maxBoundsViscosity={1.0} center={position} style={{height: "100%", width: "100%"}} zoom={7}>
            <TileLayer maxZoom={22}
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url={mapUrl}
            />
            <HeatmapLayer data={crashData} />
            <CursorStyleUpdater isCaptureMode={isCaptureMode} />
            <MapClickHandler isCaptureMode={isCaptureMode} setIsCaptureMode={setIsCaptureMode} />
            <ZoomLevelDisplay />
            <MapControls isCaptureMode={isCaptureMode} toggleCaptureMode={toggleCaptureMode}/>
        </MapContainer>
        </div>
    )
}

function MapClickHandler({ isCaptureMode, setIsCaptureMode }: { isCaptureMode: boolean; setIsCaptureMode: (state: boolean) => void }) {
    const map = useMap();
    
    useMapEvent("click", (e) => {
        if ((e.originalEvent.target as HTMLElement).closest(".capture-button")) {
            return;
        }

        if (isCaptureMode) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            let zoom = map.getZoom();

            const { x, y } = latLngToTileCoords(lat, lon, zoom);

            fetchTile(y, x, zoom);
            setIsCaptureMode(false);
        }
    });

    return null;
}

function CursorStyleUpdater({ isCaptureMode }: { isCaptureMode: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (isCaptureMode) {
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.getContainer().style.cursor = 'default';
        }
    }, [isCaptureMode, map]);

    return null;
}

function ZoomLevelDisplay() {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const onZoom = () => setZoom(map.getZoom());
        map.on('zoomend', onZoom);

        return () => {
            map.off('zoomend', onZoom);
        };
    }, [map]);

    return (
        <div className="zoom-level-box">
            Zoom: {zoom}
        </div>
    );
}

function HeatmapLayer({ data }: { data: { lat: number; lng: number }[] }) {
    const map = useMap();
    const heatLayerRef = useRef<L.Layer | null>(null);
    const pointLayerRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        const updateLayers = () => {
            const zoom = map.getZoom();

            // Remove both layers before adding back what we need
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
            if (pointLayerRef.current) {
                map.removeLayer(pointLayerRef.current);
                pointLayerRef.current = null;
            }

            // Add heatmap if zoom <= 18
            if (zoom <= 18) {
                const heatPoints = data.map(p => [p.lat, p.lng, 1.0]);
                const heat = (L as any).heatLayer(heatPoints, {
                    radius: 35,
                    blur: 10,
                    gradient: {
                        0.1: '#ffcccc',
                        0.3: '#ff6666',
                        0.5: '#ff3333',
                        0.7: '#cc0000',
                        1.0: '#800000',
                    },
                }).addTo(map);
                heatLayerRef.current = heat;
            }

            // Add points if zoom >= 15
            if (zoom >= 13) {
                const markers = L.layerGroup(
                    data.map(p =>
                        L.circleMarker([p.lat, p.lng], {
                            radius: 4,
                            color: '#cc0000',
                            fillColor: '#ff3333',
                            fillOpacity: 0.6,
                            weight: 1,
                        })
                    )
                ).addTo(map);
                pointLayerRef.current = markers;
            }
        };

        updateLayers(); // Initial load
        map.on('zoomend', updateLayers);

        return () => {
            map.off('zoomend', updateLayers);
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
            if (pointLayerRef.current) {
                map.removeLayer(pointLayerRef.current);
            }
        };
    }, [data, map]);

    return null;
}

export default Map;
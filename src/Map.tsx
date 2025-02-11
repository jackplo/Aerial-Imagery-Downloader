import { MapContainer, TileLayer, useMap, useMapEvent } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { LatLngBounds, LatLngExpression } from 'leaflet';
import MapControls from './MapControls';
import { useEffect, useState } from 'react';
import fetchTile from './services/FetchTile';
import latLngToTileCoords from './services/LatLngToTile';
import randomZoomRange from './services/RandomZoomRange';

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
            <CursorStyleUpdater isCaptureMode={isCaptureMode} />
            <MapClickHandler isCaptureMode={isCaptureMode} setIsCaptureMode={setIsCaptureMode} />
            <MapControls isCaptureMode={isCaptureMode} toggleCaptureMode={toggleCaptureMode}/>
        </MapContainer>
        </div>
    )
}

function MapClickHandler({ isCaptureMode, setIsCaptureMode }: { isCaptureMode: boolean; setIsCaptureMode: (state: boolean) => void }) {
    useMapEvent("click", (e) => {
        if ((e.originalEvent.target as HTMLElement).closest(".capture-button")) {
            return;
        }

        if (isCaptureMode) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            let zoom = randomZoomRange();

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

export default Map;
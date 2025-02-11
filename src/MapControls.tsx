import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from "react-bootstrap";

/* For reference
const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}
*/

interface MapControlsProps {
    isCaptureMode: boolean;
    toggleCaptureMode: () => void;
}

function MapControls({ isCaptureMode, toggleCaptureMode }: MapControlsProps) {

    return (
        <div className="leaflet-top leaflet-right leaflet-control p-4 pe-auto">
            <Button className="capture-button" onClick={(toggleCaptureMode)} variant={isCaptureMode ? "danger" : "light"}>
                <FontAwesomeIcon icon={isCaptureMode ? faTimes : faCamera}/>
            </Button>
        </div>
    )
}

export default MapControls;

import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    InfoWindow,
} from "@vis.gl/react-google-maps"

export function ViewMap(){
    const position = {lat: 1.35, lng: 103.82};
    return(
        <>
            <APIProvider apiKey={import.meta.env.VITE_GMAP_APIKEY}>
                <div style={{height: "100vh"}}>
                    <Map zoom={11} center={position}></Map>
                </div>
            </APIProvider>
        </>
    )
}
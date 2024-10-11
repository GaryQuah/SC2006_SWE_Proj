import React from 'react';
import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

export default function Intro() {
  const position = { lat: 1.290270, lng: 103.851959};
  const [open, setOpen] = useState(false);

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY|| ""}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map defaultZoom={14} defaultCenter={position} mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}>
          <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin
              background={"grey"}
              borderColor={"green"}
              glyphColor={"purple"}
            />
          </AdvancedMarker>

          {open && (
            <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
              <p>I'm here</p>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

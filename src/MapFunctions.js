import React, { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 1.290270, lng: 103.851959 }; // Default center position

export default function MapFunctions() {
  const [directions, setDirections] = useState(null);
  const [postalCode, setPostalCode] = useState("");
  const [distance, setDistance] = useState("");
  const [waypoint, setWaypoint] = useState(null);
  const [open, setOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(center);
  const [parks, setParks] = useState([]); // State for park locations
  const [selectedPark, setSelectedPark] = useState(null); // State for selected park


  const mapRef = useRef(null);


  const handleLoad = (map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = (park) => {
    setSelectedPark(park); // Set the clicked park as the selected park
  };

  const generateRoute = () => {
    if (!postalCode || !distance) {
      alert("Please enter both a postal code and a distance.");
      return;
    }


    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: postalCode }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const originLatLng = results[0].geometry.location;

        // Set marker position to origin location
        setMarkerPosition(originLatLng);
        setOpen(true);

        // Calculate random waypoint based on distance
        const randomWaypoint = getRandomWaypoint(originLatLng, distance * 0.621371);
        setWaypoint(randomWaypoint);
        const waypoints = [{ location: randomWaypoint, stopover: true }];

        // Request directions from DirectionsService
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: originLatLng,
            destination: originLatLng,
            travelMode: window.google.maps.TravelMode.WALKING,
            waypoints: waypoints,
            optimizeWaypoints: false,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              console.error(`Error fetching directions: ${status}`);
              alert(`Error fetching directions: ${status}`);
            }
          }
        );
      } else {
        console.error(`Geocoding failed: ${status}`);
        alert(`Geocoding failed: ${status}`);
      }
    });
  };

    // Generate a loop route
    const generateLoop = () => {
      if (!postalCode || !distance) {
        alert("Please enter both a postal code and a distance.");
        return;
      }
  
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: postalCode }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          const originLatLng = results[0].geometry.location;
  
          setMarkerPosition(originLatLng);
  
          const numberOfWaypoints = 3; // Create multiple waypoints for the loop
          const loopWaypoints = Array.from({ length: numberOfWaypoints }, () =>
            getRandomWaypoint(originLatLng, distance * 0.621371)
          );
          setWaypoint(loopWaypoints);
  
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: originLatLng,
              destination: originLatLng, // Loop back to the origin
              travelMode: window.google.maps.TravelMode.WALKING,
              waypoints: loopWaypoints.map((point) => ({
                location: point,
                stopover: true,
              })),
              optimizeWaypoints: true,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);
              } else {
                console.error(`Error fetching directions: ${status}`);
                alert(`Error fetching directions: ${status}`);
              }
            }
          );
        } else {
          console.error(`Geocoding failed: ${status}`);
          alert(`Geocoding failed: ${status}`);
        }
      });
    };

  const fetchParks = (location) => {
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: location,
        radius: 5000, // Search within 5 km
        type: ["park"], // Specify park type
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setParks(results); // Set the fetched parks to state
        } else {
          console.error(`Error fetching parks: ${status}`);
        }
      }
    );
  };

  const handleFetchParks = () => {
    if (markerPosition) {
      fetchParks(markerPosition); // Fetch parks near the current marker position
    } else {
      alert("Please generate a route first to get the origin location.");
    }
  };

  const getRandomWaypoint = (originLatLng, distance) => {
    const latOffset = (Math.random() - 0.5) * (distance / 69);
    const lngOffset = (Math.random() - 0.5) * (distance / (69 * Math.cos(originLatLng.lat() * Math.PI / 180)));
    return {
      lat: originLatLng.lat() + latOffset,
      lng: originLatLng.lng() + lngOffset,
    };
  };

  const resetMap = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(14);
      setDirections(null);
      setWaypoint(null);
      setOpen(false);
      setParks([]); // Clear parks when resetting
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div>
        <h3>Generate Route</h3>
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="Enter postal code"
        />
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="Distance (km)"
        />
        <button onClick={generateRoute}>Generate Route</button>
        <button onClick={generateLoop}>Generate Loop</button>
        <button onClick={handleFetchParks}>Fetch Parks</button> {/* New button to fetch parks */}
        <button onClick={resetMap}>Reset Map</button>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
          onLoad={handleLoad}
          gestureHandling="greedy"
        >
          {directions && <DirectionsRenderer directions={directions} />}

          {/* Marker for the origin location */}
          <Marker
            position={markerPosition}
            title="Origin"
            onClick={() => setOpen(true)}
          />

          {/* InfoWindow for the origin marker */}
          {open && (
            <InfoWindow position={markerPosition} onCloseClick={() => setOpen(false)}>
              <p>Origin: {postalCode}</p>
            </InfoWindow>
          )}

          {/* Marker for the random waypoint */}
          {waypoint && (
            <Marker
              position={waypoint}
              title="Random Waypoint"
            />
          )}

          {/* Markers for parks */}
          {parks.map((park) => (
            <Marker
              key={park.place_id}
              position={park.geometry.location}
              title={park.name}
              icon={{
                url: "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg", // Custom icon URL
                scaledSize: new window.google.maps.Size(30, 30), // Resize the icon
              }}
              onClick={() => handleMarkerClick(park)} // Example onClick event
            />
          ))}
            
             {/* InfoWindow for selected park */}
          {selectedPark && (
            <InfoWindow
              position={selectedPark.geometry.location}
              onCloseClick={() => setSelectedPark(null)} // Close InfoWindow on close click
            >
              <div>
                <h4>{selectedPark.name}</h4>
                <p>{selectedPark.vicinity}</p>
                {selectedPark.photos && (
                  <img
                    src={selectedPark.photos[0].getUrl()}
                    alt={selectedPark.name}
                    style={{ width: "100px", height: "100px" }}
                  />
                )}
              </div>
            </InfoWindow>
          )}
          
        </GoogleMap>
      </div>
    </LoadScript>
  );
}
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";

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
  const [openOrigin, setOpenOrigin] = useState(false); // State for origin InfoWindow
  const [openWaypoint, setOpenWaypoint] = useState(false); // State for waypoint InfoWindow
  const [markerPosition, setOriginMarkerPosition] = useState(center);
  const [endPointPosition, setEndMarkerPosition] = useState(center);
  
  const [parks, setParks] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);
  const mapRef = useRef(null);

  const [originPointName, setOriginPointName] = useState(false);
  const [endPointName, setEndPointName] = useState(false);

  const originPointIcon = "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg"; // Replace with your logo URL

  const [originImage, setOriginImage] = useState(""); 
  const [endImage, setEndImage] = useState(""); 
  const endPointIcon = "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg"; // Replace with your logo URL

  //Weather related
  const [originWeatherData, setOriginWeatherData] = useState(null);
  const [originUVData, setOriginUVData] = useState(null);

  const [originLatitude, setOriginLatitude] = useState("");
  const [originLongitude, setOriginLongitude] = useState("");

  const [endpointWeatherData, setEndWeatherData] = useState(null);
  const [endpointUVData, setEndUVData] = useState(null);

  const [endpointLatitude, setEndLatitude] = useState("");
  const [endpointLongitude, setEndLongitude] = useState("");



  const WEATHER_API_KEY = "704bf997547d0f7ed616723a4499158b"; // Replace with your OpenWeatherMap API key

  const fetchWeatherDataOrigin = async () => {

    try {
      // Fetch weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${markerPosition.lat}&lon=${markerPosition.lng}&appid=${WEATHER_API_KEY}&units=metric`
      );
      setOriginWeatherData(weatherResponse.data);

      // Fetch UV data
      const uvResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${markerPosition.lat}&lon=${markerPosition.lng}&appid=${WEATHER_API_KEY}`
      );
      setOriginUVData(uvResponse.data);
    } catch (err) {
  };
}

const fetchWeatherDataEnd = async () => {

  try {
    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${endPointPosition.lat}&lon=${endPointPosition.lng}&appid=${WEATHER_API_KEY}&units=metric`
    );
    setEndWeatherData(weatherResponse.data);

    // Fetch UV data
    const uvResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${endPointPosition.lat}&lon=${endPointPosition.lng}&appid=${WEATHER_API_KEY}`
    );
    setEndUVData(uvResponse.data);
  } catch (err) {
};
}


  const handleLoad = (map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = (park) => {
    setSelectedPark(park);
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
        setOriginPointName(results[0].formatted_address); // Store origin name
        setOriginImage(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${originLatLng.lat()},${originLatLng.lng()}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`); // Street View image for origin
  
        setOriginMarkerPosition(originLatLng);
        setOpenOrigin(false);
        fetchWeatherDataOrigin();
  
        // Calculate random waypoint based on distance
        const randomWaypoint = getRandomWaypoint(originLatLng, distance);
        setWaypoint(randomWaypoint);

        // Geocode the waypoint location
        geocoder.geocode({ location: randomWaypoint }, (results, status) => {
          if (status === "OK" && results.length > 0) {
            setEndPointName(results[0].formatted_address); // Store endpoint name
            setEndImage(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${randomWaypoint.lat},${randomWaypoint.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`); // Street View image for endpoint
            setEndMarkerPosition(randomWaypoint);
            fetchWeatherDataEnd();

            // Request directions from DirectionsService
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
              {
                origin: originLatLng,
                destination: randomWaypoint, // Set destination to the waypoint
                travelMode: window.google.maps.TravelMode.WALKING,
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
            console.error(`Geocoding waypoint failed: ${status}`);
            alert(`Geocoding waypoint failed: ${status}`);
          }
        });
      } else {
        console.error(`Geocoding origin failed: ${status}`);
        alert(`Geocoding origin failed: ${status}`);
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

          setOriginMarkerPosition(originLatLng);
  
          const numberOfWaypoints = 3; // Create multiple waypoints for the loop
          const loopWaypoints = Array.from({ length: numberOfWaypoints }, () =>
            getRandomWaypoint(originLatLng, distance ) //* 0.621371
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
      //setOpen(false);
      setParks([]); // Clear parks when resetting
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div>
        {/*<h3>Generate Route</h3>*/}
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
        <button onClick={handleFetchParks}>Fetch Parks</button>
        <button onClick={resetMap}>Reset Map</button>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID}
          onLoad={handleLoad}
          gestureHandling="greedy"
        >
          {directions && (
            <DirectionsRenderer 
              directions={directions} 
              options={{ suppressMarkers: true }}
            />
          )}

          {/* Origin Marker */}
          <Marker
            position={markerPosition}
            title="Origin"
            icon={{
              url: "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg", // Use your custom logo URL
              scaledSize: new window.google.maps.Size(30, 30), // Scale to desired size
            }}
            onClick={() => {
              setOpenOrigin(true); // Open origin InfoWindow
            }}
          />

          {/* Waypoint Marker */}
          {waypoint && (
            <Marker
              position={waypoint}
              title="Random Waypoint"
              icon={{
                url: "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg", // Use your custom logo URL
                scaledSize: new window.google.maps.Size(30, 30), // Scale to desired size
              }}
              onClick={() => {
                setOpenWaypoint(true); // Open waypoint InfoWindow
              }}
            />
          )}
          
          {/* InfoWindow for the origin marker */}
          {openOrigin && (
            <InfoWindow position={markerPosition} onCloseClick={() => setOpenOrigin(false)}>
              <div>
                <p>Origin: {originPointName}</p>
                <p>Temperature: {originWeatherData.main.temp} °C</p>
                <p>Weather: {originWeatherData.weather[0].description}</p>
                <p>UV Index: {originUVData.value}</p>

                {originImage && <img src={originImage} alt="Origin" style={{ width: "100px", height: "100px" }} />} {/* Display origin image */}
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for the waypoint marker */}
          {openWaypoint && (
            <InfoWindow position={waypoint} onCloseClick={() => setOpenWaypoint(false)}>
              <div>
                <p>EndPoint: {endPointName}</p>
                <p>Temperature: {endpointWeatherData.main.temp} °C</p>
                <p>Weather: {endpointWeatherData.weather[0].description}</p>
                <p>UV Index: {endpointUVData.value}</p>
                
                {endImage && <img src={endImage} alt="Endpoint" style={{ width: "100px", height: "100px" }} />} {/* Display endpoint image */}
              </div>
            </InfoWindow>
          )}

          {/* Markers for parks */}
          {parks.map((park) => (
            <Marker
              key={park.place_id}
              position={park.geometry.location}
              title={park.name}
              icon={{
                url: "https://icon-library.com/images/park-icon-png/park-icon-png-9.jpg",
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              onClick={() => handleMarkerClick(park)}
            />
          ))}
          
          {/* InfoWindow for selected park */}
          {selectedPark && (
            <InfoWindow
              position={selectedPark.geometry.location}
              onCloseClick={() => setSelectedPark(null)}
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
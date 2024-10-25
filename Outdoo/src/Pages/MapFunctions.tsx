import { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import { NavLink } from "react-router-dom";

import mapstyle from "./css/Map.module.css";
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"

// Define interfaces for data structures
interface WeatherData {
  main: {
    temp: number;
  };
  weather: {
    description: string;
  }[];
}

interface UvData {
  value: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: LatLng;
  };
  photos?: {
    getUrl: () => string;
  }[];
}

interface ImportMeta {
  env: {
    VITE_GMAP_APIKEY: string;
    // Add other environment variables here as needed
  };
}

const containerStyle = {
  width: "100%",
  height: "86vh",
};

const center = { lat: 1.290270, lng: 103.851959 }; // Default center position

const ActivitiesList = [
  "Yoga",
  "Pilates",
  "Gym",
  "Spinning",
  "Bowling",
  "Table Tennis",
  "Squash",
  "Bouldering",
  "Dance",
  "Gymnastics",
  "Zumba",
  "Indoor Cycling",
  "Jump Rope",
  "Kickboxing",
  "Aerobics",
  "Handball",
  "Basketball",
  "Badminton",
  "Running",
  "Cycling",
  "Hiking",
  "Volleyball",
  "Kayaking",
  "Skating",
  "Dragon Boating",
  "Outdoor Yoga",
  "Soccer",
  "Snowboarding",
  "Tennis",
  "Rollerblading",
  "Wakeboarding",
  "Fishing",
  "Basketball",
  "Archery",
  "Windsurfing",
  "Trail Running",
  "Frisbee",
  "Kite Flying",
];


export function MapFunctions() {  
  
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [postalCode, setPostalCode] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [_waypoint, setWaypoint] = useState<LatLng[] | null>(null);
  const [_openOrigin, setOpenOrigin] = useState<boolean>(false);
  const [_openWaypoint, setOpenWaypoint] = useState<boolean>(false);
  const [markerPosition, setOriginMarkerPosition] = useState<LatLng>(center);
  const [endPointPosition, setEndMarkerPosition] = useState<LatLng>(center);
  const [parks, setParks] = useState<Place[]>([]);
  const [selectedPark, setSelectedPark] = useState<Place | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [communityCenters, setCommunityCenters] = useState<Place[]>([]);
  const [selectedCommunityCenter, setSelectedCommunityCenter] = useState<Place | null>(null);
  const [_originPointName, setOriginPointName] = useState<string>("");
  const [_endPointName, setEndPointName] = useState<string>("");
  const [_originImage, setOriginImage] = useState<string>("");
  const [_endImage, setEndImage] = useState<string>("");
  const [_originWeatherData, setOriginWeatherData] = useState<WeatherData | null>(null);
  const [_originUVData, setOriginUVData] = useState<UvData | null>(null);
  const [_endpointWeatherData, setEndWeatherData] = useState<WeatherData | null>(null);
  const [_endpointUVData, setEndUVData] = useState<UvData | null>(null);

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

  const handleLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = (park: Place) => {
    setSelectedPark(park);
  };

  const handleCommunityCenterClick = (center: Place) => {
    setSelectedCommunityCenter(center); // Set selected community center when clicked
  };

  const generateRoute = () => {
    if (!postalCode || !distance) {
      alert("Please enter both a postal code and a distance.");
      return;
    }
  
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: postalCode }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const originLatLng = results[0].geometry.location.toJSON();
        setOriginPointName(results[0].formatted_address); // Store origin name
        setOriginImage(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${originLatLng.lat},${originLatLng.lng}&key=${import.meta.env.VITE_GMAP_APIKEY}`); // Street View image for origin
        setOriginMarkerPosition(originLatLng);
        setOpenOrigin(false);
        fetchWeatherDataOrigin();
  
        // Calculate random waypoint based on distance
        const randomWaypoint = getRandomWaypoint(originLatLng, parseFloat(distance));
        setWaypoint([randomWaypoint]);

        // Geocode the waypoint location
        geocoder.geocode({ location: randomWaypoint }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            setEndPointName(results[0].formatted_address); // Store endpoint name
            setEndImage(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${randomWaypoint.lat},${randomWaypoint.lng}&key=${import.meta.env.VITE_GMAP_APIKEY}`); // Street View image for endpoint
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
        if (status === "OK" && results && results.length > 0) {
          const originLatLng = results[0].geometry.location.toJSON();

          setOriginMarkerPosition(originLatLng);
  
          const numberOfWaypoints = 3; // Create multiple waypoints for the loop
          const loopWaypoints = Array.from({ length: numberOfWaypoints }, () =>
            getRandomWaypoint(originLatLng, parseFloat(distance) ) //* 0.621371
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

  const fetchParks = (location: LatLng) => {
    const service = new window.google.maps.places.PlacesService(mapRef.current!);
    service.nearbySearch(
      {
        location: location,
        radius: 5000, // Search within 5 km
        type: "park", // Specify park type
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const convertedResults: Place[] = results.map((result) => {
            const location = result.geometry?.location;
  
            // Ensure location is defined and convert it
            const latLng: LatLng = {
              lat: location ? location.lat() : 0,
              lng: location ? location.lng() : 0,
            };
  
            return {
              place_id: result.place_id || "",
              name: result.name || "",
              vicinity: result.vicinity || "",
              geometry: { location: latLng },
              photos: result.photos?.map((photo) => ({
                getUrl: photo.getUrl,
              })),
            };
          });
  
          setParks(convertedResults); // Set the converted array // Set the fetched parks to state
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

  const fetchCommunityCenters = (location: LatLng) => {
    const service = new window.google.maps.places.PlacesService(mapRef.current!);
    service.nearbySearch(
      {
        location: location,
        radius: 5000, // Search within 5 km
        keyword: "community center", // Use keyword to find community centers
        type: "establishment", // Broad type to include community centers
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const convertedResults: Place[] = results.map((result) => {
            const location = result.geometry?.location;
  
            const latLng: LatLng = {
              lat: location ? location.lat() : 0,
              lng: location ? location.lng() : 0,
            };
  
            return {
              place_id: result.place_id || "",
              name: result.name || "",
              vicinity: result.vicinity || "",
              geometry: { location: latLng },
              photos: result.photos?.map((photo) => ({
                getUrl: photo.getUrl,
              })),
            };
          });
  
          setCommunityCenters(convertedResults);  // Set the fetched community centers to state
        } else {
          console.error(`Error fetching community centers: ${status}`);
        }
      }
    );
  };

  const handleFetchCommunityCenters = () => {
    if (markerPosition) {
      fetchCommunityCenters(markerPosition); // Fetch community centers near the current marker position
    } else {
      alert("Please generate a route first to get the origin location.");
    }
  };

  const getRandomWaypoint = (originLatLng: LatLng, distance: number) => {
    const latOffset = (Math.random() - 0.5) * (distance / 69);
    const lngOffset = (Math.random() - 0.5) * (distance / (69 * Math.cos(originLatLng.lat * Math.PI / 180)));
    return {
      lat: originLatLng.lat + latOffset,
      lng: originLatLng.lng + lngOffset,
    };
  };

  const resetMap = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);  // Reset to default center
      mapRef.current.setZoom(14);        // Reset zoom level
  
      setDirections(null);               // Clear directions
      setWaypoint(null);                 // Clear waypoints
      setOriginMarkerPosition(center);   // Reset origin marker to default position
      setEndMarkerPosition(center);      // Reset endpoint marker to default position

      setParks([]);                      // Clear parks
      setSelectedPark(null);             // Clear selected park
      setCommunityCenters([]);           // Clear community centers
      setSelectedCommunityCenter(null);  // Clear selected community center
  
      // Optionally close InfoWindows
      setOpenOrigin(false);              // Close origin InfoWindow
      setOpenWaypoint(false);            // Close waypoint InfoWindow
    }
  };

  return (
    <div>
      <div className={mapstyle.header}>
                    <div className={mapstyle.menu_logo}>                        
                        <div>
                            <NavLink to="/dashboard" className={mapstyle.logo}>
                                <img src={Hikingicon}></img>
                                <h4>Outdoo</h4>
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/" className={mapstyle.profile}>
                        <img src={Usericon}></img>
                    </NavLink>
                </div>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GMAP_APIKEY} libraries={["places"]}>
        <div>
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
          <button onClick={handleFetchCommunityCenters}>Fetch Community Centers</button> {/* New button */}
          <button onClick={resetMap}>Reset Map</button>

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={handleLoad}
            options={{gestureHandling: "greedy"}}
          >
            {directions && (
              <DirectionsRenderer 
                directions={directions} 
                options={{ suppressMarkers: true }}
              />
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

            {/* Markers for community centers */}
            {communityCenters.map((center) => (
              <Marker
                key={center.place_id}
                position={center.geometry.location}
                title={center.name}
                icon={{
                  url: "https://icon-library.com/images/24591-200.png", // Custom icon for community centers
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
                onClick={() => handleCommunityCenterClick(center)}
              />
            ))}

            {/* InfoWindow for selected community center */}
            {selectedCommunityCenter && (
              <InfoWindow
                position={selectedCommunityCenter.geometry.location}
                onCloseClick={() => setSelectedCommunityCenter(null)}
              >
                <div>
                  <h4>{selectedCommunityCenter.name}</h4>
                  <p>{selectedCommunityCenter.vicinity}</p>
                </div>
              </InfoWindow>
            )}
            
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
    </div>
  );
}
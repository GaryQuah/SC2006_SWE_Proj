import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

import mapstyle from "./css/Map.module.css";
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import { parse } from "path";

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

const center = { lat: 1.3521, lng: 103.8198 }; // Default center position
//const [postalCenter, setPostalCenter] = useState<LatLng>(center);
//const [postalCenter, setPostalCenter] = useState<LatLng>( { lat: 1.3521, lng: 103.8198 });

/*const ActivitiesList = [
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
*/

export function MapFunctions() {  
  //Values
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [postalCode, setPostalCode] = useState<string>("");
  const [distance, setDistance] = useState<string>("");

  //Icon Size of Markers
  const iconSize = window.google ? new window.google.maps.Size(30, 30) : null;
 
  //Display waypoint - if there is waypoint auto display on map
  const [_waypoint, setWaypoint] = useState<LatLng | null>(null);
  const [_openOrigin, setOpenOrigin] = useState<boolean>(false);

  const [_openWaypoint, setOpenWaypoint] = useState<boolean>(false);
  const [markerPosition, setOriginMarkerPosition] = useState<LatLng>(center);
  const [endPointPosition, setEndMarkerPosition] = useState<LatLng>(center);
  const mapRef = useRef<google.maps.Map | null>(null);

  //Parks
  const [parks, setParks] = useState<Place[]>([]);
  const [selectedPark, setSelectedPark] = useState<Place | null>(null);

  //Community center
  const [communityCenters, setCommunityCenters] = useState<Place[]>([]);
  const [selectedCommunityCenter, setSelectedCommunityCenter] = useState<Place | null>(null);

  //For activity locations
  const [selectedActivity, setSelectedActivity] = useState<string>("Yoga");
  const [activityLocations, setActivityLocations] = useState<Place[]>([]);
  const [showActivityMarkers, setShowActivityMarkers] = useState<boolean>(false);
  const [selectedActivityLocation, setSelectedActivityLocations] = useState<Place | null>(null);

  //Waypoints
  const [_originPointName, setOriginPointName] = useState<string>("");
  const [_endPointName, setEndPointName] = useState<string>("");
  const [_originImage, setOriginImage] = useState<string>("");
  const [_endImage, setEndImage] = useState<string>("");

  //Weather Data
  const [_originWeatherData, setOriginWeatherData] = useState<WeatherData | null>(null);
  const [_originUVData, setOriginUVData] = useState<UvData | null>(null);
  const [_endpointWeatherData, setEndWeatherData] = useState<WeatherData | null>(null);
  const [_endpointUVData, setEndUVData] = useState<UvData | null>(null);

  //API Keys - Change when / where needed
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY; 
  const GMAPS_API_KEY = import.meta.env.VITE_GMAP_APIKEY; 

  //Fetch activity data from get activity page
  const [ActivitiesList, setActivitiesList] = useState<string[]>([]); // Specify type as string[]
  const Activities_API_URL = 'http://127.0.0.1:5000/addactivity';
  const SendActivities_API_URL = 'http://127.0.0.1:5000/sendactivity';
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const addactivity_activity = localStorage.getItem('formdataactivity')
  const addactivity_location = localStorage.getItem('formdatalocation')
  const addactivity_time = localStorage.getItem('formdatatime')
  const suggestedactivity = localStorage.getItem('suggestedactivity')

  //
  const [postalCenter, setPostalCenter] = useState<LatLng | null>(null);

  //Communicate with backend
  const fetchActivities = async () => {  
    if(suggestedactivity){
      const activitiesArray = suggestedactivity
        .split(',')
        .map(activity => activity.trim());

      setActivitiesList(activitiesArray); // Set the activities list in state
    }

    if(addactivity_location){
      setPostalCode(addactivity_location)
    }
    
    const geocoder = new window.google.maps.Geocoder();
    // alert("Geocoding: " + response.data.location);

    geocoder.geocode({ address: postalCode }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const location = results[0].geometry.location;
        setPostalCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        // Ensure resetMap() is called after setPostalCenter has been set
        resetMap();
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  };
  
  const sendActivities = async () => {
    console.log("map key = " + "Bearer " + token)

    const getLocationName = async (postalCode: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: postalCode }, (results, status) => {
              if (status === "OK" && results && results.length > 0) {
                  // Type assertion to string because we know the result will be a string
                  resolve(results[0].formatted_address);
              } else {
                  reject(`Geocoding failed: ${status}`);
              }
          });
      });
  };
   
    //let  locationName =  selectedActivityLocation?.name + " " + selectedActivityLocation?.vicinity;
    //let  locationName =  selectedActivityLocation?.vicinity;
    let  locationName =  selectedActivityLocation?.name.trim()
    console.log("lcoationname = "+locationName)

    if (selectedActivity  == "Running" || selectedActivity  == "Cycling" || selectedActivity  == "Walking") 
    {
        locationName = await getLocationName(postalCode);
    }

    //axios.post(SendActivities_API_URL, {/*data to send here*/locationName, activityTime, selectedActivity} ,{headers:{ Authorization : "Bearer " + token}})
    //axios.post(SendActivities_API_URL, {/*data to send here*/postalCode, addactivity_time, selectedActivity} ,{headers:{ Authorization : "Bearer " + token}})
    axios.post(SendActivities_API_URL, {/*data to send here*/locationName, addactivity_time, selectedActivity} ,{headers:{ Authorization : "Bearer " + token}})
    .then(response => {
      navigate("/dashboard")
    })
    .catch(error => {
        if (error.response && error.response.status === 401) {
          navigate("/");
        } else {
            console.error("Error fetching dashboard data:", error);
        }
    });
  };
  // End of communicating with backend
  const fetchActivityLocations = (activity: string, location: LatLng) => {
    const service = new window.google.maps.places.PlacesService(mapRef.current!);
    const keyword = activity;

    service.nearbySearch(
      {
        location: location,
        radius: 20000, // Search within 10 km
        keyword: keyword, // Use the selected activity as a keyword
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

          setActivityLocations(convertedResults); // Set the fetched locations to state
        } else {
          console.error(`Error fetching locations: ${status}`);
        }
      }
    );
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShowActivityMarkers(true);
    setSelectedActivity(e.target.value);
    if (mapRef.current) {
      fetchActivityLocations(e.target.value, center); // Fetch locations based on the selected activity
    }
  };

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

    fetchActivities();
  };

  const handleMarkerClick = (park: Place) => {
    setSelectedPark(park);
  };

  const handleCommunityCenterClick = (center: Place) => {
    setSelectedCommunityCenter(center); // Set selected community center when clicked
  };

  const handleActivityClick = (center: Place) => {
    setSelectedActivityLocations(center); // Set selected community center when clicked
  };

 

  const generateRoute = () => {
    if (!postalCode || !distance) {
      alert("Please enter both a postal code and a distance.");
      return;
    }

    resetMap();
  
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: postalCode }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const originLatLng = results[0].geometry.location.toJSON();
        setOriginPointName(results[0].formatted_address); // Store origin name
        setOriginImage(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${originLatLng.lat},${originLatLng.lng}&key=${GMAPS_API_KEY}`); // Street View image for origin
        setOriginMarkerPosition(originLatLng);
        console.log("Marker Position:", markerPosition);
        setOpenOrigin(true);
        fetchWeatherDataOrigin();
  
        // Calculate random waypoint based on distance
        const randomWaypoint = getRandomWaypoint(originLatLng, parseFloat(distance));
        setWaypoint(randomWaypoint);

        // Geocode the waypoint location
        geocoder.geocode({ location: randomWaypoint }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            setEndPointName(results[0].formatted_address); // Store endpoint name
            setEndImage(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${randomWaypoint.lat},${randomWaypoint.lng}&key=${GMAPS_API_KEY}`); // Street View image for endpoint
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
          //setWaypoint(loopWaypoints[0]); - Since its to origin theres no need to render out the "endpoint"
  
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
      if(postalCenter)
      {
        mapRef.current.setCenter(postalCenter);  // Reset to default center
      }
      else
      {
        mapRef.current.setCenter(center);  // Reset to default center
      }
      
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
      
      setShowActivityMarkers(false);             // Close all the activity markers
    }
  };

  const Logout = () =>{
    localStorage.removeItem('token');
    localStorage.removeItem('formdataactivity');
    localStorage.removeItem('formdatalocation');
    localStorage.removeItem('formdatatime')
  };

  const Back=() =>{
    navigate("/dashboard");
  };

  useEffect(() => {
    fetchActivities()
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        // Optional cleanup logic if necessary (e.g., clear map markers, listeners, etc.)
        mapRef.current = null; // Clear the reference to the map
      }
    };
  }, []);

  useEffect(() => {
    if (postalCenter) {
      resetMap();
    }
  }, [postalCenter]);


  return (
    <div>
      <div className={mapstyle.header}>
          <NavLink to="/profile" className={mapstyle.profile}>
              <img src={Usericon}></img>
          </NavLink>
          <div className={mapstyle.menu_logo}>                        
              <div>
                  <NavLink to="/dashboard" className={mapstyle.logo}>
                      <img src={Hikingicon}></img>
                      <h3>Outdoo</h3>
                  </NavLink>
              </div>
          </div>
          <NavLink to="/" className={mapstyle.profile} onClick={Logout}>
              <h3 className={mapstyle.logout}>Logout</h3>
          </NavLink>
      </div>
      <LoadScript googleMapsApiKey={GMAPS_API_KEY} libraries={["places"]}>

          <div className={mapstyle.labelContainer}>
          <button className={mapstyle.buttonback} onClick={Back}>Back</button>
          <label >Postal Code:</label>
          <input className={mapstyle.searchInput1}
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal code"
          />

          <label  >Distance (km):</label>
          <input className={mapstyle.searchInput2}
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Distance (km)"
          />

            <button className={mapstyle.button1} onClick={generateRoute}>Generate Route</button>
            <button className={mapstyle.button1}  onClick={generateLoop}>Generate Loop</button>
        </div>

        
        <div className={mapstyle.container}>

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

          {/* Waypoint Marker */}
          {_waypoint && (
            <Marker
              position={_waypoint}
              title="Random Waypoint"
              icon={{
                url: "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg", // Use your custom logo URL
                scaledSize: iconSize
              }}
              onClick={() => {
                setOpenWaypoint(true); // Open waypoint InfoWindow
              }}
            />
          )}

          {/* Origin Marker */}
          {markerPosition && (
            <Marker
              position={markerPosition}
              title="Random Waypoint"
              icon={{
                url: "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg", // Use your custom logo URL
                scaledSize: iconSize // Scale to desired size
              }}
              onClick={() => {
                setOpenOrigin(true); // Open waypoint InfoWindow
              }}
            />
          )}
          
          {/* InfoWindow for the origin marker */}
          {_openOrigin && (
            <InfoWindow position={markerPosition} onCloseClick={() => setOpenOrigin(false)}>
              <div>
                <p> <strong> Origin:</strong> {_originPointName}</p>

              <div className={mapstyle.infoWindowtext}>
              {_originImage && <img  className={mapstyle.img} src={_originImage} alt="Origin" style={{ width: "100px", height: "100px" }} />} {/* Display origin image */}
                {_originWeatherData && _originWeatherData.main && (
                <p><strong>Temperature:</strong> {_originWeatherData.main.temp} °C</p>
                )}
                {_originWeatherData && _originWeatherData.weather && _originWeatherData.weather[0] && (
                  <p><strong>Weather:</strong>{_originWeatherData.weather[0].description}</p>
                )}
                {_originUVData && (
                  <p><strong>UV Index:</strong> {_originUVData.value}</p>
                )}

                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for the waypoint marker */}
          {_openWaypoint && _waypoint  && (
            <InfoWindow position={_waypoint} onCloseClick={() => setOpenWaypoint(false)}>
              <div className={mapstyle.infoWindowtext}>
                <p><strong>EndPoint:</strong> {_endPointName}</p>
                {_endImage && <img src={_endImage} alt="Endpoint" style={{ width: "100px", height: "100px" }} />} {/* Display endpoint image */}
                {_endpointWeatherData && _endpointWeatherData.main && (
                <p><strong> Temperature:</strong> {_endpointWeatherData.main.temp} °C</p>
                )}
                {_endpointWeatherData && _endpointWeatherData.weather && _endpointWeatherData.weather[0] && (
                  <p><strong>Weather:</strong> {_endpointWeatherData.weather[0].description}</p>
                )}
                {_endpointUVData && (
                  <p><strong>UV Index:</strong> {_endpointUVData.value}</p>
                )}
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
                  scaledSize: iconSize
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
                  scaledSize: iconSize
                }}
                onClick={() => handleCommunityCenterClick(center)}
              />
            ))}

             {/* Markers for activity locations */}
             {showActivityMarkers && activityLocations.map((location) => (
              <Marker
                key={location.place_id}
                position={location.geometry.location}
                title={location.name}
                icon={{
                  url: "https://icon-library.com/images/exercise-icon-png/exercise-icon-png-15.jpg", // Use your custom logo URL
                  scaledSize: iconSize // Scale to desired size
                }}
                onClick={() => handleActivityClick(location)}
              />
            ))}

             {/* InfoWindow for selected Activity location */}
             {selectedActivityLocation && (
              <InfoWindow
                position={selectedActivityLocation.geometry.location}
                onCloseClick={() => setSelectedActivityLocations(null)}
              >
                <div>
                  <h4>{selectedActivityLocation.name}</h4>
                  <p>{selectedActivityLocation.vicinity}</p>
                </div>
              </InfoWindow>
            )}

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

          <div className={mapstyle.rightPanel}>
          <label>Filter By Activity: </label>
            <select className={mapstyle.activitySelect}  value={selectedActivity} onChange={handleActivityChange}>
              {ActivitiesList.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}

            </select>
           <button className={mapstyle.addActivityButton} onClick={sendActivities}>Add Activity +</button> 
          <button className={mapstyle.button2} onClick={handleFetchParks}>Fetch Parks</button>
          <button className={mapstyle.button2}  onClick={handleFetchCommunityCenters}>Fetch Community Centers</button> {/* New button */}
          <button className={mapstyle.button3} onClick={resetMap}>Reset Map</button>
          </div>

        </div>
      </LoadScript>
    </div>
  );
}
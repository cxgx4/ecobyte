import { useState, useRef } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Navigation2, Leaf, Clock, MapPin, Search } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { fetchRoutes, fetchGeoAQI, fetchGeocode } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AuraPath() {
  const { location } = useAppContext();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedOriginCoords, setSelectedOriginCoords] = useState([location.longitude, location.latitude]);
  const [errorMsg, setErrorMsg] = useState("");
  const mapRef = useRef(null);

  const mapStyle = "https://demotiles.maplibre.org/style.json";

  const calculateHealthScore = async (routeGeoJSON) => {
    const coords = routeGeoJSON.geometry.coordinates;
    const distanceMeters = routeGeoJSON.properties?.summary?.distance ||
      (routeGeoJSON.properties?.segments ? routeGeoJSON.properties.segments.reduce((acc, seg) => acc + (seg.distance || 0), 0) : 0);
    const samples = (distanceMeters / 1000) > 800 ? 12 : 5;
    let totalAQI = 0;

    for (let i = 0; i < samples; i++) {
      const idx = Math.floor((i * coords.length) / samples);
      if (idx >= coords.length) break;
      const [lon, lat] = coords[idx];
      const aqiData = await fetchGeoAQI(lat, lon);
      totalAQI += aqiData ? aqiData.aqi : 100; // Fake fallback
    }

    const avgAQI = Math.floor(totalAQI / samples);
    return {
      score: Math.max(0, 100 - (avgAQI / 2)), // 100 is best
      avgAQI
    };
  };

  const handleRouteSearch = async (presetCoords = null, presetName = null) => {
    const isPreset = Array.isArray(presetCoords);
    let currentOrigin = origin || "Kolkata";
    let currentDest = isPreset ? presetName : destination;

    if (!currentOrigin || !currentDest) {
      setErrorMsg("Please enter both origin and destination.");
      return;
    }

    if (isPreset) {
      setOrigin(currentOrigin);
      setDestination(currentDest);
    }

    setErrorMsg("");
    setLoading(true);

    let startCoords = selectedOriginCoords;
    let endCoords = isPreset ? presetCoords : null;

    // Geocode Origin if it's not the default
    if (currentOrigin.toLowerCase() !== "kolkata" && currentOrigin.toLowerCase() !== "current location") {
      const oCoords = await fetchGeocode(currentOrigin, location.latitude, location.longitude);
      if (oCoords) {
        startCoords = oCoords;
        setSelectedOriginCoords(oCoords);
      } else {
        setErrorMsg(`Could not find location for: ${currentOrigin}`);
        setLoading(false);
        return;
      }
    } else {
      // Assume default location is Kolkata if matching
      startCoords = [88.3639, 22.5726];
      setSelectedOriginCoords(startCoords);
    }

    // Geocode Destination if not preset
    if (!endCoords) {
      const dCoords = await fetchGeocode(currentDest, location.latitude, location.longitude);
      if (dCoords) {
        endCoords = dCoords;
      } else {
        setErrorMsg(`Could not find location for: ${currentDest}`);
        setLoading(false);
        return;
      }
    }

    const data = await fetchRoutes(startCoords, endCoords);

    if (data && data.features && data.features.length > 0) {
      const processedRoutes = await Promise.all(data.features.map(async (feat, idx) => {
        const health = await calculateHealthScore(feat);
        return {
          ...feat,
          id: `route-${idx}`,
          duration: feat.properties?.summary?.duration || (feat.properties?.segments ? feat.properties.segments.reduce((acc, seg) => acc + (seg.duration || 0), 0) : 0),
          distance: feat.properties?.summary?.distance || (feat.properties?.segments ? feat.properties.segments.reduce((acc, seg) => acc + (seg.distance || 0), 0) : 0),
          healthScore: health.score,
          avgAQI: health.avgAQI
        };
      }));

      // Sort by best score to find cleanest, then by duration for fastest
      processedRoutes.sort((a, b) => b.healthScore - a.healthScore);
      processedRoutes[0].tag = "cleanest";

      const fastest = [...processedRoutes].sort((a, b) => a.duration - b.duration)[0];
      if (fastest.id !== processedRoutes[0].id) {
        processedRoutes.find(r => r.id === fastest.id).tag = "fastest";
      }

      setRoutes(processedRoutes);

      // Auto-zoom the map to show the entire route
      if (data.bbox && mapRef.current) {
        const [minLng, minLat, maxLng, maxLat] = data.bbox;
        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 50, duration: 1500 }
        );
      }

    } else {
      setErrorMsg("No routes found between these locations.");
      setRoutes([]);
    }
    setLoading(false);
  };

  const handleNavigateSafely = (route) => {
    const coords = route.geometry.coordinates;

    // midpoint from route
    const midIndex = Math.floor(coords.length / 2);
    const [midLng, midLat] = coords[midIndex];

    // use real start/end coords instead of geometry endpoints
    const [originLng, originLat] = selectedOriginCoords;

    const destCoord = coords[coords.length - 1];
    const destLng = destCoord[0];
    const destLat = destCoord[1];

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}` +
      `&destination=${destLat},${destLng}` +
      `&waypoints=${midLat},${midLng}` +
      `&travelmode=driving`;

    window.open(googleMapsUrl, "_blank");
  };

  const getRouteColor = (tag) => {
    if (tag === "cleanest") return "#39FF14"; // Neon Green
    if (tag === "fastest") return "#3B82F6"; // Solid Blue
    return "#9CA3AF"; // Gray
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">

      {/* Map Area */}
      <div className="flex-1 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg relative min-h-[400px]">
        {routes.length === 0 && !loading && (
          <div className="absolute inset-0 z-10 bg-slate-900">
            <img 
              src="/eco-placeholder.png" 
              alt="Eco City Routes" 
              className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30">
               <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center max-w-md transform transition-all hover:scale-105 shadow-2xl">
                 <Leaf className="w-16 h-16 text-neon-green mx-auto mb-4 animate-[pulse_3s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]" />
                 <h3 className="text-2xl font-bold text-white mb-3">AuraPath Matrix</h3>
                 <p className="text-gray-300 text-sm leading-relaxed">
                   Enter your destination to scan the routing grid. We'll identify the most sustainable paths and visualize the optimal ecological route.
                 </p>
               </div>
            </div>
          </div>
        )}
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: location.longitude,
            latitude: location.latitude,
            zoom: 11
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
        >
          {routes.map(r => (
            <Source key={`src-${r.id}`} id={`src-${r.id}`} type="geojson" data={r}>
              <Layer
                id={`layer-${r.id}`}
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round"
                }}
                paint={{
                  "line-color": getRouteColor(r.tag),
                  "line-width": r.tag === "cleanest" ? 6 : 4,
                  "line-opacity": r.tag ? 0.9 : 0.6,
                  "line-dasharray": (!r.tag || r.tag === "alternative") ? [2, 2] : [1, 0]
                }}
              />
            </Source>
          ))}
        </Map>
      </div>

      {/* Control Panel Area */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold dark:text-white mb-4">Plan Route</h2>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Origin (e.g. Kolkata)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-neon-green/50 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-neon-green" />
              <input
                type="text"
                placeholder="Destination (e.g. Hyderabad)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-neon-green/50 outline-none transition-all dark:text-white"
              />
            </div>

            {/* Quick Dest Presets */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[{ name: "Hyderabad, TS", coords: [78.4867, 17.3850] },
              { name: "Bhubaneswar, OD", coords: [85.8245, 20.2961] },
              { name: "New Delhi, DL", coords: [77.2090, 28.6139] }].map((dest, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleRouteSearch(dest.coords, dest.name);
                  }}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-neon-green/20 dark:bg-slate-800 dark:hover:bg-neon-green/20 rounded-lg text-xs font-medium transition-colors border border-transparent dark:border-white/5 dark:text-gray-300"
                >
                  {dest.name}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm font-medium px-2">{errorMsg}</div>
            )}

            <button
              onClick={handleRouteSearch}
              disabled={loading}
              className="w-full mt-2 bg-neon-green/20 text-neon-green hover:bg-neon-green/30 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <Search className="w-5 h-5" />
                  Find Routes
                </>
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-4 text-sm font-medium text-gray-500">Analyzing air quality along routes...</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!loading && routes.length > 0 && routes.map((route) => (
            <div
              key={route.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm transition-all ${route.tag === "cleanest"
                ? "border-neon-green/50 bg-neon-green/5 dark:bg-neon-green/5"
                : "border-gray-200 dark:border-white/5"
                }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {route.tag === "cleanest" && <Leaf className="w-5 h-5 text-neon-green" />}
                  {route.tag === "fastest" && <Clock className="w-5 h-5 text-blue-500" />}
                  {!route.tag && <Navigation2 className="w-5 h-5 text-gray-400" />}
                  <h3 className="font-bold dark:text-white capitalize text-lg">
                    {route.tag ? `${route.tag} Route` : "Alternative"}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold dark:text-white">{Math.ceil(route.duration / 60)} min</div>
                  <div className="text-xs text-gray-500">{(route.distance / 1000).toFixed(1)} km</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Health Score</div>
                  <div className={`text-xl font-bold ${route.healthScore > 80 ? 'text-neon-green' : 'text-yellow-500'}`}>
                    {route.healthScore}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg AQI</div>
                  <div className="text-lg font-bold dark:text-gray-300">{route.avgAQI}</div>
                </div>
              </div>

              <button
                onClick={() => handleNavigateSafely(route)}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-opacity ${route.tag === "cleanest"
                  ? "bg-neon-green text-slate-900 hover:bg-neon-green/90"
                  : "bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90"
                  }`}
              >
                <Navigation2 className="w-4 h-4" />
                Navigate Safely
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
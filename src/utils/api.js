export const WAQI_TOKEN = "3b6eca5e13b4ecdd8d58c6eeeb2c08aaee0c3550";
export const ORS_TOKEN = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM3NjJhZTk2NjkzYzQwOTNiZDMwZTE4OTc2NDMxYTIxIiwiaCI6Im11cm11cjY0In0=";

export const fetchCityAQI = async (city = "kolkata") => {
    try {
        const res = await fetch(`https://api.waqi.info/feed/${city}/?token=${WAQI_TOKEN}`);
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Failed to fetch AQI", error);
        return null;
    }
};

export const fetchGeoAQI = async (lat, lon) => {
    try {
        const res = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`);
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Failed to fetch Geo AQI", error);
        return null;
    }
};

export async function fetchRoutes(start, end) {
    const getDistance = (lon1, lat1, lon2, lat2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    const dist = getDistance(start[0], start[1], end[0], end[1]);
    let coordinates = [start];

    // Split long distance into smaller pieces (>800km)
    if (dist > 800) {
        const segments = Math.ceil(dist / 800);
        for (let i = 1; i < segments; i++) {
            const fraction = i / segments;
            const midLng = start[0] + (end[0] - start[0]) * fraction;
            const midLat = start[1] + (end[1] - start[1]) * fraction;
            coordinates.push([midLng, midLat]);
        }
    }
    coordinates.push(end);

    const fetchAPI = async (targetCount) => {
        const bodyPayload = {
            coordinates: coordinates,
            preference: "fastest",
            instructions: false,
            geometry: true,
        };

        // OpenRouteService strictly forbids alternative routes if there are more than 2 waypoints (start & end).
        // Since we insert mathematical midpoints for routes >800km, we must conditionally omit this parameter.
        if (targetCount > 1 && coordinates.length <= 2) {
            bodyPayload.alternative_routes = {
                target_count: targetCount,
                weight_factor: 1.4
            };
        }

        const response = await fetch(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM3NjJhZTk2NjkzYzQwOTNiZDMwZTE4OTc2NDMxYTIxIiwiaCI6Im11cm11cjY0In0="
                },
                body: JSON.stringify(bodyPayload)
            }
        );

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data;
    };

    try {
        return await fetchAPI(3);
    } catch (error) {
        console.warn("ORS blocked alternatives (likely due to long distance limits). Retrying with a single route...", error.message);
        try {
            return await fetchAPI(1);
        } catch (fallbackError) {
            console.error("Failed to fetch routes even after fallback:", fallbackError.message);
            return null;
        }
    }
}

export const fetchGeocode = async (query, focusLat = null, focusLon = null) => {
    try {
        let url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_TOKEN}&text=${query}`;
        if (focusLat && focusLon) {
            url += `&focus.point.lat=${focusLat}&focus.point.lon=${focusLon}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            return data.features[0].geometry.coordinates; // [lon, lat]
        }
        return null;
    } catch (error) {
        console.error("Failed to geocode", error);
        return null;
    }
};

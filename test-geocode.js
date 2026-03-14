const ORS_TOKEN = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM3NjJhZTk2NjkzYzQwOTNiZDMwZTE4OTc2NDMxYTIxIiwiaCI6Im11cm11cjY0In0=";

export const fetchGeocode = async (query) => {
    try {
        const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_TOKEN}&text=${query}`);
        const data = await response.json();
        console.log(`GEOCODE FOR: ${query}`);
        if (data.features && data.features.length > 0) {
            console.log("SUCCESS:", data.features[0].geometry.coordinates);
            return data.features[0].geometry.coordinates; // [lon, lat]
        }
        console.log("FAILED to find features");
        return null;
    } catch (error) {
        console.error("Failed to geocode", error);
        return null;
    }
};

fetchGeocode("Hyderabad");
fetchGeocode("Bhubaneswar, OD");
fetchGeocode("Kolkata");

const ORS_TOKEN = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM3NjJhZTk2NjkzYzQwOTNiZDMwZTE4OTc2NDMxYTIxIiwiaCI6Im11cm11cjY0In0=";

async function test() {
    try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": ORS_TOKEN,
            },
            body: JSON.stringify({
                coordinates: [[88.3639, 22.5726], [78.4867, 17.3850]]
            }),
        });
        const data = await response.json();
        console.log(JSON.stringify(data).substring(0, 500));
    } catch (e) {
        console.error(e);
    }
}
test();

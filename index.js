document.addEventListener('DOMContentLoaded', () => {
    const routeForm = document.getElementById('routeForm');
    const sourceInput = document.getElementById('source');
    const destinationInput = document.getElementById('destination');
    const routesList = document.getElementById('routes-list');
    const etaMessage = document.getElementById('eta-message');
    const alertsList = document.getElementById('alerts-list');
    const mapContainer = document.getElementById('map-container');

    let map;
    let routeLines = [];

    function initMap() {
        map = L.map('map-container').setView([13.0827, 80.2707], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }

    function clearRoutes() {
        routeLines.forEach(line => map.removeLayer(line));
        routeLines = [];
    }

    function drawRoute(path_coordinates) {
        if (!path_coordinates || path_coordinates.length === 0) return;
        const latlngs = path_coordinates.map(coord => [coord.lat, coord.lng]);
        const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);
        routeLines.push(polyline);
        map.fitBounds(polyline.getBounds());
    }

    async function fetchRoutes(source, destination) {
        try {
            const response = await fetch('/api/find_routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, destination }),
            });

            if (!response.ok) {
                const err = await response.json();
                routesList.innerHTML = <li>Error: ${err.message || 'Failed to fetch routes'}</li>;
                return;
            }

            const data = await response.json();
            displayRoutes(data);

        } catch (err) {
            console.error('Fetch failed:', err);
            routesList.innerHTML = <li>Could not connect to backend.</li>;
        }
    }

    function displayRoutes(routes) {
        routesList.innerHTML = '';
        clearRoutes();

        if (!routes || routes.length === 0) {
            routesList.innerHTML = '<li>No routes found.</li>';
            return;
        }

        routes.forEach(route => {
            const li = document.createElement('li');
            li.textContent = Route: ${route.route_number}, Stops: ${route.stops.join(' → ')};
            routesList.appendChild(li);
            drawRoute(route.path_coordinates);
        });
    }

    async function fetchAccidents() {
        try {
            const response = await fetch('/api/accidents');
            if (!response.ok) {
                console.error('Failed to fetch accident data');
                alertsList.innerHTML = '<li>Error fetching accident data.</li>';
                return;
            }

            const accidents = await response.json();
            displayAccidents(accidents);
        } catch (err) {
            console.error('Error fetching accident alerts:', err);
            alertsList.innerHTML = '<li>Could not fetch accident data.</li>';
        }
    }

    function displayAccidents(accidents) {
        alertsList.innerHTML = '';
        if (accidents && accidents.length > 0) {
            accidents.forEach(accident => {
                const li = document.createElement('li');
                li.textContent = Accident: ${accident.description} at ${accident.location};
                alertsList.appendChild(li);
            });
        } else {
            alertsList.innerHTML = '<li>No accidents found.</li>';
        }
    }

    routeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const source = sourceInput.value.trim();
        const destination = destinationInput.value.trim();

        if (!source || !destination) {
            routesList.innerHTML = '<li>Please enter both source and destination.</li>';
            return;
        }

        fetchRoutes(source, destination);
    });

    // Fetch accident alerts on page load
    fetchAccidents();

    initMap();
});

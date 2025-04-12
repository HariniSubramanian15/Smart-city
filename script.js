document.addEventListener('DOMContentLoaded', () => {
    const routeForm = document.getElementById('routeForm');
    const routesList = document.getElementById('routes-list');
    const etaMessage = document.getElementById('eta-message');
    const mapContainer = document.getElementById('map-container');
    const suggestedRoutesList = document.getElementById('suggested-routes');
    let map;
    let routeLines = [];
    let busMarkers = [];
    let autocompleteSource;
    let autocompleteDestination;

    function initMap() {
        map = L.map('map-container').setView([13.0827, 80.2707], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }

    initMap();

    function initAutocomplete() {
        const sourceInput = document.getElementById('source');
        const destinationInput = document.getElementById('destination');

        const places = [
            "T. Nagar, Chennai", "Saidapet, Chennai", "Guindy, Chennai", "Adyar, Chennai",
            "Central Station, Chennai", "Egmore, Chennai", "Nungambakkam, Chennai",
            "Kodambakkam, Chennai", "Airport, Chennai", "Meenambakkam, Chennai",
            "Tirusulam, Chennai", "Pallavaram, Chennai", "Velachery, Chennai", "Tambaram, Chennai",
            "Chromepet, Chennai", "Mylapore, Chennai", "Anna Nagar, Chennai", "Besant Nagar, Chennai",
            "Royapettah, Chennai", "Thiruvanmiyur, Chennai", "OMR, Chennai", "ECR, Chennai",
            "Thirumangalam, Chennai", "Ambattur, Chennai", "Poonamallee, Chennai", "Vadapalani, Chennai",
            "Porur, Chennai", "Sholinganallur, Chennai", "Perungudi, Chennai", "Siruseri, Chennai"
        ];

        autocompleteSource = new Autocomplete(sourceInput, {
            data: places,
            onSelect: item => sourceInput.value = item
        });

        autocompleteDestination = new Autocomplete(destinationInput, {
            data: places,
            onSelect: item => destinationInput.value = item
        });
    }

    class Autocomplete {
        constructor(inputElement, options) {
            this.inputElement = inputElement;
            this.data = options.data || [];
            this.onSelect = options.onSelect || (() => {});
            this.init();
        }

        init() {
            this.inputElement.addEventListener('input', () => this.handleInput());
            this.dropdown = document.createElement('ul');
            this.dropdown.className = 'autocomplete-dropdown';
            this.inputElement.parentNode.appendChild(this.dropdown);
            this.dropdown.style.display = 'none';
            this.inputElement.setAttribute('autocomplete', 'off');
        }

        handleInput() {
            const query = this.inputElement.value.toLowerCase();
            const filteredData = this.data.filter(item => item.toLowerCase().startsWith(query));
            this.renderDropdown(filteredData);
        }

        renderDropdown(filteredData) {
            this.dropdown.innerHTML = '';
            if (filteredData.length > 0 && this.inputElement.value) {
                filteredData.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    li.addEventListener('click', () => {
                        this.inputElement.value = item;
                        this.dropdown.style.display = 'none';
                        this.onSelect(item);
                    });
                    this.dropdown.appendChild(li);
                });

                const inputRect = this.inputElement.getBoundingClientRect();
                this.dropdown.style.display = 'block';
                this.dropdown.style.position = 'absolute';
                this.dropdown.style.top = ${inputRect.bottom + window.scrollY}px;
                this.dropdown.style.left = ${inputRect.left + window.scrollX}px;
                this.dropdown.style.width = ${inputRect.width}px;
                this.dropdown.style.zIndex = '1000';
                this.dropdown.style.backgroundColor = 'white';
                this.dropdown.style.border = '1px solid #ccc';
                this.dropdown.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                this.dropdown.style.maxHeight = '200px';
                this.dropdown.style.overflowY = 'auto';
            } else {
                this.dropdown.style.display = 'none';
            }
        }
    }

    async function geocodeLocation(location) {
        const response = await fetch(https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)});
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        } else {
            throw new Error(Geocoding failed for: ${location});
        }
    }

    async function getSuggestedRoutes(source, destination) {
        suggestedRoutesList.innerHTML = '<li>Loading suggested routes...</li>';

        try {
            const res = await fetch(/api/suggested_routes?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)});
            const data = await res.json();

            if (!res.ok || !data.routes) {
                throw new Error(data.error || 'No suggested routes found.');
            }

            displaySuggestedRoutes(data.routes);
        } catch (error) {
            console.error('Suggested route error:', error);
            suggestedRoutesList.innerHTML = <li>${error.message}</li>;
        }
    }

    function displaySuggestedRoutes(routes) {
        suggestedRoutesList.innerHTML = '<strong>Suggested Routes (via Google Maps):</strong>';
        routes.forEach((route, idx) => {
            const li = document.createElement('li');
            let content = Route ${idx + 1}: ${route.legs[0].duration}, ${route.legs[0].distance}<ul>;
            route.legs[0].steps.forEach(step => {
                content += <li>${step.instruction}</li>;
            });
            content += </ul>;
            li.innerHTML = content;
            suggestedRoutesList.appendChild(li);
        });
    }

    window.findRoutes = async () => {
        const source = document.getElementById('source').value;
        const destination = document.getElementById('destination').value;
        clearRouteLines();
        clearBusMarkers();

        try {
            const [sourceCoords, destinationCoords] = await Promise.all([
                geocodeLocation(source),
                geocodeLocation(destination)
            ]);

            const sourceMarker = L.marker([sourceCoords.lat, sourceCoords.lng]).addTo(map).bindPopup("Source").openPopup();
            const destinationMarker = L.marker([destinationCoords.lat, destinationCoords.lng]).addTo(map).bindPopup("Destination").openPopup();
            busMarkers.push(sourceMarker, destinationMarker);

            const response = await fetch('/api/find_routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, destination }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch routes');
            }

            const routeData = await response.json();
            displayRoutes(routeData);

            const etaResponse = await fetch('/api/eta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin: source, destination }),
            });

            if (!etaResponse.ok) {
                const errorData = await etaResponse.json();
                throw new Error(errorData.message || 'Failed to calculate ETA');
            }

            const etaData = await etaResponse.json();
            displayETA(etaData.eta);

            map.fitBounds([
                [sourceCoords.lat, sourceCoords.lng],
                [destinationCoords.lat, destinationCoords.lng]
            ]);

            // Add Suggested Routes from Google Maps
            getSuggestedRoutes(source, destination);

        } catch (error) {
            console.error('Error:', error);
            routesList.innerHTML = <li>${error.message}</li>;
            etaMessage.textContent = 'Error calculating ETA.';
            suggestedRoutesList.innerHTML = '';
        }
    };

    function displayRoutes(routes) {
        routesList.innerHTML = '';
        if (routes && routes.length > 0) {
            routes.forEach(route => {
                const li = document.createElement('li');
                li.textContent = Route: ${route.route_number}, Stops: ${route.stops.join(' -> ')};
                routesList.appendChild(li);

                if (route.path_coordinates && route.path_coordinates.length > 0) {
                    const latlngs = route.path_coordinates.map(coord => [coord.lat, coord.lng]);
                    const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);
                    routeLines.push(polyline);
                    map.fitBounds(latlngs);
                }
            });
        } else {
            routesList.innerHTML = '<li>No routes found.</li>';
        }
    }

    function displayETA(eta) {
        if (eta) {
            etaMessage.textContent = Estimated Travel Time: ${eta};
        } else {
            etaMessage.textContent = 'Error calculating ETA. Please try again later.';
        }
    }

    function clearRouteLines() {
        routeLines.forEach(line => map.removeLayer(line));
        routeLines = [];
    }

    function clearBusMarkers() {
        busMarkers.forEach(marker => map.removeLayer(marker));
        busMarkers = [];
    }

    function fetchAndDisplayBuses() {
        fetch('/api/buses')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch bus locations');
                return response.json();
            })
            .then(buses => {
                clearBusMarkers();
                buses.forEach(bus => {
                    const marker = L.marker([bus.location.lat, bus.location.lng])
                        .addTo(map)
                        .bindPopup(Bus ${bus.route});
                    busMarkers.push(marker);
                });
            })
            .catch(error => {
                console.error('Error fetching bus locations:', error);
            });
    }

    fetchAndDisplayBuses();
    setInterval(fetchAndDisplayBuses, 30000);
    initAutocomplete();
});

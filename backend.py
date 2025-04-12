from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from urllib.parse import quote_plus

app = Flask(_name_)
CORS(app)  # Allow cross-origin requests

GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"  # Replace with your actual Google Maps API key 

# Sample bus route data (you can replace it with actual data)
bus_routes_data = [
    {
        "route_number": "27B",
        "stops": ["T. Nagar", "Saidapet", "Guindy"],
        "path_coordinates": [
            {"lat": 13.0333, "lng": 80.2333},
            {"lat": 13.0200, "lng": 80.2250},
            {"lat": 13.0100, "lng": 80.2200}
        ]
    },
    {
        "route_number": "51",
        "stops": ["Central Station", "Egmore", "Nungambakkam"],
        "path_coordinates": [
            {"lat": 13.0827, "lng": 80.2707},
            {"lat": 13.0750, "lng": 80.2620},
            {"lat": 13.0600, "lng": 80.2450}
        ]
    }
]

# Normalize stop names to lower case and remove ", Chennai" for comparison
def normalize_stop(stop):
    return stop.lower().replace(", chennai", "").strip()

# Function to find bus routes based on source and destination
def find_bus_routes(source, destination):
    source = normalize_stop(source)
    destination = normalize_stop(destination)

    matching_routes = []
    for route in bus_routes_data:
        stops_normalized = [normalize_stop(s) for s in route["stops"]]
        if (
            source in stops_normalized and
            destination in stops_normalized and
            stops_normalized.index(source) < stops_normalized.index(destination)
        ):
            matching_routes.append({
                "route_number": route["route_number"],
                "stops": route["stops"],
                "path_coordinates": route["path_coordinates"]
            })
    return matching_routes

@app.route('/api/find_routes', methods=['POST'])
def find_routes():
    data = request.get_json()
    source = data.get('source')
    destination = data.get('destination')

    if not source or not destination:
        return jsonify({"message": "Source and destination are required"}), 400

    results = find_bus_routes(source, destination)
    return jsonify(results)

@app.route('/api/eta', methods=['POST'])
def calculate_eta():
    data = request.get_json()
    origin = data.get('origin')
    destination = data.get('destination')

    if not origin or not destination:
        return jsonify({'message': 'Origin and destination are required'}), 400

    # Encode special characters for URL
    origin = quote_plus(origin)
    destination = quote_plus(destination)

    # Call Google Maps API for ETA
    google_maps_url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={GOOGLE_MAPS_API_KEY}"

    try:
        # Make request to Google Maps API
        response = requests.get(google_maps_url)
        directions = response.json()

        # Log the request and response for debugging purposes
        app.logger.debug(f"Google Maps URL: {google_maps_url}")
        app.logger.debug(f"Google Maps Response: {response.json()}")

        # Check if response status is OK and process ETA
        if directions.get('status') == 'OK' and 'routes' in directions and len(directions['routes']) > 0:
            eta = directions['routes'][0]['legs'][0]['duration']['text']
            return jsonify({'eta': eta}), 200
        else:
            return jsonify({'message': 'No routes found for the given locations.'}), 404

    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

if _name_ == '_main_':
    app.run(debug=True, port=5000)

// This query is for all earthquakes in the past 7 days
//direct to USGS json for all week
var earthquake_data_json = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// Perform a GET request to the query URL
d3.json(earthquake_data_json, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  // unpacks the features part of the USGS geojson to be read 
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function each_earthquake_layer(feature, layer) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      fillOpacity: 0.5,
      color: mag_color(feature.properties.mag),
      fillColor: mag_color(feature.properties.mag),
      radius:  mag_size(feature.properties.mag)
    });
  }
  function each_quake_circle(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // onEachFeature -> Function for each_quake_circle info for the marker popup
  // pointToLayer -> Function for new circle marker for each point
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: each_quake_circle,
    pointToLayer: each_earthquake_layer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 2,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});
//this should add a legend
  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        magnitude_range = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitude_range.length; i++) {
        div.innerHTML += '<i style="background:' + mag_color(magnitude_range[i] + 1) + '"></i> ' +
            magnitude_range[i] + (magnitude_range[i+ 1] ? '&ndash;' + magnitude_range[i + 1] + '<br>' : '+');
    }

    return div;
};

  legend.addTo(myMap);
}


//function for representing magnitude size
function mag_size(magnitude) {
  return magnitude * 3;
}

//function to represent magnitude color 
function mag_color(magnitude) {
  if (magnitude > 5) {
    return "darkred";
  }
  else if (magnitude > 4) {
    return "orangered";
  }
  else if (magnitude > 3) {
    return "orange";
  }
  else if (magnitude > 2) {
    return "yellow";
  }
  else if (magnitude > 1) {
    return "yellowgreen";
  }
  else {
    return "green";
  }
}

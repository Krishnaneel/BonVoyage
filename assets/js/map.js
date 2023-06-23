var centreLat; 
var centreLong; 
var map;
var marker;
const locationMap = new Map();
var directionsRenderer;
var directionsService;
var userLat;
var userLong;
var currentLocationToLoad = sessionStorage.getItem('currentLocationValue');
// console.log(currentLocationToLoad)


function populateMap(currentLocationToLoad) {
    const jsonPath = `./assets/js/${currentLocationToLoad}.json`;
  
    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        // Iterate through the data from the JSON
        data.forEach(item => {
          const name = item.description.name;
          const latitude = item.location.latitude;
          const longitude = item.location.longitude;
  
          // Add the name and location to the map
          locationMap.set(name, { latitude, longitude });
        });
      })
      .catch(error => {
        console.error('Error:', error);
        // Reload the current page and bypass the cache
        // location.reload();
      });
  }


//   console.log(locationMap);

function initMap(centreLat, centreLong, zoom) {
    // Create a new map instance
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: centreLat, lng: centreLong }, // Set the initial map center
        zoom: zoom,// Set the initial zoom level
        disableDefaultUI: true,
    });
}


// Function to add a marker to the map
function addMarker(latitude, longitude, title) {
    // Check if a marker already exists, remove it first
    if (marker) {
        marker.setMap(null);
    }

    // Create a new marker and add it to the map
    marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: title
    });

    marker.setMap(locationMap);
}


function removeMarker() {
    if (marker) {
        marker.setMap(null);
    }
}

let centreLatitude, centreLongitude, zoom;

function loadMap() {
  fetch('./assets/js/location.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        if (item._id === currentLocationToLoad) {
          centreLatitude = item.location.latitude;
          centreLongitude = item.location.longitude;
          zoom = item.location.zoom;
          return;
        }
      });

      if (centreLatitude && centreLongitude && zoom) {
        initMap(centreLatitude, centreLongitude, zoom);
        populateMap(currentLocationToLoad);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setTimeout(reloadPage, 10); // Retry every 0.01 seconds
    });
}

function reloadPage() {
  location.reload();
}

function checkForGoogle() {
  if (typeof google !== 'undefined') {
    // Google is available, call the functions
    loadMap();
  } else {
    // Google is not available yet, retry after a delay
    setTimeout(checkForGoogle, 10); // Retry every 0.01 seconds
  }
}

document.addEventListener('DOMContentLoaded', function() {
  checkForGoogle();
});

function getDirection(lastMarkerLat,lastMarkerLong){
  if (navigator.geolocation) {
    function success(position) {
      userLat = position.coords.latitude;
      userLong = position.coords.longitude;
      console.log(`Latitude: ${userLat}, Longitude: ${userLong}`);
  
      directionsRenderer = new google.maps.DirectionsRenderer();
      directionsService = new google.maps.DirectionsService();

      directionsRenderer.setMap(map);
      directionsService.route({
        origin: { lat: userLat, lng: userLong },
        destination: { lat: lastMarkerLat, lng: lastMarkerLong },
        travelMode: 'WALKING'
      })
        .then((response) => {
          directionsRenderer.setDirections(response);
        })
        .catch((e) => window.alert("Directions request failed due to " + e));
    }
  
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
  
    navigator.geolocation.getCurrentPosition(success, error);
  } 
  else {
    console.error("User position not available");
  }
}

function removeDirection(){
  directionsRenderer.set('directions', null);
  map.panTo({ lat: userLat, lng: userLong });
  map.setZoom(zoom);
}
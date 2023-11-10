var centreLat;
var centreLong;
var map;
var marker;
var liveUserMarker;
const locationMap = new Map();
var directionsRenderer;
var directionsService;
var userLat;
var userLong;
var directionResponse;
var currentLocationToLoad = sessionStorage.getItem('currentLocationValue');



function populateMap(currentLocationToLoad) {
  const jsonPath = `../json/${currentLocationToLoad}.json`;

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

  marker.setMap(map);
}


function removeMarker() {
  if (marker) {
    marker.setMap(null);
  }
}

let centreLatitude, centreLongitude, zoom;

function loadMap() {
  fetch('../json/location.json')
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

document.addEventListener('DOMContentLoaded', function () {
  checkForGoogle();
});

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}


// Update marker position with live user location
function updateMarkerPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      // var newPosition = new google.maps.LatLng(latitude, longitude);

      // Check if a marker already exists, remove it first
      if (liveUserMarker) {
        liveUserMarker.setMap(null);
      }

      // Create a new marker and add it to the map
      liveUserMarker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: "Your Current Location"
      });

      liveUserMarker.setMap(map);


      // liveUserMarker.setPosition(newPosition);
      // map.setCenter(position);
    },error,options);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function navigateUser() {
  // Update marker position every 1 second
  setInterval(updateMarkerPosition, 1000);
}

function getDirection(lastMarkerLat, lastMarkerLong) {
  if (navigator.geolocation) {
    function success(position) {
      userLat = position.coords.latitude;
      userLong = position.coords.longitude;
      // console.log(`Latitude: ${userLat}, Longitude: ${userLong}`);
      navigateUser();
      directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
      directionsService = new google.maps.DirectionsService();

      directionsRenderer.setMap(map);
      directionsService.route({
        origin: { lat: userLat, lng: userLong },
        destination: { lat: lastMarkerLat, lng: lastMarkerLong },
        travelMode: 'WALKING'
      })
        .then((response) => {
          directionsRenderer.setDirections(response);
          directionResponse = response;
          // console.log("HERE IS THE RESPONSE : ",response);
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

function removeDirection() {
  directionsRenderer.set('directions', null);
  map.panTo({ lat: userLat, lng: userLong });
  map.setZoom(zoom);
}
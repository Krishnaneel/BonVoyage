var menuItems = [];
var lastMarkerLat;
var lastMarkerLong; 
var currentLocationToLoad = sessionStorage.getItem('currentLocationValue');


// Checking if the variable doesn't exist then sending user to index.html
if(currentLocationToLoad === null) {
  window.location.href = '/';
}

// Checking if the variable already exists in session storage
if (sessionStorage.getItem('isHTMLCreated') === null) {
  // If it doesn't exist, initialize it with false
  sessionStorage.setItem('isHTMLCreated', false);
}

// Retrieving the variable from session storage
var isHTMLCreated = JSON.parse(sessionStorage.getItem('isHTMLCreated'));

const jsonPath = `../json/${currentLocationToLoad}.json`;
// Load and populate menuItems from zoo.json
fetch(jsonPath)
  .then(response => response.json())
  .then(data => {

    // Clear existing menuItems
    menuItems.length = 0;

    // Iterate through the data from zoo.json
    data.forEach(item => {
      // Check if the category already exists in menuItems
      var existingCategory = menuItems.find(category => category.label === item.category);

      // If the category doesn't exist, create a new menu item object
      if (!existingCategory) {
        var menuItem = {
          label: item.category,
          subItems: []
        };

        menuItem.subItems.push(item.description.name);

        // Add the menu item to menuItems
        menuItems.push(menuItem);
      }
      // If the category already exists, add the subItem to the existing category
      else {
        existingCategory.subItems.push(item.description.name);
      }

    });

  })
  .catch(error => {
    console.error('Error:', error);
  });

// console.log(menuItems);

// function to render differently 
function shiftMarker() {
  if (window.innerHeight > window.innerWidth)
    return 0.357 * window.innerHeight;
  else
    return 0.252 * window.innerHeight;
}

//------------------------------------------------
let itemSelected;
// Function to create the HTML code
function createHTML() {
  var container = document.getElementById("container");

  // Create the <ul> element with class "dropdown"
  var dropdown = document.createElement("ul");
  dropdown.className = "dropdown";
  dropdown.style.display = "none";

  // Iterate through the menuItems list
  menuItems.forEach(function (menuItem) {
    // Create the <li> element with class "dropdown-item"
    var listItem = document.createElement("li");
    listItem.className = "dropdown-item";
    listItem.textContent = menuItem.label;

    // Check if the submenu has items
    if (menuItem.subItems.length > 0) {
      // Create the nested <ul> element with class "sub-dropdown"
      var subDropdown = document.createElement("ul");
      subDropdown.className = "sub-dropdown";

      // Iterate through the submenu items
      menuItem.subItems.forEach(function (subItem) {
        // Create the nested <li> elements with class "sub-dropdown-item"
        var subListItem = document.createElement("li");
        subListItem.className = "sub-dropdown-item";
        subListItem.textContent = subItem;

        // Add event listener to the sub-item
        subListItem.addEventListener("click", function () {

          const location = locationMap.get(subItem);
          if (location) {
            const { latitude, longitude } = location;
            // Change the center of the map dynamically
            map.panTo({ lat: latitude, lng: longitude });
            map.panBy(0, -shiftMarker());
            // Show the marker
            window.addMarker(latitude, longitude, subItem);
            lastMarkerLat = latitude;
            lastMarkerLong= longitude;
            // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
              // Find the selected item in the data
              const selectedItem = data.find(item => item.description.name === subItem);

              itemSelected=selectedItem;

              // Check if the selected item exists
              if (selectedItem) {
                // Update the placard content dynamically
                var placardDetailsDiv = document.querySelector(".name-section");
                var placardInfoDiv = document.querySelector(".info");
                var imgDiv = document.querySelector(".picture-section");

                var imgElement = document.createElement("img");
                imgElement.src = selectedItem.img;
                imgElement.alt = selectedItem.description.name;
                
                // Clear the imgDiv before adding the new image
                imgDiv.innerHTML = "";
                
                // Append the imgElement to the imgDiv
                imgDiv.appendChild(imgElement);

                placardDetailsDiv.innerHTML = Object.entries(selectedItem.description)
                  .map(([key, value]) => `<h2>${formatValue(value)}</h2>`)
                  .join('\n');

                placardInfoDiv.innerHTML = Object.entries(selectedItem.info)
                  .map(([key, value]) => `<p><strong>${formatValue(value)}</p>`)
                  .join('\n');
                  
              } else {
                console.log(`Selected item not found in the data`);
              }
              // console.log(itemSelected);
            })
            .catch(error => {
              console.error('Error:', error);
            });


          } else {
            console.log(`Location not found for name: ${name}`);
          }

        });

        function formatValue(value) {
          if (typeof value === 'string') {
            return value;
          }
          return JSON.stringify(value);
        }
        

        // Append the nested <li> elements to the nested <ul> element
        subDropdown.appendChild(subListItem);
      });

      // Append the nested <ul> element to the parent <li> element
      listItem.appendChild(subDropdown);
    }

    // Append the <li> element to the <ul> element
    dropdown.appendChild(listItem);
  });

  // Append the <ul> element to the container
  container.appendChild(dropdown);
}


function toggleDropdown() {
  var dropdown = document.querySelector(".dropdown");

  if(dropdown!=null) {
    if (dropdown.style.display === "none") {
      dropdown.style.display = "block";
    } else {
      dropdown.style.display = "none";
    }
  } 
}



// --------------------------------------------------------------------------------------------------------------
// Button Functionalities


// Buttons

let avatarButton = document.querySelector(".avatar")
let goButton = document.querySelector(".go")
let menuButton = document.querySelector(".menu")
let subDropdown = document.querySelector(".sub-dropdown")
let dropdown = document.querySelector(".dropdown")
let placard = document.querySelector(".placard")
let exitButton = document.querySelector("#exitBtn")
let maximizeButton = document.querySelector("#maximizeBtn")





// -----------------------------------------------------------------

//show go button and placard when a item in "sub-dropdown" has been clicked

const container = document.getElementById('container')

container.addEventListener('click', (event) => {
  const clickedElement = event.target;
  if (clickedElement.classList.contains('sub-dropdown-item')) {
    goButton.style.display = 'block';
    placard.style.display = 'flex';
  }

});


function hidePlacardAlways() {
  placard.style.display = "none";
}

function hidePlacard() {
  if (exitButton != null) {
    placard.style.display = "none";
  }
}

function hideGoButton() {
  if (goButton != null) {
    goButton.style.display = "none";
  }
}

function hideGoButtonAlways() {
  goButton.style.display = "none";
}

menuButton.addEventListener('click', () => {

  
  // Checking if isHTMLCreated is false
  if (isHTMLCreated === false) {
    // Setting it to true and updating session storage
    isHTMLCreated = true;
    sessionStorage.setItem('isHTMLCreated', JSON.stringify(isHTMLCreated));

    // Calling the createHTML() function
    createHTML();
  }


  toggleDropdown(); 
  hidePlacardAlways();
  hideGoButtonAlways(); 
  window.removeMarker();
  goButton.textContent = "Let's Walk"; 
  if (window.directionResponse.status === 'OK') {
    removeDirection();
  }
});



placard.addEventListener('click', (event) => {
  const clickedElement = event.target;
  if (clickedElement.id === 'exitBtn') {
    hidePlacard();
    hideGoButton();
    window.removeMarker();
  }else if(clickedElement.id === 'maximizeBtn'){
    fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
              if(itemSelected.link!="")
              window.open(itemSelected.link,"_blank")
              console.log(itemSelected);
            })
  }
});

// Function to handle the button click event
function changeToCancel() {
  // Change the button text to "Stop"
  if (goButton.textContent === "Let's Walk") {
    goButton.textContent = 'Stop';

    // Add CSS class to apply the red button style
    goButton.classList.add('red-button');

    // Add the function to render the direction and navigation
    window.getDirection(lastMarkerLat,lastMarkerLong);
  } else {
    goButton.textContent = "Let's Walk";
    goButton.classList.remove('red-button');
    // window.removeMarker();
    goButton.style.display = "none";
    window.removeDirection();
  }
}


goButton.addEventListener('click', () => {
  hidePlacardAlways();
  changeToCancel();
  toggleDropdown();
});

avatarButton.addEventListener('click', () => {
  window.location.href = '/';
});

// ----------------------------------------------------------------

window.onload = function () {
  if(dropdown!=null)
  dropdown.style.display = "none";
};

// Adding a listener for the "beforeunload" event
window.addEventListener('beforeunload', function(event) {
  isHTMLCreated = false;
  sessionStorage.setItem('isHTMLCreated', JSON.stringify(isHTMLCreated));
  // event.returnValue = 'Your custom message goes here.';
});

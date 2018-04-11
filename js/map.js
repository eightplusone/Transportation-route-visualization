/*
 * Init Google Maps
 */
function initMap() {
  // Stops
  let marker = [];

  // Content of the infowindows
  let contentString = [];

  // The index of most recently opened infowindow
  let lastOpen = 0;

  // Create a new map with MY style
  let map = new google.maps.Map(d3.select("#map").node(), {
    center: {lat: 41.869778, lng: -87.648277},
    zoom: 14,
    mapTypeId: "roadmap",
    styles: [
      {
        featureType: "all",
        stylers: [
          { saturation: -100 }
          ,{ lightness: -10 }
          ,{ invert_lightness: true }
        ]
      },{
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [
          { saturation: 20 }
        ]
      },{
        featureType: "poi.business",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.business",
        elementType: "geometry",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.government",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.government",
        elementType: "geometry",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.place_of_worship",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.place_of_worship",
        elementType: "geometry",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.attraction",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.park",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "road",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.medical",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },{
        featureType: "poi.park",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ]
  });

  // Read & process data.
  d3.json("../Tran_project1/data/data.json", function(error, data) {
    if (error) console.log(error);

    // Initialize the markers and place the infowindows
    data.stops.forEach(function(stop, i) {
      let coord = new google.maps.LatLng(stop.lat, stop.lng);

      marker[i] = new google.maps.Marker({
        position: coord,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          strokeColor: "yellow",
          strokeOpacity: 0.7,
          scale: 3
        },
      });

      marker[i].infowindow = new google.maps.InfoWindow();
      contentString[i] = "<b>" + stop.name + "</b></br>" ;

      // When a marker is clicked, display its infowindow
      marker[i].addListener("click", function() {
          // First, close other infowindows
          if (lastOpen != 0) marker[lastOpen].infowindow.close();
          lastOpen = i;

          // Set content & display
          marker[i].infowindow.setContent(contentString[i]);
          marker[i].infowindow.open(map, this);

          // Center the map at the selected marker
          map.panTo(marker[i].getPosition());
      });
    });


    ////////////////////////////////////////////////////////////////////////////

    // EDIT THE BELOW TWO LINES TO SEE HOW THE MAP CHANGES
    // I PLANNED TO PROVIDE SOME CONTROLLERS ON THE MAIN PAGE,
    // BUT IT WOULD TAKE MUCH MORE TIME.
    //

    displayAll();
    //displayDay("08/30/2016");

    ////////////////////////////////////////////////////////////////////////////

    /*
     * Display a single trip.
     */
    function displayTrip(trip) {
      // Store all stops of this trip so we can draw a path on map.
      let stopsList = [];

      // Generate the path of this trip.
      trip.locations.forEach(function(loc) {
        stopsList.push(data.stops[loc.stopId]);

        // Add collected data to the infowindow of each stop.
        contentString[loc.stopId] += "<p><b>" + trip.date + "</b></br>"
          + "Line " + trip.line + ": "
          + loc.on + "<img src='../Tran_project1/img/up-arrow.png'> "
          + loc.off + "<img src='../Tran_project1/img/down-arrow.png'></p>"
          + "<!--div>Icons made by <a href='http://www.flaticon.com/authors/darius-dan' title='Darius Dan'>Darius Dan</a> from <a href='http://www.flaticon.com' title='Flaticon'>www.flaticon.com</a> is licensed by <a href='http://creativecommons.org/licenses/by/3.0/' title='Creative Commons BY 3.0' target='_blank'>CC 3.0 BY</a></div-->";
      });

      // Color of bus' lines
      let color = "white";

      // Each train line uses a color corresponding to its name.
      if (isNaN(trip.line)) {
        color = trip.line;
      }

      // Draw the paths.
      addPath(stopsList, color, trip.line);
    }

    /*
     * Display all trips of one day.
     */
    function displayDay(day) {
      // Hide all markers first
      hideAllMarkers();

      data.trips.forEach(function(trip) {
        if (trip.date.localeCompare(day) == 0) {
          showMarkers(trip);
          displayTrip(trip);
        }
      });
    }

    /*
     * Nothing to hide
     */
    function displayAll() {
      for (i = 1; i < data.trips.length; i++) {
        displayTrip(data.trips[i]);
      }
    }

    /*
     * Please-leave-me-alone mode
     */
    function hideAllMarkers() {
      marker.forEach(function(mrkr) {
        mrkr.setMap(null);
      });
    }

    /*
     * Display only markers of a selected trip
     */
    function showMarkers(trip) {
      trip.locations.forEach(function(loc) {
        marker[loc.stopId].setMap(map);
      });
    }

    /*
     * Add a path to a map based on the given coordinates
     */
    function addPath(coordinates, color, name) {
      // Source: Google Maps API
      // Draw a "train" on the path
      let lineSymbol = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: "cyan",
        strokeOpacity: 0.7
      };

      // Trace a path along the trip
      let path = new google.maps.Polyline({
        path: coordinates,
        strokeColor: color,
        strokeOpacity: 0.7,
        strokeWeight: 5,
        icons: [{
          icon: lineSymbol,
          offset: '100%'
        }],
        map: map
      });

      // Animate the "train"
      animateCircle(path);

      // When user move the mouse over a path, the line name/number will be
      // displayed after 1 sec
      let iw = new google.maps.InfoWindow();
      path.addListener("mouseover", function(e) {
        setTimeout(function(e){
          iw.setContent("<p>Line: " + name + "</p>");
          iw.setPosition(coordinates[Math.round(coordinates.length/2)]);
          iw.open(map, e);
        }, 500);
      });

      // The infowindow will automatically disappear 0.5 sec after mouseout
      path.addListener("mouseout", function(e) {
        setTimeout(function() { iw.close(); }, 500);
      });
    }

    // Use the DOM setInterval() function to change the offset of the symbol
    // at fixed intervals.
    // Source: Google Maps API
    function animateCircle(line) {
      var count = 0;
      window.setInterval(function() {
        count = (count + 1) % 200;

        var icons = line.get("icons");
        icons[0].offset = (count / 2) + '%';
        line.set("icons", icons);
      }, 20);
    }
  });
}

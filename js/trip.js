/*
 * Populate the dropdown list
 */
d3.json("../Tran_project1/data/data.json", function(error, data) {
  if (error) throw error;

  // Total number of trips
  let numTrips = Object.keys(data.trips).length;

  // While waiting for user to make a selection, display a random trip
  tripOverview(1 + Math.floor(Math.random(numTrips) * numTrips));

  // Fill up the dropdown list
  let selectTrip = document.getElementById("selectTrip"); 
  for (i = 1; i < numTrips; i++) {
      let el = document.createElement("option");
      el.textContent = i;
      el.value = i;
      selectTrip.appendChild(el);
  }
});


/*
 * Capture user's selection
 */
$("#selectTrip").change(function() {
  let selectedValue = $(this).find("option:selected").text();

  // Clear the canvas
  d3.select("svg > g > *").remove();
  d3.select("svg > *").remove();
  d3.select("svg").remove();
  
  // Update with new graph
  tripOverview(selectedValue);
});


/*
 * Main function
 */
function tripOverview(tripId) {
  // Responsive SVG from http://stackoverflow.com/questions/17626555/responsive-d3-chart
  let margin = {top: 20, right: 20, bottom: 30, left: 50},
      padding = 50,
      width = window.innerWidth,
      height = window.innerHeight;
  // Our playground
  let svg = d3.select("body").append("svg")
      .attr("width", '90%')
      .attr("height", '90%')
      .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
      .attr('preserveAspectRatio','xMinYMin')
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Two axes
  let xScale = d3.scaleBand().range([padding, width-padding]);
  let yScale = d3.scaleLinear().range([height-padding, padding]);

  // We'll not use the entire original dataset. Instead, we'll extract only
  // a few attributes and store them in this array
  let trip = [];

  // Fetch entries into trip[]
  d3.json("../Tran_project1/data/data.json", function(error, data) {
    if (error) throw error;

    // Extract only stop's name & the change of number of passengers
    let selectedTrip = data.trips[tripId];
    selectedTrip.locations.forEach(function(loc, i) {
      trip.push({
        "line": selectedTrip.line,
        "date": selectedTrip.date,
        "name": data.stops[loc.stopId].name,
        "change": loc.on - loc.off
      });
  });

  // All the necessary business to make a chart
  d3.json("../Tran_project1/data/data.json", function(error, data) {

    // Get the largest absolute value of y-values 
    // (since we are including both positive & negative values)
    let minY = d3.min(trip, function(t) { return t.change; }),
        maxY = d3.max(trip, function(t) { return t.change; }),
        limitY = Math.max(Math.abs(minY), Math.abs(maxY));

    // Set domains
    yScale.domain([-limitY, limitY]);
    xScale.domain(d3.set(trip.map(function(t) { return t.name; })).values());

    // The scaleBand put all values at the center of each segment. 
    // We need to move the data point a little bit to the right
    let offset = width/(2 * Object.keys(xScale.domain()).length);
    let line = d3.line()
      .x(function(t) { return xScale(t.name) + offset; })
      .y(function(t) { return yScale(t.change); });

    // Display trip information
    svg.append("text")
        .attr("transform", "translate(" + padding/2 + ", " + padding/2 + ")")
        .text("Line: " + trip[0].line + " on " + trip[0].date);

    // X-axis
    // Put at the center of the screen because the y-axis has both positive
    // and negative values
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(d3.axisBottom(xScale).tickValues(xScale.domain()));

    // Y-axis
    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + padding + ", 0)")
        .call(d3.axisLeft(yScale).tickValues(d3.range(-limitY, limitY, 2)))
      .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Stops");

    // Draw the chart
    svg.append("path")
        .datum(trip)
        .attr("class", "line")
        .attr("d", line);
    });

    // now add titles to the axes
    // Y-axis
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + padding/2 + "," + height/2 + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Change in number of Passengers");
    // X-axis
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ width/2 + "," + (height/2 - padding/8) + ")")  // centre below axis
        .text("Stop");
  });
}
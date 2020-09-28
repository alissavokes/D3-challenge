//defining svg properties
let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
let svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial axes
let chosenXAxis = "poverty"
let chosenYAxis = "healthcare"

//function to update x axis
function xScale(data, chosenXAxis){
    //create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=> d[chosenXAxis]),
        d3.max(data, d=> d[chosenXAxis])])
        .range([0, width])
    return xLinearScale
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    let label;
  
    if (chosenXAxis === "poverty") {
      label = "Poverty Rate: ";
    }
    else if (chosenXAxis === "age"){
        label = "Age (Median): ";
    }
    else{
        label = "Household Income (Median): "
    }
  
    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`<strong>${d.state}</strong><hr>${label}${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }  

//Import Data
d3.csv("assets/data/data.csv").then((data) => {
    //parse data/cast as numbers
    data.forEach(function(data) {
        data.poverty=+data.poverty;
        data.age=+data.age;
        data.income=+data.income;
        data.healthcare=+data.healthcare;
        data.obesity=+data.obesity;
        data.smokes=+data.smokes
    })

    //create scale functions
    let xLinearScale = xScale(data, chosenXAxis)

    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=>d.healthcare)])
        .range([height, 0]);

    //create axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    //append axes to chart
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0,${height})`)
        .call(bottomAxis);
    chartGroup.append("g")
        .call(leftAxis)

    //create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d=> xLinearScale(d[chosenXAxis]))
        .attr("cy", d=> yLinearScale(d.healthcare))
        .attr("r", "8")
        .attr("fill", "pink");

    //create chart group for x-axis labels
    let labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty(%)");

    let ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Household Income (Median)");

    //create y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Healthcare (%)")//y axis label
    
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //x axis event listener
    labelsXGroup.selectAll("text")
        .on("click", function(){
            let value = d3.select(this).attr("value");
            if(value !== chosenXAxis) {
                chosenXAxis = value
                console.log(chosenXAxis)

                xLinearScale = xScale(data, chosenXAxis)
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty") {
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else {
                    incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        })
})

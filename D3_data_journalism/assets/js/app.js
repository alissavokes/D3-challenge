//defining svg properties
let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
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

    //function to update x axis
    function xScale(data, chosenXAxis){
        //create scales
        let xLinearScale = d3.scaleLinear()
            .domain([0, d3.max(data, d=> d[chosenXAxis])])
            .range([0, width])
        return xLinearScale
    }
    //function to update y axis
    function yScale(data, chosenYAxis){
        //create scales
        let yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(data, d=>d[chosenYAxis])])
            .range([height, 0]);
        return yLinearScale
    }
    // function used for updating xAxis upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        let bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
        return xAxis;
    }

    // function used for updating yAxis upon click on axis label
    function renderYAxis(newYScale, yAxis) {
        let leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
        return yAxis;
    } 

    // function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d=> newXScale(d[chosenXAxis]))
            .attr("cy", d=> newYScale(d[chosenYAxis]))
        return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        let xLabel;
        let yLabel
    
        if (chosenXAxis === "poverty") {
        xLabel = "Poverty Rate(%): ";
        }
        else if (chosenXAxis === "age"){
            xLabel = "Age (Median): ";
        }
        else{
            xLabel = "Household Income (Median): "
        }

        if (chosenYAxis === "healthcare") {
            yLabel = "Lacks Healthcare Rate(%): ";
        }
        else if (chosenYAxis === "obesity"){
            yLabel = "Obese(%): ";
        }
        else{
            yLabel = "Smokes(%): "
        }
    
        let toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}</strong><hr>${xLabel}${d[chosenXAxis]}<br>
                ${yLabel}${d[chosenYAxis]}`);
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

        //create scale functions
        let xLinearScale = xScale(data, chosenXAxis)

        let yLinearScale = yScale(data, chosenYAxis)

        //create axis functions
        let bottomAxis = d3.axisBottom(xLinearScale);
        let leftAxis = d3.axisLeft(yLinearScale);

        //append axes to chart
        let xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0,${height})`)
            .call(bottomAxis);
        let yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        //create circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d=> xLinearScale(d[chosenXAxis]))
            .attr("cy", d=> yLinearScale(d[chosenYAxis]))
            .attr("r", "8")
            .attr("fill", "pink");

        // var circlesGroupText = chartGroup.selectAll("text")
        //     .data(data)
        //     .enter()
        //     .append("text")
        //     .attr("cx", d=> xLinearScale(d[chosenXAxis]))
        //     .attr("cy", d=> yLinearScale(d[chosenYAxis]))
        //     .text(d=> d.abbr)

        //create chart group for x-axis labels
        let labelsXGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        let povertyLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", margin.bottom - 65)
            .attr("value", "poverty")
            .classed("active", true)
            .text("Poverty(%)");

        let ageLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", margin.bottom - 45)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        let incomeLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", margin.bottom - 25)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Household Income (Median)");

        //create chart group for y-axis labels
        let labelsYGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")

        let healthcareLabel = labelsYGroup.append("text")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left + 60)
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        let obeseLabel = labelsYGroup.append("text")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left + 40)
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        let smokesLabel = labelsYGroup.append("text")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left + 20)
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //x axis event listener
        labelsXGroup.selectAll("text")
            .on("click", function(){
                let value = d3.select(this).attr("value");
                if(value !== chosenXAxis) {
                    chosenXAxis = value
                    console.log(chosenXAxis)

                    xLinearScale = xScale(data, chosenXAxis)
                    xAxis = renderXAxis(xLinearScale, xAxis);
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

        //y axis event listener
        labelsYGroup.selectAll("text")
            .on("click", function(){
                let value = d3.select(this).attr("value");
                if(value !== chosenYAxis) {
                    chosenYAxis = value
                    console.log(chosenYAxis)

                    yLinearScale = yScale(data, chosenYAxis)
                    yAxis = renderYAxis(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "obesity") {
                        obeseLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            })
})

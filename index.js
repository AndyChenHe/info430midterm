'use strict';

(function() {

  let data = "no data";
  let filter1 = 'all';
  let filter2 = 'all';
  let svgContainer = ""; // keep SVG reference in global scope
  const colors = {

    "Bug": "#4E79A7",

    "Dark": "#A0CBE8",

    "Dragon" : 'Orange',

    "Electric": "#F28E2B",

    "Fairy": "#FFBE&D",

    "Fighting": "#59A14F",

    "Fire": "#8CD17D",

    "Ghost": "#B6992D",

    "Grass": "#499894",

    "Ground": "#86BCB6",

    "Ice": "#86BCB6",

    "Normal": "#E15759",

    "Poison": "#FF9D9A",

    "Psychic": "#79706E",

    "Steel": "#BAB0AC",

    "Water": "#D37295",

    'Rock' : 'black',
    
    'Fly': 'rgb(18,103,253)'
    

}
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('#graph')
      .append('svg')
      .attr('width', 2000)
      .attr('height', 800);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("data.csv")
      .then((data) => makeScatterPlot(data));
      
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
    // get arrays of fertility rate data and life Expectancy data
    let def = data.map((row) => parseFloat(row["Sp. Def"]));
    let total = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(def, total);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    // draw legend
    drawlegend();

    // create filter generation
    var dropDown = d3.select("#filter").append("select")
      .attr("name", "Gen");


    let allGen = []
    allGen.push({gen : 'all'});
    for (let i = 0; i < data.length; i ++){
      if (i == 0){
        // let gen = {year:data[i].year};
        allGen.push({gen : data[i]['Generation']})
      } else if (data[i-1]['Generation'] !== data[i]['Generation']){
        // let year = {year:data[i].year};
        // allYear.push(year)
        allGen.push({gen : data[i]['Generation']});
      }
    }

      var options = dropDown.selectAll("option")
           .data(allGen)
            .enter()
           .append("option");

      options.text(function (d) { 
        return d.gen; })
      .attr("value", function (d) { return d.gen; });
      

      // add legendary filter
      var dropDown2 = d3.select("#filter2").append("select")
      .attr("name", "legendary");


    let allLegendaries = [];
    allLegendaries.push({legendary : 'all'});
    allLegendaries.push({legendary: 'True'});
    allLegendaries.push({legendary: 'False'});
      var options2 = dropDown2.selectAll("option")
           .data(allLegendaries)
            .enter()
           .append("option");

      options2.text(function (d) { 
        return d.legendary; })
      .attr("value", function (d) { return d.legendary; });


      // enable filter control
      dropDown.on("change", function() {
        var displayOthers = this.checked ? "inline" : "none";
        var display = this.checked ? "none" : "inline";
        filter1 = this.value;
        svgContainer.selectAll("circle")
            .filter(function(d) {return (filter1 != d.Generation && filter1 != 'all') || (filter2 != d.Legendary && filter2 != 'all');})
            .attr("display", displayOthers);
            
        svgContainer.selectAll("circle")
            .filter(function(d) {return (filter1 == d.Generation || filter1 == 'all') && (filter2 == d.Legendary || filter2 == 'all');})
            .attr("display", display);
        });


      dropDown2.on("change", function() {
      var displayOthers2 = this.checked ? "inline" : "none";
      var display2 = this.checked ? "none" : "inline";
      filter2 = this.value;
      svgContainer.selectAll("circle")
          .filter(function(d) { return (filter2 != d.Legendary && filter2 != 'all') || (filter1 != d.Generation && filter1 != 'all');})
          .attr("display", displayOthers2);
          
      svgContainer.selectAll("circle")
          .filter(function(d) {return (filter2 == d.Legendary || filter2 == 'all') && (filter1 == d.Generation || filter1 == 'all');})
          .attr("display", display2);
      });

  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 300)
      .attr('y', 50)
      .style('font-size', '20pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 600)
      .attr('y', 600)
      .style('font-size', '15pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(30, 300)rotate(-90)')
      .style('font-size', '15pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    
    // get population data as array
    let type_data = data.map((row) => row['Type 1']);
    let color_map = [];
      for (let i = 0; i < type_data.length; i ++){
        let color = colors[type_data[i]];
        color_map.push(color);
      }
    
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    let a = 1;
    let colorMapFunc = function (d) { return colors[d['Type 1']];}; 

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 10)
        .style('fill', colorMapFunc)
        .style('stroke', "rgb(93,120,124)")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          let type2 = d['Type 2'];
          if (type2 != ''){
            div.transition()
              .duration(10)
              .style("opacity", .9);
            div.html('Pokemon Info' + "<br/>" + 'Name: ' + d['Name']
                      + "<br/>" + 'Type 1: ' +d['Type 1'] 
                      + "<br/>" + 'Type 2: ' +d['Type 2']
                      )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          } else {
            div.transition()
            .duration(10)
            .style("opacity", .9);
          div.html('Pokemon Info' + "<br/>" + 'Name: ' + d['Name']
                    + "<br/>" + 'Type 1: ' +d['Type 1'] 
                    )
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          }
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // show legend

function drawlegend(){
  // Handmade legend
  svgContainer.selectAll(".legendDot")
  .data(Object.values(colors))
  .enter()
  .append("rect")
    .attr("x", 1300)
    .attr("y", function(d,i){ return 100 + 30 * i}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function(d){return d})
    .style('stroke', "rgb(93,120,124)")
  
  svgContainer.selectAll(".legendName")
  .data(Object.keys(colors))
  .enter()
  .append("text")
    .attr("x", 1330)
    .attr("y", function(d,i){ return 117 + 30 * i}) 
    .text(function(d){return d})
    .style("font-size", "18px")

}



  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }
    
    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
      .range([100, 1150]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 550)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) {return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([100, 550]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };
    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(100, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();

/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.5 - Activity: Adding SVGs to the screen
*/
// var data = [25,10,15,20,5];

var margin = { top: 50, right: 10, bottom: 150, left: 100 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select('#chart-area').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//x label
svg.append("text")
    .attr("class","x axis-label")
    .attr("x",width/2)
    .attr("y",height + 140)
    .attr("font-size","20px")
    .attr("text-anchor","middle")
    .text("World's Tallest Buildings");

//y label
svg.append("text")
    .attr("class","y axis-label")
    .attr("x",-(height/2))
    .attr("y",-50)
    .attr("font-size","20px")
    .attr("text-anchor","middle")
    .attr("transform","rotate(-90)")
    .text("Height (m)");

d3.json("data/buildings.json").then(function(data) {
    data.forEach(function(d) {
        data.height = +data.height;
    });

    var x = d3.scaleBand()
            .domain(data.map(function(d){return d.name;}))
            .range([0,width])
            .paddingOuter(0.3)
            .paddingInner(0.3);

    var y = d3.scaleLinear()
        .domain([0,d3.max(data,function(d){
            return d.height;
        })])
        .range([height,0]);
    
    var xAxisCall = d3.axisBottom(x);

    svg.append("g")
        .attr("class","x-axis")
        .attr("transform","translate(0,"+height+")")
        .call(xAxisCall)
        .selectAll("text")
        .attr("y","10")
        .attr("x","-5")
        .attr("text-anchor","end")
        .attr("transform", "rotate(-40)");

    var yAxisCall = d3.axisLeft(y)
        .ticks(3)
        .tickFormat(function(d){
            return d + "m";
        });

    svg.append("g")
        .attr("class","y-axis")
        .call(yAxisCall);

    var rects = svg.selectAll("rect")
        .data(data);

    rects.enter().append('rect')
        .attr("y",function(d){
            return y(d.height);
        })
        .attr("x",function(d){
            return x(d.name);
        })
        .attr("width",x.bandwidth)
        .attr("height",function(d){
           return height - y(d.height);
        })
        .attr("fill","grey");

}).catch(function(error){
    console.log(error);
});



/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

var margin = { left:80, right:20, top:50, bottom:100 };

var width = 600 - margin.left - margin.right,
   height = 400 - margin.top - margin.bottom;
   
var g = d3.select("#chart-area")
   .append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
   .append("g")
       .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// X Label
g.append("text")
   .attr("y", height + 50)
   .attr("x", width / 2)
   .attr("font-size", "20px")
   .attr("text-anchor", "middle")
   .text("Month");

// Y Label
g.append("text")
   .attr("y", -60)
   .attr("x", -(height / 2))
   .attr("font-size", "20px")
   .attr("text-anchor", "middle")
   .attr("transform", "rotate(-90)")
   .text("Revenue");

d3.json("data/revenues.json").then(function(data){
   // console.log(data);

   // Clean data
   data.forEach(function(d) {
       d.revenue = +d.revenue;
   });

   // X Scale
   var x = d3.scaleBand()
       .domain(data.map(function(d){ return d.month }))
       .range([0, width])
       .padding(0.2);

   // Y Scale
   var y = d3.scaleLinear()
       .domain([0, d3.max(data, function(d) { return d.revenue })])
       .range([height, 0]);

   // X Axis
   var xAxisCall = d3.axisBottom(x);
   g.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height +")")
       .call(xAxisCall);

   // Y Axis
   var yAxisCall = d3.axisLeft(y)
       .tickFormat(function(d){ return "$" + d; });
   g.append("g")
       .attr("class", "y axis")
       .call(yAxisCall);

   // Bars
   var rects = g.selectAll("rect")
       .data(data)
       
   rects.enter()
       .append("rect")
           .attr("y", function(d){ return y(d.revenue); })
           .attr("x", function(d){ return x(d.month) })
           .attr("height", function(d){ return height - y(d.revenue); })
           .attr("width", x.bandwidth)
           .attr("fill", "grey");
})
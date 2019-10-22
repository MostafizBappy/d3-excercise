/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        ", " + margin.top + ")");

// Time parser for x-scale
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

// For tooltip
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var t = function(){ return d3.transition().duration(1000); };

// Add line to chart
g.append("path")
.attr("class", "line")
.attr("fill", "none")
.attr("stroke", "grey")
.attr("stroke-with", "3px");

// Axis generators
var xAxisCall = d3.axisBottom().ticks(4);
var yAxisCall = d3.axisLeft();

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis")
    
// Y-Axis label
var ylabel = g.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("x",-160)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .attr("font-size",'20px')
    .attr("fill", "#5D6971")
    .text("Price (USD)");

//x label
var xLabel = g.append("text")
    .attr("class","x-axisLabel")
    .attr("x",width/2)
    .attr("y",height + 60)
    .attr("text-anchor","middle")
    .attr("font-size","20px")
    .attr("fill", "#5D6971")
    .text("Time");



// Event listeners
$("#coin-select").on("change", Update)
$("#var-select").on("change",Update)

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        Update();
    }
});

d3.json("data/coins.json").then(function(data) {
    // Data cleaning
    filterdata = {};
    for(var coin in data){
        if(!data.hasOwnProperty(coin)){
            continue;
        }
        filterdata[coin] = data[coin].filter(function(d){
            return !(d["price_usd"]== null) && !(d["date"]== null)
        })
        filterdata[coin].forEach(function(d){
            d["24h_vol"] = +d["24h_vol"];
            d["market_cap"] = +d["market_cap"];
            d["price_usd"] = +d["price_usd"];
            d["date"] = parseTime(d["date"]);
        })
    }
console.log(filterdata);
    // Set scale domains
Update();

})

function Update(){

    var coinSelect = $('#coin-select').val();
    var varSelect = $('#var-select').val();
    var sliderValues =$('#date-slider').slider('values');
    var dateFilteredData = filterdata[coinSelect].filter(function(d) {
        return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
    });
    x.domain(d3.extent(dateFilteredData, function(d) { return d.date; }));
    y.domain([d3.min(dateFilteredData, function(d) { return d[varSelect]; }) / 1.005, 
        d3.max(dateFilteredData, function(d) { return d[varSelect]; }) * 1.005 ]);


    // Fix for format values
    var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }
    
    // Generate axes once scales have been set
    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

    //clear old tooltip
    d3.select(".focus").remove();
    d3.select(".overplay").remove();
    
    /******************************** Tooltip Code ********************************/

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 4);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(dateFilteredData, x0, 1),
                d0 = dateFilteredData[i - 1],
                d1 = dateFilteredData[i],
                d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d[varSelect]) + ")");
            focus.select("text").text(function() { return d3.format("$,")(d[varSelect]); });
            focus.select(".x-hover-line").attr("y2", height - y(d[varSelect]));
            focus.select(".y-hover-line").attr("x2", -x(d.date));
        }


    /******************************** Tooltip Code ********************************/

    // Line path generator
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d[varSelect]); });

    g.select(".line")
            .transition(t())
            .attr("d",line(dateFilteredData))

    //y label
    var yText = (varSelect == 'price_usd') ? 'Price (USD)' : ((varSelect == 'market_cap') ? 'Market Capitalization (USD)'
            : '24 Hour Trading Volume (USD)');

    ylabel.text(yText);

}


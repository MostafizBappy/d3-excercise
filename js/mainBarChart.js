/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

var margin = { top: 50, right: 10, bottom: 100, left: 80 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select('#chart-area').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



var flag = true;
var t = d3.transition().duration(1000);
//x scale
var x = d3.scaleBand()
.range([0,width])
.padding(0.2);

//y-scale
var y = d3.scaleLinear()
.range([height,0]);

//x-axis group
var xaxisGroup = svg.append('g')
.attr('class','x-axis')
.attr('transform','translate(0,'+height+')');
// .selectAll('text')
// .attr('x','0')
// .attr('y','10')
// .attr('text-anchor','middle');

//y-axis group
var yaxisGroup = svg.append('g')
.attr('class','y-axis');

//x label
svg.append('text')
.attr('x',width/2)
.attr('y',height + 50)
.attr('font-size','18px')
.attr('text-anchor','middle')
.text('Month');

//y label

var ylabel = svg.append('text')
.attr('x',-(height/2))
.attr('y',-60)
.attr('font-size','18px')
.attr('text-anchor','middle')
.attr('transform','rotate(-90)')
.text('Revenue');

d3.json("data/revenues.json").then(function(data) {
  data.forEach(function(d) {
      d.revenue = +d.revenue;
      d.profit = +d.profit;
  });
   

  d3.interval(function(){
      var newData = flag ? data : data.slice(1);
      update(newData);
      flag = !flag;
  },1000);

  //run only once
  update(newData);

}).catch(function(error){
    console.log(error);
});

function update(data){

  var value = flag ? "revenue" : "profit";
  

  x.domain(data.map(function(d){return d.month}));
  y.domain([0,d3.max(data,function(d){return d[value]})]);
  //add axis
  var xAxisCall = d3.axisBottom(x);
  xaxisGroup.transition(t).call(xAxisCall);
  

  var yAxisCall = d3.axisLeft(y)
  .tickFormat(function(d){ 
    return '$'+d;});
  yaxisGroup.transition(t).call(yAxisCall);
  
  //join new data with old element
  var rects = svg.selectAll("rect")
  .data(data,function(d){
      return d.month;
  });

  //remove old rects with old data
  rects.exit()
  .attr('fill','red')
    .transition(t)
    .attr('y',y(0))
    .attr('height',0)
    .remove();

  //update old element present in new data
//   rects
//   .attr("x", function(d){ return x(d.month) })
//   .attr("width", x.bandwidth)
//   .transition(t)
//   .attr("y", function(d){ return y(d[value]); })
//   .attr("height", function(d){ return height - y(d[value]); });

  //enter new element with new data
  rects.enter()
    .append("rect")
    .attr("fill", "grey")
    .attr("y",y(0))
    .attr("height",0)
    .merge(rects)
    .transition(t)
    .attr("x", function(d){ return x(d.month) })
    .attr("width", x.bandwidth)
    .attr("y", function(d){ return y(d[value]); })
    .attr("height", function(d){ return height - y(d[value]); });

  var text = flag ? "revenue" : "profit";
  ylabel.text(text);
}



var margin = { top: 50, right: 20, bottom: 100, left: 100},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('#chart-area').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var time = 0;
var interval;
var formatterData;
//x scale
var x = d3.scaleLog()
          .base(10)
          .domain([300,150000])
          .range([0,width]);
//y scale
var y = d3.scaleLinear()
          .domain([0,90])
          .range([height,0]);

//area scale
var area = d3.scaleLinear()
            .domain([2000,1400000000])
            .range([25*Math.PI,1500*Math.PI]);

var continentColor = d3.scaleOrdinal(d3.schemePaired);

//x axis
var xAxis = d3.axisBottom(x)
              .tickValues([400,4000,40000])
              .tickFormat(d3.format('$'));

svg.append('g')
    .attr('class','x-axis')
    .attr('transform','translate(0,'+height+')')
    .call(xAxis);

//y axis
var yAxisCall = d3.axisLeft(y)
  .tickFormat(function(d){ return +d });

//x label
var xLabel = svg.append('text')
  .attr('y',height + 50)
  .attr('x',width/2)
  .attr('font-size','20px')
  .attr("text-anchor", "middle")
  .text('GDP per Capita ($)');

//y label
var yLabel = svg.append('text')
  .attr('transform','rotate(-90)')
  .attr('x',-170)
  .attr('y',-40)
  .attr("text-anchor", "middle")
  .attr('font-size','20px')
  .text('Life Expectancy (years)')

//time label
var timeLabel = svg.append('text')
  .attr('x',width-70)
  .attr('y',height-10)
  .attr('font-size','30px')
  .attr('opacity','.5')
  .text('1800');

svg.append("g")
  .attr("class", "y axis")
  .call(yAxisCall);

//color legend
var continents = ["asia","europe","americas","africa"];
var legends = svg.append('g')
  .attr('transform','translate('+(width-20)+','+(height-120)+')');

continents.forEach(function(continent,i){
  var legendRow = legends.append('g')
    .attr('transform','translate(0,'+i*20+')');

  legendRow.append('rect')
    .attr('width',10)
    .attr('height',10)
    .attr('fill',continentColor(continent));

  legendRow.append('text')
    .attr('x',-10)
    .attr('y',10)
    .attr('text-anchor','end')
    .style('text-transform','capitalize')
    .text(continent);
})

var tip = d3.tip().attr('class','d3-tip').html(function(d){
    var text = "<strong>Country: </strong><span style='color:yellow'>"+ d.country +"</span><br>";
    text += "<strong>Continent: </strong><span style='color:yellow;text-transform:capitalize'>"+ d.continent +"</span><br>";
    text += "<strong>Life Expectancy: </strong><span style='color:yellow'>"+ d3.format('.2f')(d.life_exp) +"</span><br>";
    text += "<strong>GDP per capita: </strong><span style='color:yellow'>"+ d3.format('$,.0f')(d.income) +"</span><br>";
    text += "<strong>Population: </strong><span style='color:yellow'>"+ d3.format(',.0f')(d.population) +"</span><br>";
    return text;
});

svg.call(tip);

d3.json('data/data.json').then(function(data) {
  formatterData = data.map(function(year){
    return year['countries'].filter(function(country){
      var doesExists = (country.income && country.life_exp);
      return doesExists;
    }).map(function(country){
      country.income = +country.income;
      country.life_exp = +country.life_exp;
      return country;
    })
  })
  console.log(formatterData);
  

  //run only for the first time
  update(formatterData[0]);
})

//play and pause button
$('#play-button').on('click', function(){
  var button = $(this);
  if(button.text() == "Play"){
    button.text("Pause");
    interval = setInterval(step,200);
  }
  else{
    button.text("Play");
    clearInterval(interval);
  }
})

//reset button
$('#reset-button').on('click',function(){
  time = 0;
  update(formatterData[0]);
})

//on change select event
$('#continent-select').on('change', function(){
  update(formatterData[time]);
})

//slider
$('#date-slider').slider({
  max: 2014,
  min: 1800,
  step: 1,
  slide: function(event,ui){
    time = ui.value - 1800;
    update(formatterData[time]);
  }
})

function step(){
  time = (time < 214) ? time + 1 : 0;
  update(formatterData[time]);
}

function update(data){

  var selectedContinent = $('#continent-select').val();
  data = data.filter(function(d){
    if(selectedContinent == 'all'){
      return true; }
    else{
      return d.continent == selectedContinent;
    }
  })

  var t = d3.transition()
    .duration(200);

  //join new elements with old ones
  var circles = svg.selectAll('circle')
    .data(data,function(d){return d.country});

  //remove old data
  circles.exit()
    .attr('class','exit')
    .remove();
  
  
  circles.enter()
    .append('circle')
    .attr('class','enter')
    .attr('fill', function(d){return continentColor(d.continent)})
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .merge(circles)
    .transition(t)
      .attr('cx', function(d){return x(d.income)})
      .attr('cy', function(d){return y(d.life_exp)})
      .attr('r', function(d){return Math.sqrt(area(d.population)/Math.PI)});

  timeLabel.text(+(time+1800));
  $('#year')[0].innerHTML = +(time+1800);
  $('#date-slider').slider('value', +(time+1800));
}





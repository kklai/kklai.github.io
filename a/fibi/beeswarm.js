function drawBeeswarm(dist, dotcount) {

  var max = d3.max(dist);
  var min = d3.min(dist);
  var totaldist = d3.sum(dist)
  var cumulativeDist = [];
  var cum = 0;
  dist.forEach(function(d){
    cum += d;
    cumulativeDist.push(cum);
  })

  var svg = d3.select(".beeswarm");
  var path = svg.select("path").node();
  var length = path.getTotalLength();
  var circleg = svg.selectAppend("g.cirlceg").html("");

  var dotdens = [];
  var cum = 0;
  dotcount.forEach(function(d){
    d = d/5;
    var range = d3.range(1,d+1);
    range.forEach(function(a){
      cum += 1/d
      dotdens.push(cum);
    })
  })
  var totaldist = d3.sum(dotdens);
  var nodes = [];
  dotdens.forEach(function(d,i){
    var pt = path.getPointAtLength((d/cum)*length);

    nodes.push({x: pt.x, y: pt.y, r: 5});

    // circleg.append("circle")
    //   .style("fill", "#0000ff")
    //   .attr("r", 5)
    //   .attr("cx", pt.x)
    //   .attr("cy", pt.y)
  })

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", function(d){  return d.r })
    .style("fill", "#0000ff")


  var simulation = d3.forceSimulation()
      .force("collide",d3.forceCollide(d => d.r))
      // .force("charge", d3.forceManyBody())
      .force("y", d3.forceY(d => d.y))
      .force("x", d3.forceX(d => d.x))

  var ticked = function() {
      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
  } 

  simulation
    .nodes(nodes)
    .on("tick", ticked);

}
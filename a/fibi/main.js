console.clear();

var numberOfPoints = 20;
var chartType = "normal";

function drawAudio(url, filename) {
  if (!url) {
    url = "audio/230116_0080_U-Bahn.mp3"
    filename = "230116_0080_U-Bahn.mp3"
  }
  document.querySelector(".audio").innerHTML = "";
  document.querySelector(".track-name").innerHTML = filename;
  var audioTrack = WaveSurfer.create({
    container: ".audio",
    waveColor: "#000",
    progressColor: "#cc0000",
    barWidth: 1,
    normalize: true,

  });
  audioTrack.load(url);
  audioTrack.on('ready', function () {
    var peaks = audioTrack.backend.getPeaks(numberOfPoints);
    var dist = [];

    peaks.forEach(function(peak,i){
      if (peak > 0) {
        dist.push(peak - peaks[i+1])
      }
    })
    drawGraph(dist);
  });

  const playBtn = document.querySelector(".play-btn");
  const stopBtn = document.querySelector(".stop-btn");
  const muteBtn = document.querySelector(".mute-btn");
  const volumeSlider = document.querySelector(".volume-slider");

  playBtn.addEventListener("click", () => {
    audioTrack.playPause();

    if (audioTrack.isPlaying()) {
      playBtn.classList.add("playing");
    } else {
      playBtn.classList.remove("playing");
    }
  });

  stopBtn.addEventListener("click", () => {
    audioTrack.stop();
    playBtn.classList.remove("playing");
  });

  volumeSlider.addEventListener("mouseup", () => {
    changeVolume(volumeSlider.value);
  });

  const changeVolume = (volume) => {
    if (volume == 0) {
      muteBtn.classList.add("muted");
    } else {
      muteBtn.classList.remove("muted");
    }

    audioTrack.setVolume(volume);
  };

  muteBtn.addEventListener("click", () => {
    if (muteBtn.classList.contains("muted")) {
      muteBtn.classList.remove("muted");
      audioTrack.setVolume(0.5);
      volumeSlider.value = 0.5;
    } else {
      audioTrack.setVolume(0);
      muteBtn.classList.add("muted");
      volumeSlider.value = 0;
    }
  });
}

function drawGraph(dist) {
  var max = d3.max(dist);
  var min = d3.min(dist);
  var sel = d3.select(".g-bar-chart").html("");
  var audioCont = d3.select(".audio");
  var width = audioCont.node().getBoundingClientRect().width;
  var height = audioCont.node().getBoundingClientRect().height;
  var x = d3.scaleBand().domain(d3.range(0,numberOfPoints)).range([0,width]).padding(0.1);
  var y = d3.scaleLinear().domain([min,max]).range([height,0]);
  var r = x.bandwidth()/2;
  var svg = sel.append("svg")
    .attr("width", width)
    .attr("height", height)
    .translate([r,0])

  var dotcount = [];
  dist.forEach(function(d,i){
    var h = (y(0) - y(d));
    var each = svg.append("g")
      .translate([x(i),height/2 - h/2])
      .attr("fill", "#0000ff")
    var dots = Math.floor(h/(r*2));
    dots = dots == 0 ? 1 : dots;

    dotcount.push(dots);

    each.appendMany("circle", d3.range(0,dots))
      .attr("class", "g-circle g-group-" + i)
      .attr("data-group", i)
      .translate((cd,ci) => [0,r*ci*2])
      .attr("r", r)
  })

  if (chartType == "normal") {
    drawDots(dist, dotcount);
  } else {
    drawBeeswarm(dist, dotcount);  
  }

}

function drawDots(dist, dotcount) {
  var cont = d3.select(".g-a3-cont");
  var contw = cont.node().getBoundingClientRect().width;
  var conth = contw*29.7/42;
  var r = Math.sqrt((contw*conth)*((314.16)/(124740))/Math.PI)*2;

  // d3.selectAll(".g-letter").classed("g-active", false);
  // d3.select(".g-letter#z").classed("g-active", true);

  var svg = d3.select(".g-letter.g-active");
  var path = svg.select("path").node();
  var length = path.getTotalLength();
  var circleg = svg.selectAppend("g.cirlceg").html("");
  var guideg = svg.selectAppend("g.guideg").html("");

  dotcount.forEach(function(d,i){
    for (var j = 0; j < d; j++) {
      var pt = path.getPointAtLength((((i+j/d)/dotcount.length))*length);
    // var pt = path.getPointAtLength((((i)/dotcount.length))*length);
      var a = circleg.append("g")
        .attr("data-group", i)
        .attr("class", "g-circle g-group-" + i)
        .attr("transform", "translate(" + pt.x + "," + pt.y + ")")
        // .style("stroke", "#0000ff")
        // .style("fill", "none")
        // .style("stroke-dasharray", "4 4")
        .style("fill", "#0000ff")
      a.append("circle")
        .attr("r", r)  
    }
  })

  d3.selectAll(".g-circle").on("click", function(){
    var el = d3.select(this);
    var group = el.attr("data-group");
    d3.selectAll(".g-circle").style("fill", "#0000ff")
    d3.selectAll(".g-group-" + group).style("fill", "#000")
  })

  drawGuide(path, length, guideg);
  showGuide();
}

function drawGuide(path, length, guideg) {
  var pts = [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1];
  var guidegpath = guideg.append("g")
  var guidegcircle = guideg.append("g")
  pts.forEach(function(d,i){
    var pt = path.getPointAtLength(d*length);
    var a = guidegcircle.append("g")
      .translate([pt.x, pt.y]);
    a.append("circle")
      .attr("r", 3)
      .attr("fill", "red")
      // .attr("stroke", "red")

    a.append("text")
      .text(d*100 + "%")
      .translate([5,5])
      .style("fill", "red")
      // .style("font-weight", "bold")
      .style("font-size", "18px")
  })
}

document.querySelector('.sample-button').addEventListener('click', (e) => {
  e.preventDefault();
  drawAudio()
});

let profileAud;
let profileAudURL;

document.querySelector('.upload-audio-button').addEventListener('click', (e) => {
  e.preventDefault();
  profileAud = document.querySelector('input.profile-aud').files[0];
  profileAudURL = URL.createObjectURL(profileAud);
  drawAudio(profileAudURL, profileAud.name)
});


d3.selectAll(".g-select").on("click", function(){

  d3.select(".g-a3-cont").style("background-image", "none")
  var el = d3.select(this); 
  var letter = el.attr("data-letter");

  d3.selectAll(".g-select").classed("g-active", false);
  d3.select(".g-select-" + letter.toLowerCase()).classed("g-active", true);

  d3.select(".g-canvas-cont").html("");
  d3.selectAll(".g-letter").classed("g-active", false);
  d3.select("#" + letter.toLowerCase()).classed("g-active", true);

  if (profileAud) {
    drawAudio(profileAudURL, profileAud.name)
  } else {
    drawAudio();
  }

  // d3.select(".g-guide-button .g-select").text("Show guide")
  // d3.selectAll(".guideg").style("display", "none");
})

document.querySelector('.g-print').addEventListener('click', (e) => {
  e.preventDefault();
  d3.select(".g-canvas-cont").html("");

  html2canvas(document.querySelector(".g-a3-cont")).then(canvas => {
      document.querySelector(".g-canvas-cont").appendChild(canvas)
  });

});


document.querySelector('.g-update').addEventListener('click', (e) => {
  e.preventDefault();
  var dots = d3.select("#dotfrequency").node().value;
  if (isNaN(+dots)) {
    alert("Please enter a number.")
  } else {
    numberOfPoints = +dots;
    drawAudio();
  }
});


d3.select(".g-guide-button").on("click", function(){
    showGuide(true);
})

d3.select(".g-beeswarm-button").on("click", function(){
    console.log("hi")
    if (chartType == "normal") {
      chartType = "beeswarm";
      drawAudio();
      d3.select(".g-beeswarm-button .g-inner").text("Back to linear");
    } else {
      chartType = "normal"
      drawAudio();
      d3.select(".g-beeswarm-button .g-inner").text("Try beeswarm");
    }


})

function showGuide(clicked) {
  var el = d3.select(".g-guide-button .g-inner");
  var status = el.text();
  var letter = d3.select(".g-letter.g-active");
  console.log()

  console.log(status)

  if (status == "Show guide" && clicked) {
    d3.selectAll(".guideg").style("display", "block");
    d3.select(".g-a3-cont").style("background-image", "url(png/guide_" + letter.attr("id") + ".png")
    el.text("Hide guide");
  } else if (status == "Hide guide" && clicked) {
    d3.selectAll(".guideg").style("display", "none");
    d3.select(".g-a3-cont").style("background-image", "none")
    el.text("Show guide");
  } else if (status == "Hide guide") {
    d3.selectAll(".guideg").style("display", "block");
    d3.select(".g-a3-cont").style("background-image", "url(png/guide_" + letter.attr("id") + ".png")
    el.text("Hide guide");
  }
}

drawAudio();


function drawBeeswarm(dist, dotcount) {

  var cont = d3.select(".g-a3-cont");
  var contw = cont.node().getBoundingClientRect().width;
  var conth = contw*29.7/42;
  var r = Math.sqrt((contw*conth)*((314.16)/(124740))/Math.PI)*2;

  // d3.selectAll(".g-letter").classed("g-active", false);
  // d3.select(".g-letter#z").classed("g-active", true);

  var svg = d3.select(".g-letter.g-active");
  var path = svg.select("path").node();
  var length = path.getTotalLength();
  var circleg = svg.selectAppend("g.cirlceg").html("");
  var guideg = svg.selectAppend("g.guideg").html("");

  var nodes = [];
  dotcount.forEach(function(d,i){
    for (var j = 0; j < d; j++) {
      var pt = path.getPointAtLength((((i+j/d)/dotcount.length))*length);
      nodes.push({x: pt.x, y: pt.y, r: r});
    }
  })

  var node = circleg.append("g")
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


  drawGuide(path, length, guideg);
  showGuide();
}








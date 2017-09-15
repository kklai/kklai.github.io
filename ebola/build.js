  var files = ['gin', 'lbr', 'sle', 'boundaries', 'gin_cases', 'lbr_cases', 'sle_cases'];

  var earliestGoodCasesWeek = '2014-12-30';

  console.log(d3, $, _)

  var q = queue();
    _.each(files, function(f){ q.defer(d3.json, f + '.json'); });
    q.await(boot);

  var freetownCoords = [-13.237555, 8.473684];

  var mapCenter = [-11.07, 8.9];
  var mapRatio = 1.04;

  var keyBubbleCuts = [10, 50, 150];

  var countries = ["gin", "lbr", "sle"];

  var countriesLoc = [
    {"name": "Liberia", "slug": "lib", "lat": 6.416873, "lon": -9.610213},
    {"name": "Sierra Leone", "slug": "sle", "lat": 8.5, "lon": -12.3},
    {"name": "Guinea", "slug": "gin", "lat": 10.597603, "lon": -11.055906}
  ];

  var majorCities = [
    {"name": "Monrovia", "lat": 6.300774, "lon": -10.797160},
    // {"name": "Kenema", "lat": 7.8766667, "lon":  -11.1875},
    // {"name": "Guéckédou", "lat": 8.5674400, "lon": -10.1336000},
    {"name": "Conakry", "lat": 9.537029, "lon": -13.67847},
    {"name": "Freetown", "lat": 8.473684, "lon": -13.237555}
  ];

  var hundredRadius = 30;

  var path = d3.geo.path()
    .projection(projection);

  var geo = {};
  var maxNewCases, sliderWidth, bubbleScale, minWeek, maxWeek, numWeek, 
      currentWeek, caseBubbles, projection, height, width, chartBarW,
      svg, earliestGoodWeek, countryScrubbers, gWrapper, theWeek, theScrubber, theMap, scrubberBar, isMobile, noCountyData;

  var cases;
  var national = {};

  function boot(err, gin, lbr, sle, boundaries, gin_cases, lbr_cases, sle_cases) {
    gWrapper = $("#g-graphic");
    theWeek = $('.the-week');
    theScrubber = $('.g-scrubber');
    theMap = $('#g-map');
    scrubberBar = $('.g-scrubber-bar');

    // window.cases = cases;
    // window.national = national;
    geo.gin = gin;
    geo.lbr = lbr;
    geo.sle = sle;
    geo.boundaries = boundaries;

    cases = $.extend(gin_cases, lbr_cases, sle_cases);
    window.cases = cases;

    _.each(countriesLoc, function(c){
      national[c.name] = {
        'cases': [],
        'country': c.name,
        'county': c.name
      }
    })

    _.each(cases['Conakry'].cases, function(c, idx){
      _.each(countriesLoc, function(country){
        national[country.name].cases[idx] = {
          "cases": 0,
          "newCases": 0,
          "week": c.week
        }
      })
    })

    window.national = national;

    for (var local in cases) {
      var country = cases[local].country;
      _.each(cases[local].cases, function(c, idx){
        national[country].cases[idx].newCases += cases[local].cases[idx].newCases
      })
    }

    prepData();
    // checkData();
    render();
    bindEvents();
  }

  function prepData() {
    maxNewCases = _.max(_.pluck(_.flatten(_.pluck(_.values(cases), 'cases')), 'newCases'));
    bubbleScale = d3.scale.sqrt()
      .domain([0, 100])
      .range([0, hundredRadius]);
    
    numWeeks = cases.Conakry.cases.length;
    currentWeek = numWeeks - 1;
    minWeek = cases.Conakry.cases[0].week;
    maxWeek = cases.Conakry.cases[numWeeks - 1].week;
    earliestGoodWeek = _.indexOf(_.pluck(cases.Conakry.cases, 'week'), earliestGoodCasesWeek);
  }

  function checkData() {
    var casesByCountry = _.groupBy(_.values(cases), 'country');
    for (var country in national) {
      var data = national[country].cases;
      for (var i = 0; i < data.length; i++) {
        var weekData = data[i];
        var sumFromCases = _.reduce(casesByCountry[country], function(sum, county) {
          return sum + county.cases[i].newCases;
        }, 0);
        console.log(country, weekData.week, weekData.newCases, sumFromCases);
      }
    }
  }

  function render() {
    var prevIsMobile = isMobile;
    isMobile = !$('html').hasClass('viewport-small-20');
    if (!prevIsMobile && isMobile && noCountyData) {
      updateWeek(numWeeks - 1)
    }
    svg = d3.select(theMap[0]).append("svg")
      .attr('class', 'the-map');
    if ($("#g-graphic").width() > 680) {
      width = 420;
    } else if ($("#g-graphic").width() > 400) {
      width = 350;
    } else if ($("#g-promo-graphic").width() > 400) {
      width = 350;
    } else if ($("#g-graphic").width() === null) {
      width = $("#g-promo-graphic").width();
    }else {
      width = $("#g-graphic").width();
    }

    height = width * mapRatio;
    gWrapper.css("min-height", height)
    theMap.css("width", width)

    projection = d3.geo.albers()
      .center(mapCenter)
      .rotate([0,0.25])
      .scale(width*7)
      .translate([width / 2, height / 2]);

    svg.attr("width", width)
      .attr("height", height);

    // cases.Freetown.centroid = projection(freetownCoords);

    _.each(countries, function(c){
      drawCountries(c, "g-districts", width);
    });
    drawBoundaries();
    drawCases();
    addLabels();
    drawKey();
    sliderWidth = $('.g-scrub').width();

    _.each(countriesLoc, function(c){
      $(".g-leftcol").append("<div class='g-chart' id='g-chart-" + c.slug +"'></div>");
      drawCharts(c.slug, c.name);
    });

    updateWeek(currentWeek);
  }

  function bindEvents() {
    d3.select('.g-scrub-outer').call(d3.behavior.drag().on('drag', drag));
    d3.selectAll('.g-country-scrub').call(d3.behavior.drag().on('drag', drag));
    animate();
  }

  var tooltip = null;

  function showTooltip() {
    var bubble = d3.select(this);
    var cx = +bubble.attr('cx');
    var cy = +bubble.attr('cy');
    var radius = +bubble.attr('r');
    var newCases = +bubble.attr('data-newcases');
    var county = bubble.attr('data-county');
    var html = templates.jst.tooltip({
      top: cy - radius,
      left: cx,
      newCases: newCases, 
      countyName: countynames[county]['edited-county-name']
    });
    tooltip = $(html);
    tooltip.appendTo(theMap);
  }

  function hideTooltip() {
    tooltip && tooltip.remove();
    tooltip = null;
  }

  function drag() {
    var x = d3.mouse(this)[0];
    var pct = Math.min(Math.max(x / sliderWidth, 0), 1);
    var week = Math.min(Math.round(pct * numWeeks), numWeeks - 1);
    if (week != currentWeek) {
      updateWeek(week);
    }
  }

  function drawCountries(input, type, i, width) {
    var id = input + (type == 'g-outline' ? '_outline' : '');
    var country = geo[input];
    var features = topojson.feature(country, country.objects.simp);

    var path = d3.geo.path()
        .projection(projection);

    svg.selectAll(".region")
      .data(features.features)
    .enter().append("path")
      .each(function(d) {
        var name = d.properties.ADM2_NAME || d.properties.ADM1_NAME;
        if (!name) return;
        name = name.replace(/^Grand([^ ])/, 'Grand $1').replace(/é/g, 'e');
        var centroid = d.properties.centroid = path.centroid(d);
        var county = cases[name];
        if (county) {
          county.centroid = centroid;
        }
      })
      .attr("class", function(d) {
        return type + " " + d.properties.CNTRY_CODE.toLowerCase();
      })
      .attr("id", function(d){
        if (d.properties.CNTRY_CODE === "LBR") {
          return input + "-" + d.properties.ADM1_NAME;
        } else {
          return input + "-" + d.properties.ADM2_NAME;
        }
      })
      .attr("d", path);
  }

  function drawBoundaries() {
    var country = geo['boundaries'];
    var features = topojson.feature(country, country.objects.boundaries);
    var path = d3.geo.path()
      .projection(projection);
      
    svg.selectAll(".region")
      .data(features.features)
    .enter().append("path")
      .attr("class", "g-outline")
      .attr("d", path);
  }

  function addLabels(){
    labels = svg.selectAll('.g-country')
      .data(countriesLoc)
    .enter().append("text")
      .attr("class", "g-country")
      .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")"; })
      .text(function(d) { return d.name; });

    cityLabels = svg.selectAll('.pin-label')
      .data(majorCities)
    .enter()
      .append('circle')
      .attr('class', 'pin-dot')
      .attr('r', 2)
      .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")"; });

    svg.selectAll('.pin-label')
      .data(majorCities)
    .enter()
      .append("text")
      .attr("class", "pin-label")
      .attr("dy", ".35em")
      .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")"; })
      .text(function(d) { return d.name; });

    svg.selectAll(".pin-label")
      .attr("x", function(d) { return d.lon > -1 ? 6 : -6; })
      .style("text-anchor", function(d) { return d.lon > -1 ? "start" : "end"; });

    $("#g-map").append("<img class='g-minimap' src='minimap.png" + "'>");
  }


  function drawKey() {
    theMap.append('<div class="no-data-label">DISTRICT DATA NOT AVAILABLE</div>');
    
    key = d3.select(theMap[0])
      .append("div")
      .attr("class", "g-key");

    $(".g-key").append("<p class='g-key-title'>Number<br>of new cases<br>each week</p>");

    caseKeys = key.append("svg")
      .attr("width", "100px")
      .attr("height", "100px");

    caseKeys.selectAll('.g-case-key')
      .data(keyBubbleCuts)
    .enter()
      .append('circle')
      .attr('class', 'g-case')
      .attr("cx", 50)
      .attr("cy", function(d, i) {
        return 100 - bubbleScale(d);
    })
      .attr('r', function(d) { return bubbleScale(d); });

    caseKeys.selectAll("text")
      .data(keyBubbleCuts)
    .enter()
      .append("text")
      .attr("class", "g-key-text")
      .text(function(d) { return d; })
      .attr('transform', function(d, i) {
        return "translate(" + [50, 100 - (bubbleScale(d) * 2) + 12] + ")";
      });
  }

  function drawCases() {
    caseBubbles = svg.selectAll('.g-case')
      .data(_.sortBy(_.values(cases), function(d){ return -d.cases[currentWeek].newCases; }))
    .enter()
      .append('circle')
      .each(function(d) {
        if (!d.centroid) console.error(d);
      })
      .attr('class', 'g-case')
      .attr('data-county', function(d){ return d.county; })
      .attr('data-newcases', function(d){ return d.cases[currentWeek].newCases; })
      .attr('cx', function(d) { return d.centroid[0]; })
      .attr('cy', function(d) { return d.centroid[1]; })
      .attr('r', function(d) {
        return bubbleScale(d.cases[currentWeek].newCases);
      });
    caseBubbles.on('mouseenter', showTooltip);
    caseBubbles.on('mouseleave', hideTooltip);
  }

  function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function updateWeek(week) {
    week = Math.min(week, numWeeks - 1);
    noCountyData = week < earliestGoodWeek;
    if (noCountyData && isMobile) return;

    currentWeek = week;
    var left = (week * chartBarW) + (chartBarW / 2) + 'px';
    theScrubber.css({left: left});
    countryScrubbers.css({left: left});

    var displayWeek = moment(cases.Conakry.cases[currentWeek].week).add(6, 'days').format('YYYY MM D');
    var nytMonths = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]
    displayWeek = nytMonths[Number(displayWeek.split(" ")[1] - 1)] + " " +  displayWeek.split(" ")[2] + ", " + displayWeek.split(" ")[0].substring(2)
    theWeek.html(displayWeek);

    theMap.toggleClass('no-data', noCountyData);

    caseBubbles
      .transition()
      .attr('data-newcases', function(d){ return d.cases[currentWeek].newCases; })
      .attr('r', function(d) {
        if (noCountyData) return 0;
        return bubbleScale(d.cases[currentWeek].newCases);
      });

    currentWeekTotal = 0;
    _.each(countriesLoc, function(c){
      currentWeekTotal += national[c.name].cases[currentWeek].newCases;
      $("#g-cases-" + c.slug).html(national[c.name].cases[currentWeek].newCases);
    });
    $("#g-m-case-no").html(addCommas(currentWeekTotal));
    $("#g-cases-total").html(addCommas(currentWeekTotal));
  }

  function drawCharts(selector, name) {
    var margin = {top: 30, right: 0, bottom:25, left: 0},
    width = $(".g-chart").width(),
    height = 100 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeBands([0, width], 0, 0);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var svg = d3.select("#g-chart-" + selector).append("svg")
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(0," + margin.top + ")");

    var data = national[name].cases;
    var maxData = national['Liberia'].cases;

    x.domain(data.map(function(d) { return d.week; }));
    y.domain([0, d3.max(maxData, function(d) { return d.newCases; })]);

    var fudge = x.range()[0];
    chartBarW = x.rangeBand();

    scrubberBar.css({width: chartBarW + 'px', 'margin-left': (-chartBarW / 2) + 'px'});
    window.data = data;
    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", function(d) {return name + " bar " + d.week; } )
        .attr("id", function(d) { return d.newCases; })
        .attr("x", function(d) { return x(d.week) - fudge; })
        .attr("width", chartBarW)
        .attr("y", function(d) { return y(d.newCases); })
        .attr("height", function(d) { return height - y(d.newCases); });

    var week = Math.min(currentWeek, numWeeks - 1);
    var left = (week * chartBarW) + (week * 1) + (chartBarW / 2) + chartBarW - 3;
    svg.append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", height)
      .attr("width", width - (width - left))
      .attr("height", "0.5")

    $("#g-chart-" + selector).prepend("<p class='g-chart-title'>" + name + "</p>");
    $("#g-chart-" + selector).append("<div class='g-country-scrub'><div class='g-scrub'><div class='g-country-scrubber'><p class='g-scrubber-cases' id='g-cases-" + selector + "'>0</p></div></div></div>");
    countryScrubbers = $(".g-country-scrubber");
  }

  var timer = null,
      interval = 500,
      value = 0;

  function animate() {
    $(".g-step").on("click", function(){
      step($(this).data("dir"));
    });
  }

  function step(direction) {
    if (direction === "back" && currentWeek > 0) {
      stepWeek = currentWeek - 1;
    } else if (direction === "forward" && currentWeek < numWeeks) {
      stepWeek = currentWeek + 1;
    }
    updateWeek(stepWeek);
  }

  PageManager.on('nyt:page-breakpoint', resized);

  function resized() {
    theMap.empty();
    $(".g-chart").empty();
    render();
  }

// }); // end require
// ;


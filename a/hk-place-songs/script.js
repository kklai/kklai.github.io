d3.select('body').selectAppend('div.tooltip')

d3.loadData("hkg.json", "names.csv", function(err, res){

    let data = res[0];

    let names = res[1];
    names = names.filter(d => d.latlng);

    names.forEach(function(d){
        let split = d.latlng.split(",");
        d.lat = +split[0];
        d.lng = +split[1];
    })

    let hkg = topojson.feature(data, data.objects["hkg-dissolved"]);

    let sel = d3.select(".g-map").html("");

    let width = sel.node().getBoundingClientRect().width;
    let height = width*0.7;

    let svg = sel.append("svg").attr("width", width).attr("height", height);

    var projection = d3.geoMercator().fitSize([width, height], hkg);

    var path = d3.geoPath().projection(projection);

    svg.append("g").appendMany("path", hkg.features)
        .attr("d", path)
        .style("fill", "#333");

    // <image href="mdn_logo_only_color.png" height="200" width="200" />

    svg.append("g")
        .appendMany("image.marker", names)
        .attr("href", "marker.png")
        .attr("width", 30)
        .attr("height", 30)
        .translate(function(d){
            let pos = projection([d.lng, d.lat]);
            return [pos[0]-15, pos[1]-15]
        })
        .call(d3.attachTooltip)
        .on('mouseover', function(d){
            d3.select(this).classed("g-highlight", true);
            d3.select('.tooltip').html(`<b>${d.lyric}</b><br>${d.name}<br>${d.artist}`) 
        })
        .on('mouseout', function(d){
            d3.select(this).classed("g-highlight", false);
        });

})

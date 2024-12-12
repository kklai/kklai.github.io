function isScrolledIntoView(el) {
    var rect = el.node().getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
}

let size = innerWidth > 1024 ? "desktop" : innerWidth > 600 ? "tablet" : "mobile";

function setup() {
    size = innerWidth > 1024 ? "desktop" : innerWidth > 600 ? "tablet" : "mobile";
    d3.selectAll(".overall-" + size + " .overall-img").classed("show", false);
    if (size == "desktop") {
        d3.selectAll(".overall-" + size + " .overall-img").each(function(d,i){
            let el = d3.select(this);
            setTimeout(function(){
                el.classed("show", true);
            }, i*100)
        })
    } else {
        d3.selectAll(".overall-" + size + " .overall-img").each(function(d,i){
            let el = d3.select(this);
            if (isScrolledIntoView(el)) {
                setTimeout(function(){
                    el.classed("show", true);
                }, i*100);
            }
        })
    }
}

setup()
window.addEventListener('resize', setup);

window.addEventListener('scroll', function(){

    if (size != "desktop") {

        if (window.scrollY == 0) {
            setup();
        }

        d3.selectAll(".overall-" + size + " .overall-img").each(function(d,i){
            let el = d3.select(this);
            if (isScrolledIntoView(el)) {
                el.classed("show", true);
            }
        })
    }
    
})
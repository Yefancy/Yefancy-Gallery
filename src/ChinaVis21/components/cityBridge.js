opt_cityBridge = {
    lineColor: '#2D3444',
    dur: 48,
    r: 8,
    svg: '#cityBridgeSvg'
}

$(document).ready(function () {
    let cityBridgeSvg = d3.select(opt_cityBridge.svg)
    let w = 1920

    let offsetX = w / 2 - (data_city_dots.length - 1) * opt_cityBridge.dur / 2
    let offsetY = 75

    let bars = cityBridgeSvg.selectAll()
        .data(data_clean.loc_comments)
        .join('g')

    let ip1 = d3.interpolateRgb('#ffffff', '#da5e8a')
    let openPin = null
    bars.each(function(d, i){
        d3.select(this).selectAll('circle')
            .data(d)
            .join('circle')
            .attr('cx', i * opt_cityBridge.dur + offsetX)
            .attr('cy', (d2, j)=> j * 20 + offsetY + 50)
            .attr('r', 0)
            .attr('fill', (d2, j)=>ip1(j / d.length))
            .attr('opacity', 1)
            .on('click', function(e,d){
                let cir = d3.select(this)
                if(cir.attr('opacity') !== 1) {
                    openPin = d
                    addCommentPin(parseFloat(cir.attr('cx')), parseFloat(cir.attr('cy')), d)
                }
            })
            .on('mouseleave', function(e,d){
                if (d === openPin){
                    removeCommentPin()
                    openPin = null
                }
            })
    })

    opt_cityBridge.showBarDots = function(y) {
        let city_x = new Set()
        bars.selectAll('circle')
            .each(function(d){
                let dom = d3.select(this)
                let cy = dom.attr('cy')
                if(y <= cy) {
                    if (parseFloat(dom.attr('r')) === 6) {
                        dom.transition().attr('r', 0)
                    }
                }
                else {
                    if (parseFloat(dom.attr('r')) === 0) {
                        dom.transition().attr('r', 6)
                        city_x.add(dom.attr('cx'))
                    }
                    // if (cy + 0 > y) {
                    //     city_x.add(dom.attr('cx'))
                    // }
                }
                if( cy - 10 < y || y < cy + 10){
                }
            })
        if (city_x.size > 0)
            return city_x
        return null
    }

    opt_cityBridge.hideBarDots = function(y) {

    }

})
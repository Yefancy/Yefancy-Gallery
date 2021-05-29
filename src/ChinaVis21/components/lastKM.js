let data_lastKM = [
    {name:'硚口区', data:[187, 62, 470, 59]},
    {name:'武昌区', data:[357, 84, 1046, 523]},
    {name:'东西湖区', data:[150, 94, 386, 257]},
    {name:'江岸区', data:[250, 146, 956, 510]},
    {name:'汉南区', data:[63, 11, 52, 0]},
    {name:'江汉区', data:[241, 131, 594, 416]},
    {name:'蔡甸区', data:[121, 81, 318, 159]},
    {name:'汉阳区', data:[127, 36, 374, 0]},
    {name:'江夏区', data:[205, 160, 420, 0]},
    {name:'黄陂区', data:[119, 60, 288, 57]},
    {name:'新洲区', data:[63, 21, 138, 69]},
    {name:'青山区', data:[124, 64, 196, 0]},
    {name:'洪山区', data:[365, 264, 1142, 605]},
]

let opt_lastKM = {

}
let stage_ll = 0
$(document).ready(function () {
    let sds = []
    let texts = []
    let marks = []
    let dis = 45
    let color1 = '#ade0de'
    let color2 = '#F08B99'
    let color3 = '#F7D2D4'


    function drawRow(cx, max, min, svg, isCircle, color) {
        let ud = []
        let limited = Math.ceil(max / 50)
        let now = Math.ceil(min / 50)
        for (let i = 0; i < limited; i++) {
            ud.push(i)
        }
        let sd = svg.selectAll().data(ud)
        let su = svg.selectAll().data(ud)
        if(isCircle) {
            sd = sd.join('circle').attr('r', 6).attr('cx', cx).attr('cy', d => d < now ? -dis - (now - d - 1) * 16 : +dis + (d - now) * 16)
            su = su.join('circle').attr('r', 6).attr('cx', cx).attr('cy', d => -dis - d * 16)
        } else {
            sd = sd.join('polygon').attr('points', d => d<now? `${cx},${-dis - (now - d - 1) * 16 - 6} ${cx + 6},${-dis - (now - d - 1) * 16} ${cx},${-dis - (now - d - 1) * 16 + 6} ${cx - 6},${-dis - (now - d - 1) * 16}`
                : `${cx},${dis + (d - now) * 16 - 6} ${cx + 6},${dis + (d - now) * 16} ${cx},${dis + (d - now) * 16 + 6} ${cx - 6},${dis + (d - now) * 16}`)
            su = su.join('polygon').attr('points', d =>`${cx},${-dis - d * 16 - 6} ${cx + 6},${-dis - d * 16} ${cx},${-dis - d * 16 + 6} ${cx - 6},${-dis - d * 16}`)
        }
        sds.push(sd.attr('fill', d=>d<now?color1:color).attr('transform', d=>(d<now) ? 'translate(0 0)':`translate(${1020-cx} ${180 - (dis + (d - now) * 16)})`).attr('opacity', d=>(d<now)?1:0))
        su.attr('stroke', color1).attr('stroke-width', 1).attr('fill-opacity', 0)
        let oy = - dis - limited * 16
        svg.append('line')
            .attr('stroke', 'white')
            .attr('x1', cx)
            .attr('x2', cx)
            .attr('y1', oy)
            .attr('y2', - 30 + oy)
        texts.push(svg.append('text')
            .attr('x', cx)
            .attr('y', oy - 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-family', 'Roboto')
            .attr('fill', 'white')
            .text(min))

        return [limited, now]
    }

    function drawChart() {
        let lastKMChart = d3.select('#lastKMChart')
        lastKMChart.selectAll()
            .data(data_lastKM)
            .join('g')
            .each(function (d, i){
                let cx = i * 70
                marks.push(drawRow(cx, d.data[0], d.data[1], lastKMChart, true, color2))
                marks.push(drawRow(cx + 24, d.data[2], d.data[3], lastKMChart, false, color3))
                lastKMChart.append('text')
                    .attr('x', cx + 12)
                    .attr('y', 0)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '14px')
                    .attr('font-family', 'Noto Sans SC')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', 'white')
                    .attr('transform', `rotate(-45 ${cx + 12},${0})`)
                    .text(d.name)
            })
    }

    let offset = 0
    function pushDot(){
        if(offset < 13) {
            offset += 1
            let index = (offset - 1) * 2
            let delay = 0
            let change = function (elm, index, d){
                let max = marks[index][0]
                let now = marks[index][1]
                if (d < now) {
                    elm.interrupt('a')
                    elm.transition('a').duration(500).delay(delay)
                        .attr('transform', `translate(0 ${-(max - now) * 16})`)
                } else {
                    elm.interrupt('b')
                    elm.transition('b').duration(500).delay(delay)
                        .attr('transform', `translate(0 ${-(max - now - 1) * 16 - 2 * dis})`)
                        .attr('fill', color1)
                }
                delay += 20
                texts[index].interrupt('c')
                texts[index].transition('c').duration(1000).tween('text', function (){
                    let node = this;
                    let max = data_lastKM[Math.floor(index / 2)].data[index % 2 * 2]
                    let now = data_lastKM[Math.floor(index / 2)].data[index % 2 * 2 + 1]
                    return function (t){
                        node.textContent = Math.floor(t * (max - now) + now)
                    }
                })
            }
            sds[index].each(function(d){
                change(d3.select(this), index, d)
            })
            sds[index+1].each(function(d){
                change(d3.select(this), index+1, d)
            })
            return true
        }
        return false
    }

    function pullDot(){
        if(offset > 0) {
            offset -= 1
            let index = offset * 2
            let delay = 20 * sds[index+1].size()
            let change = function (elm, index, d){
                let now = marks[index][1]
                if (d < now) {
                    elm.interrupt('a')
                    elm.transition('a').duration(500).delay(delay)
                        .attr('transform', `translate(0 0)`)
                } else {
                    elm.interrupt('b')
                    elm.transition('b').duration(500).delay(delay)
                        .attr('transform', `translate(0 0)`)
                        .attr('fill', index % 2 === 0? color2 : color3)
                }
                delay -= 20
                texts[index].interrupt('c')
                texts[index].transition('c').duration(1000).tween('text', function (){
                    let node = this;
                    let min = data_lastKM[Math.floor(index / 2)].data[index % 2 * 2 + 1]
                    let now = data_lastKM[Math.floor(index / 2)].data[index % 2 * 2]
                    return function (t){
                        node.textContent = Math.floor(t * (min - now) + now)
                    }
                })
            }
            sds[index].each(function(d){
                change(d3.select(this), index, d)
            })
            sds[index+1].each(function(d){
                change(d3.select(this), index+1, d)
            })
            return true
        }
        return false
    }

    drawChart()

    // registerWatcher($('#lastKMSvg').get(0), (e)=>{
    //     e = e[0]
    //     if (!e.isIntersecting) {
    //         window.removeEventListener('wheel', wheelListener)
    //     } else if (e.intersectionRatio === 1) {
    //         window.addEventListener('wheel', wheelListener);
    //     } else if (e.intersectionRatio < 1) {
    //         window.removeEventListener('wheel', wheelListener)
    //     }
    // }, [1])

    function stage_1(){
        console.log('stage_ll_1_enter')
        stage_ll = 1
        // disableScroll()
        let lastCar = d3.select('#lastCar').node().children
        let panel = d3.select(lastCar[0])
        let car = d3.select(lastCar[1])
        car.transition().duration(3000).ease(d3.easeCubicInOut)
            .attr('transform', 'translate(1010 0)')
            .on('end', ()=>{
                panel.transition().delay(500)
                    .attr('opacity', 1)
                    .on('end', ()=>{
                        sds.forEach(nodes=>{
                            nodes.each(function (d){
                                if(parseInt(this.getAttribute('opacity')) === 0) {
                                    d3.select(this)
                                        .attr('opacity', 1)
                                        .transition().duration(Math.random() * 2000 + 1000).delay(Math.random() * 1000)
                                        .attr('transform', 'translate(0 0)')
                                }
                            })
                        })
                        d3.select('#carText').transition().duration(2000).attr('opacity', 1)
                        panel.transition().delay(3000)
                            .attr('opacity', 0)
                        car.transition().duration(2000).delay(3500)
                            .attr('transform', 'translate(1920 0)')
                            .on('end', ()=>{
                                console.log('stage_ll_1_exit')
                                stage_2()
                            })
                    })
            })

    }
    opt_lastKM.stage1 = stage_1

    function stage_2(){
        console.log('stage_ll_2_enter')
        stage_ll = 2
    }

    function scrollHandler(event, isDown){
        if (stage_ll === 0 && isDown > 0) {
            stage_1()
        } else if(stage_ll === 2) {
            if(isDown){
                if(!pushDot()) {
                }
            } else {
                if(!pullDot()) {
                    scrollTo(2)
                }
            }
        }
    }

    let startPos
    $('#lastKMSvg').bind(wheelEvent, function(event){
        let e = event.originalEvent
        if(e.deltaY > 0){
            scrollHandler(event, true)
        } else if(e.deltaY < 0) {
            scrollHandler(event, false)
        }
    }).bind('touchstart', function(event){
        let touch = event.originalEvent.targetTouches[0]
        startPos = {x:touch.pageX, y:touch.pageY};
    }).bind('touchmove', function(event){
        let touch = event.originalEvent.targetTouches[0]
        let nowPos = {x:touch.pageX, y:touch.pageY};
        if(Math.abs(nowPos.y - startPos.y) > 50) {
            if(nowPos.y < startPos.y){
                scrollHandler(event, true)
            } else if(nowPos.y > startPos.y) {
                scrollHandler(event, false)
            }
            startPos = nowPos
        }
    })
})




let loadings = 0
function progressLoaded(name){
    loadings++;
    console.log(name);
    let svg = d3.select('#loading').select('#loadingC')
    let size = svg.selectAll('line').nodes().length
    svg.selectAll('circle')
        .each(function (d,i){
            d3.select(this)
                .attr('fill', i <= (loadings / 14 * 33) ? '#42bbbb' : null)
            if(i >= size && i<= (loadings / 14 * 33)){
                svg.append('line')
                    .attr('x1', (i - 16) * 18 + 960)
                    .attr('y1', 600)
                    .attr('x2', 960)
                    .attr('y2', 427.5)
                    .attr('stroke', '#42bbbb')
            }
        })
    svg.select('text').text(`Loading......${name}`)
}

function renderLoading(){
    let svg = d3.select('#loading').select('#loadingC')
    svg.selectAll()
        .data(new Array(33).fill(0))
        .join('circle')
        .attr('r', 4)
        .attr('stroke', '#42bbbb')
        .attr('stroke-width', 1)
        .attr('cy', 600)
        .attr('cx', (d,i) => (i - 16) * 18 + 960)
    svg.append('text')
        .text('Loading......')
        .attr('text-anchor', 'middle')
        .attr('x', 960)
        .attr('y', 650)
        .attr('fill', 'white')
        .attr('font-size', 20)

    let sakura = d3.select(d3.select('#loading').selectChildren('g').nodes()[1]);
    console.log(sakura);
    let degree = 0;
    let stop = false;

    (function animloop() {
        if(stop) return
        if(loadings === 14) {
            setTimeout(()=>{
                stop = true
                d3.select('#loading').remove()
                $('video').get(0).play()
                showGuideNP(true,null,()=>{
                    videoExit()
                    showCard(0, ()=>{
                        showGuideS(true, ()=>{
                            if (stage_dd === 0) {
                                d3.select('#mainVisBG').transition().duration(2000).delay(1000).attr('opacity', 0)
                                if (opt_mainVis.debug) {
                                    opt_mainVis.stage2()
                                } else {
                                    opt_mainVis.stage1()
                                }
                            }
                        }, 840, '滚/滑动 开启篇章')
                    })
                })
            },2000)
            loadings = 15
        }
        sakura.attr('transform',`translate(935, 400)rotate(${degree},27.5,27.5)`)
        degree += 2
        window.requestAnimationFrame(animloop);
    })()
}
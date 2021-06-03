$(document).ready(function () {
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
    progressLoaded('视频组件')
})

function videoExit(){
    let video = $('video').get(0)
    video.pause()
    videoDiv.animate({top: '-110%'},1500,()=>{
    })
}

function videoEnter(){
    let video = $('video').get(0)
    video.currentTime = 0
    videoDiv.animate({top: '0%'},1500,()=>{
        video.play()
    })
}
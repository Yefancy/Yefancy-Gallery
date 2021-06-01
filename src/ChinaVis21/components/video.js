$(document).ready(function () {
    showGuideNP(true,null,()=>{
        videoExit()
        showCard(0, ()=>{
            showGuideS(true, ()=>{}, 840, '滚/滑动 开启篇章')
        })
    })
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
$(document).ready(function () {
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
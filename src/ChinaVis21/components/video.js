$(document).ready(function () {
    let video = $('video')
    video.bind('ended', (e)=>{
        videoExit()
    })
})

function videoExit(){
    $('video').animate({top: '-110%'},1500,()=>{
    })
}

function videoEnter(){
    $('video').animate({top: '0%'},1500,()=>{
    })
}
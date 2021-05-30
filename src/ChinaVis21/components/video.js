$(document).ready(function () {
    let video = $('video').get(0)
    let button = $('#videoDiv button')
    video.onclick = ()=>{
        button.stop()
        if(button.css('display') === 'none') {
            button.fadeIn('slow', ()=>{
                setTimeout(()=>{
                    if(button.css('display') !== 'none') {
                        button.fadeOut('slow')
                    }
                }, 3000)
            })
        } else {
            button.fadeOut('slow')
        }
    }
    video.ontimeupdate = ()=> {
        if (video.duration - video.currentTime < 3 && button.css('display') === 'none') {
            button.fadeIn('slow', () => {
                setTimeout(() => {
                    if (button.css('display') !== 'none') {
                        button.fadeOut('slow')
                    }
                }, 4000)
            })
        }
    }
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

function videoMuted(){
    let video = $('video').get(0)
    video.muted = !video.muted
}
opt_sakura = {
    sakura_svg: [
        'M151.46,39S127,14.17,60.54,48.74s-43.26,73.71-43.26,73.71l14.28-6.06-2,11.36s28.15,9,48.1-12.43,14.87-45.9,33.77-55.4S140.16,56.18,151.46,39Z',
        "M55.09,141.64c-14-4.4-31.8-30.81-14.24-73.27S84.84,22.49,90.52,25s3.23,12.68,3.23,12.68,14.89-10.36,22.2-6.3,23,27.1,6.8,61.23S78.4,149,55.09,141.64Z",
        "M6.06,102.88s24.29,0,54.16-26.26S120,32.63,142,59.22c26.28,31.77-3.28,62-33.81,64.67S6.06,102.88,6.06,102.88Z",
        "M20.5,55.08c-4.1,7.25,1.66,31.86,32.27,59.58s57.51,20,62.48,12.29-.59-16,3.22-18.09,21.19,5.38,24.5-10.34-11.17-45.34-47.58-55C60.09,34.1,32.92,33.15,20.5,55.08Z",
        "M148.16,30.39c8.69,10.75-8.28,17-17,31s-9.93,31.85-9.11,44.27S95.2,130.1,78.65,128s-16.13,17-51.71,8.69S13.28,75.48,63.34,50.25,148.16,30.39,148.16,30.39Z",
        "M150.08,60.23c-2-10.67-100.85-27.31-128.16,2.17C-13,100.11,53.26,106.78,53.26,106.78s8.38,29.16,42.21,29.16S158.15,103.36,150.08,60.23Z",
        "M5.08,85.87s17.09-3.07,28.09,7.71c13.5,13.22,27.55,40.77,66.66,36.09s49.86-29.2,49.58-29.75-28.92-3.31-28.09-3.58l33.6-11.61S140.88,42.62,88,45.65,5.08,85.87,5.08,85.87Z",
        "M114.88,29.91S69.78,41.57,45.67,67.76,34,133.86,34,133.86,68.48,144,97.52,106.64,114.88,29.91,114.88,29.91Z",
        "M15.81,37.46s26.7,7.42,30.91,29.18,22,49.91,42.77,57.12c29.92,10.38,47-2.48,47-2.48L112.24,100l30.67,14.34S153,73.56,116.45,47.1,15.81,37.46,15.81,37.46Z",
        "M138,22.21s-6.27,14.17-28.34,17.66S63.2,48.69,41.13,74s-24.85,39.25-24.85,39.25S48.33,99.56,48.1,99.79L25.8,121.86s35.69,24.24,82.14-15.57C142.08,77,138,22.21,138,22.21Z",
        "M20.07,30.41S56.59,16,99.84,46.55s40,74.07,40,74.07S112.23,97,112.43,98.06s20,35.65,19,34.92-13.86-6.28-27.24-13.26-30.7-17.35-47.11-39.55S20.07,30.41,20.07,30.41Z",
        "M93.44,23.5S56.65,44.91,47.09,85s30.76,60.9,30.76,60.9l6.86-27,8.93,25.57s22.42-22,21.59-48-14.52-33.7-18.88-47.21A67.21,67.21,0,0,1,93.44,23.5Z"
    ],
    startColor: '#D84479',
    middleColor: '#F08B99',
    endColor: '#F7B3B4',
};

let stage_ss = 0
$(document).ready(function () {
    let height = 980
    let dur = 10
    let min_scroll = - 5 * dur
    let max_scroll = 710
    let scroll_sakura = min_scroll

    function scrollHandler(event, isDown){
        if(stage_ss === 1) {
            let tmp
            if(isDown) {
                tmp = scroll_sakura + dur
                console.log(tmp);
                if(tmp < max_scroll) {
                    if (tmp <= 0 || tmp > height) {
                        scroll_sakura += dur
                    } else if(opt_sakura.setFallY(tmp / height * 2)) {
                        scroll_sakura += dur
                        opt_cityBridge.showBarDots(scroll_sakura + 100)
                    }
                } else if (tmp === max_scroll){
                    stage_ss = 0
                    scrollTo(2, ()=>{
                        opt_sakura.stopAnima()
                    })
                }
            } else {
                tmp = scroll_sakura - dur
                if(tmp > min_scroll) {
                    if (tmp < 0 || tmp >= height) {
                        scroll_sakura -= dur
                    } else if(opt_sakura.setFallY(tmp / height * 2)) {
                        scroll_sakura -= dur
                        opt_cityBridge.showBarDots(scroll_sakura + 100)
                    }
                } else if(tmp === min_scroll) {
                    stage_ss = 0
                    opt_mainVis.stage2()
                    scrollTo(0,()=>{
                        opt_sakura.stopAnima()
                    })
                }
            }
        }
    }

    let startPos
    $('#sakuraWBDiv').bind(wheelEvent, function(event){
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


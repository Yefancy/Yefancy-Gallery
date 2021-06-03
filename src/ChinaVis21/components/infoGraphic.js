let opt_infoGraphic = {}
let stage_ig = -2
$(document).ready(function () {
    let infoGraphic = d3.select('#infoGraphic')
    let path = [4, 4.82, 5.5, 6.51]
    let progress = 0
    let maxS = 40
    let dur = (4900 - 1080) / 1080 / maxS

    function airAnima() {
        let air1 = infoGraphic.select('#air1');
        let air2 = infoGraphic.select('#air2');
        let air3 = infoGraphic.select('#air3');
        (function anima() {
            air1.transition().duration(1000)
                .attr('transform', 'translate(0 0)')
            air2.transition().duration(1000).delay(250)
                .attr('transform', 'translate(0 0)')
            air3.transition().duration(1000).delay(500)
                .attr('transform', 'translate(0 0)')
                .on('end', ()=>{
                    air1.transition().delay(1000).attr('opacity', 0)
                    air2.transition().delay(1000).attr('opacity', 0)
                    air3.transition().delay(1000).attr('opacity', 0)
                        .on('end', ()=>{
                            air1.attr('transform', 'translate(0 -250)').attr('opacity', 1)
                            air2.attr('transform', 'translate(0 -250)').attr('opacity', 1)
                            air3.attr('transform', 'translate(0 -250)').attr('opacity', 1)
                            if(stage_ig !== -1) {
                                anima()
                            }
                        })
                })
        })()
    }

    function ferryAnima(){
        let ferry = infoGraphic.select('#ferry');
        let s4 = infoGraphic.select('#supplies4');
        (function anima() {
            ferry.transition().duration(2500)
                .attr('transform', 'translate(0 200)')
            s4.transition().duration(2500)
                .attr('transform', 'translate(0 200)')
                .on('end', ()=>{
                    ferry.transition().duration(1000).delay(1000).attr('opacity', 0)
                    s4.transition().duration(1000).delay(1000).attr('opacity', 0)
                        .on('end', ()=>{
                            ferry.attr('transform', 'translate(0 -10)').transition().duration(1000).attr('opacity', 1)
                            s4.attr('transform', 'translate(0 -10)').transition().duration(1000).attr('opacity', 1)
                                .on('end',()=>{
                                    if(stage_ig !== -1) {
                                        anima()
                                    }
                                })
                        })
                })
        })()
    }

    function trainAnima(){
        let train = infoGraphic.select('#train');
        let s7 = infoGraphic.select('#supplies7');
        (function anima() {
            train.transition().duration(4000)
                .attr('transform', 'translate(0 295)')
            s7.transition().duration(4000)
                .attr('transform', 'translate(0 295)')
                .on('end', ()=>{
                    train.attr('opacity', 0).attr('transform', 'translate(0 -240)').transition().duration(1000).delay(1000).attr('opacity', 1)
                    s7.attr('opacity', 0).attr('transform', 'translate(0 -240)').transition().duration(1000).delay(1000).attr('opacity', 1)
                        .on('end', ()=>{
                            if(stage_ig !== -1) {
                                anima()
                            }
                        })
                })
        })()
    }

    function truckAnima(){
        let truck = infoGraphic.select('#truck2');
        (function anima() {
            truck.transition().duration(1500)
                .attr('transform', 'translate(0 240)')
                .on('end', ()=>{
                    truck.transition().duration(1000).delay(1000).attr('opacity', 0)
                        .on('end', ()=>{
                            truck.attr('transform', 'translate(0 -150)').transition().duration(1000).attr('opacity', 1)
                                .on('end',()=>{
                                    if(stage_ig !== -1) {
                                        anima()
                                    }
                                })
                        })
                })
        })()
    }

    function droneAnima(){
        let drone = infoGraphic.select('#drone');
        let drone2 = infoGraphic.select('#drone2');
        (function anima() {
            drone.transition().duration(1000).attr('transform', 'translate(0 0)')
                .on('end',()=>{
                    drone.transition().duration(2500).delay(500).attr('transform', 'translate(400 -550)')
                    drone2.transition().duration(2500).delay(500).attr('transform', 'translate(400 -550)')
                        .on('end', ()=>{
                            drone.transition().duration(1000).delay(300).attr('transform', 'translate(400 -490)')
                                .on('end', ()=>{
                                    drone.transition().duration(1000).delay(1000).attr('opacity', 0)
                                    drone2.transition().duration(1000).delay(1000).attr('opacity', 0)
                                        .on('end', ()=>{
                                            drone.attr('transform', 'translate(0 60)').transition().duration(1000).attr('opacity', 1)
                                            drone2.attr('transform', 'translate(0 0)').transition().duration(1000).attr('opacity', 1)
                                                .on('end', ()=>{
                                                    if(stage_ig !== -1) {
                                                        anima()
                                                    }
                                                })
                                        })
                                })
                        })
                })

        })()
    }

    function handleProgress(){
        if(progress === 0){ // first Time
            progress = -1
            airAnima() // 1000ms
            infoGraphic.select('#supplies1').transition().duration(500).delay(1200).attr('opacity', 1)
            infoGraphic.select('#supplies2').transition().duration(500).delay(1200).attr('opacity', 1)
                .on('end', ()=>{ // pin
                    infoGraphic.select('#medicalSuppli').transition().duration(500).delay(100).attr('opacity', 1)
                    infoGraphic.select('#livingSupplies').transition().duration(500).delay(200).attr('opacity', 1)
                    infoGraphic.select('#productionSupplies').transition().duration(500).delay(300).attr('opacity', 1)
                        .on('end',()=>{ // ferry
                            infoGraphic.select('#supplies2').transition().duration(500).delay(1000).attr('opacity', 0)
                            infoGraphic.select('#supplies4').transition().duration(500).delay(1500).attr('opacity', 1)
                                .on('end',()=>{ // ferry anima
                                    ferryAnima() // 1000ms
                                    infoGraphic.select('#supplies5').transition().duration(500).delay(1200).attr('opacity', 1)
                                    infoGraphic.select('#supplies6').transition().duration(500).delay(1200).attr('opacity', 1)
                                    infoGraphic.select('#text1').transition().duration(1000).delay(1000).attr('opacity', 1).attr('transform', 'translate(0 0)')
                                        .on('end', ()=>showGuideNP(true,()=>progress = 1,()=>{handleProgress()},true))

                                })
                        })
                })
        } else if (progress === 1) {
            progress = -1
            scrollTo(path[1], 1500, ()=>{
                infoGraphic.select('#supplies6').transition().duration(500).delay(500).attr('opacity', 0)
                    .on('end', ()=>{
                        infoGraphic.select('#truck1').transition().duration(1000).attr('transform', 'translate(360 0)')
                        infoGraphic.select('#supplies7').transition().duration(500).delay(1200).attr('opacity', 1)
                            .on('end', ()=>{
                                trainAnima() // 1000ms
                                infoGraphic.select('#text2').transition().duration(1000).delay(3000).attr('opacity', 1).attr('transform', 'translate(0 0)')
                                infoGraphic.select('#text3').transition().duration(1000).delay(3000).attr('opacity', 1).attr('transform', 'translate(0 0)')
                                    .on('end', ()=>showGuideNP(true,()=>progress = 2,()=>{handleProgress()},true))

                            })
                    })
            })
        } else if (progress === 2) {
            progress = -1
            scrollTo(path[2], 1500, ()=>{
                truckAnima()
                infoGraphic.select('#text4').transition().duration(1000).delay(1000).attr('opacity', 1).attr('transform', 'translate(0 0)')
                infoGraphic.select('#text5').transition().duration(1000).delay(1000).attr('opacity', 1).attr('transform', 'translate(0 0)')
                    .on('end', ()=>showGuideNP(true,()=>progress = 3,()=>{handleProgress()},true))
            })
        } else if (progress === 3) {
            progress = -1
            scrollTo(path[3], 1500, ()=>{
                droneAnima()
                infoGraphic.select('#text6').transition().duration(1000).delay(3000).attr('opacity', 1).attr('transform', 'translate(0 0)')
                    .on('end', ()=> {
                        progress = 4
                        stage_ig = Math.floor((path[3] - 4) / dur)
                    })
            })
        } else if (progress === 4) {
            airAnima()
            ferryAnima()
            trainAnima()
            truckAnima()
            droneAnima()
        }

        hideGuideNP()
    }

    opt_infoGraphic.handleProgress = handleProgress

    registerScroll('#infoGraphic', (event, isDown) => {
        if(progress === 4) {
            let tmp
            if(isDown) {
                tmp = stage_ig + 1
            } else {
                tmp = stage_ig - 1
            }
            if(tmp >= 0 && tmp <= maxS) {
                if(scrollTo(4 + tmp * dur, 100, false, 'linear')) {
                    stage_ig = tmp
                }
            } else if (tmp < 0) {
                showGuideS(false, (e)=>!e&&scrollTo(3))
            }
        } else if(progress !== -1) {
            handleProgress()
        }

    }, 20)
    progressLoaded('信息图组件')
})
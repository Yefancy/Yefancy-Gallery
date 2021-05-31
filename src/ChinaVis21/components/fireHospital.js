function Building(data) {
    this.data = data
    this.height = 0
}

function transformPos(x_25, y_25){
    let sx =  Math.sqrt(3) / 2
    let sy = 0.5
    return [x_25 * sx - y_25 * sx, x_25 * sy + y_25 * sy]
}

Building.prototype.getTopD = function () {
    let d = ''
    let path = this.data.top
    for (let i = 0; i < this.data.top.length; i+=2) {
        let np = transformPos(path[i], path[i + 1])
        d += `${np[0]},${np[1] - this.height} `
    }
    return d
}

Building.prototype.getFaceD = function (){
    let ds = []
    let path = this.data.face
    for (let i = this.data.face.length - 1; i >= 0; i-=4) {
        let point1 = transformPos(path[i - 1], path[i])
        let point2 = transformPos(path[i - 3], path[i - 2])
        ds.push(`${point1[0]},${point1[1] - this.height} ${point2[0]},${point2[1] - this.height} ${point2[0]},${point2[1]} ${point1[0]},${point1[1]}`)
    }
    return ds
}

opt_fire = {
    sakuraAmount: 500,
    defaultSpeed: 4,
    variantSpeed: 6,
    buildingColor_bottom: '#1A1B1E',
    buildingColor_left: '#F08B99',
    buildingColor_right: '#3DB6C7',
    linesColor: [
        '#5FD3D3',
        '#299DA5',
        '#5FD3D3',
        '#9AE8E8',
        '#C4F2F1',
        '#F7D2D4',
        '#F7B3B4',
        '#F08B99',
        '#DA5E8A'
    ],
    buildingMap: [4, 1, 6, 0, 5, 2, 3, 7],
    lineSize: [8, 8, 8, 8, 8, 5, 5, 4],
    minHeight: 0,
    debug: !IsPC(),
}

stage_ff = 0
let buildings = []
let typeLines = []
let typeGon = []
let typeDots = []
let icons = []
let selected_building = null
let selected_vec

function clickBuilding(i){
    if(selected_building == i || i == null) {
        selected_building = null
        d3.select('#modelFrame text').text('')
        d3.select('#darkGroup').transition().duration(1000).attr('opacity', 1)
        d3.select(`#gq${i}`).transition().duration(1000).attr('opacity', 0).attr('transform', `translate(0 20)`)
        for (let j = 0; j < typeLines.length; j++) {
            typeLines[j].forEach(line=>{
                line.selector.transition().duration(1000).attr('opacity', 1)
            })
        }
        typeGon[0].forEach(line=>{
            line.selector.transition().duration(1000).attr('opacity', 1)
        })
        typeDots.forEach(dot=>{
            dot.transition().duration(1000).attr('opacity', 1)
        })
    } else {
        if(selected_building == null) {
            d3.select('#darkGroup').transition().duration(1000).attr('opacity', 0.1)
        }
        d3.select('#modelFrame text').text(data_hospital[opt_fire.buildingMap[i]].type)
        let gq = d3.select(`#gq${i}`);
        gq.transition().duration(1000).attr('opacity', 1).attr('transform', `translate(0 0)`)
        let children = gq.node().children
        if(children.length > 1) {
            let f = function(index){
                d3.select(children[index]).transition().delay(4000)
                    .attr('opacity', 0)
                    .on('end', ()=>{
                        if(i == selected_building) {
                            let next = (index + 1) % children.length
                            d3.select(children[next]).transition()
                                .attr('opacity', 1)
                                .on('end', f(next))
                        } else {
                            d3.select(children[0]).transition().attr('opacity', 1)
                        }
                    })
            }; f(0)
        }
        if(selected_building != null) {
            d3.select(`#gq${selected_building}`).transition().duration(1000).attr('opacity', 0).attr('transform', `translate(0 20)`)
        }
        for (let j = 0; j < typeLines.length; j++) {
            typeLines[j].forEach(line=>{
                line.selector.transition().duration(1000).attr('opacity', j==opt_fire.buildingMap[i]?0.7:0.1)
            })
        }
        typeGon[0].forEach(line=>{
            line.selector.transition().duration(1000).attr('opacity', 0.1)
        })
        for (let j = 0; j < typeDots.length; j++) {
            typeDots[j].transition().duration(1000).attr('opacity', j==opt_fire.buildingMap[i]?0.7:0.1)
        }
        selected_building = i
        selected_vec = -2
    }
    opt_hospitalRenderer.selectBuilding(selected_building)
}

$(document).ready(function () {
    let fireSvg = d3.select('#fireSvg')
    let frame = d3.select('#modelFrame')

    fireSvg.on('click', ()=>clickBuilding(selected_building))

    for (let i = 1; i <= 15; i++) {
        icons.push(fireSvg.select(`#icon${i}`).attr('opacity', 0))
    }

    let oy = 22
    let ox = 11 * Math.sqrt(3)
    function mapPos(j, i) {
        let x1 = data_hospital_line[j * 2],y1 = data_hospital_line[j * 2 + 1],x2 = data_hospital_line[j * 2 + 2],y2 = data_hospital_line[j * 2 + 3]
        switch (j) {
            case 0: x1 = x1; y1 += i * oy; x2 -= i * ox; y2 += i * oy / 2;  break;
            case 1: x1 -= i * ox; y1 += i * oy / 2; x2 -= i * ox; y2 -= i * oy / 2; break;
            case 2: x1 -= i * ox; y1 -= i * oy / 2; x2 = x2; y2 -= i * oy; break;
            case 3: x1 = x1; y1 -= i * oy; x2 = x2; y2 -= i * oy; break;
            case 4: x1 = x1; y1 -= i * oy; x2 = x2; y2 -= i * oy; break;
            case 5: x1 = x1; y1 -= i * oy; x2 += i * ox; y2 -= i * oy / 2; break;
            case 6: x1 += i * ox; y1 -= i * oy / 2; x2 += i * ox; y2 += i * oy / 2; break;
            case 7: x1 += i * ox; y1 += i * oy / 2; x2 += i * ox; y2 += i * oy / 2; break;
        }
        return [x1, y1, x2, y2]
    }

    // addlines
    // let ggg = fireSvg.append('g')
    for (let i = -1; i < 8; i++) {
        let g = fireSvg.select('#typeLine').append('g')
        let lines = []
        let start
        let length
        if (i >= 0) {
            typeLines.push(lines)
            start = 8 - opt_fire.lineSize[i]
            length = start + opt_fire.lineSize[i]
            // let gggg = ggg.append('g')
            //     .attr('id', `type${i}`)
            //     .attr('opacity', 1)
            // gggg.append('line')
            //     .attr('x1', 0)
            //     .attr('x2', 70)
            //     .attr('y1', i * oy)
            //     .attr('y2', i * oy)
            //     .attr('stroke', opt_fire.linesColor[i + 1])
            // gggg.append('circle')
            //     .attr('cx', 70)
            //     .attr('cy', i * oy)
            //     .attr('r', 5)
            //     .attr('fill', opt_fire.linesColor[i + 1])
            // gggg.append('text')
            //     // .attr('text-anchor', 'end')
            //     .attr('dominant-baseline', 'middle')
            //     .attr('x', 90)
            //     .attr('y', i * oy + 0.5)
            //     .attr('fill', 'white')
            //     .text(data_hospital[i].type)
        } else {
            typeGon.push(lines)
            start = 0
            length = 8
        }
        for (let j = start; j < length; j++) {
            let pos = mapPos(j, i)
            if (i == -1) {
                let pos2 = mapPos(j, i-1)

                let tmp = g.append('linearGradient')
                    .attr('id', `gon${j}`)
                    .attr('x1', (pos[0] + pos2[0]) / 2)
                    .attr('x2', (pos[2] + pos2[2]) / 2)
                    .attr('y1', (pos[1] + pos2[1]) / 2)
                    .attr('y2', (pos[3] + pos2[3]) / 2)
                    .attr('gradientUnits', 'userSpaceOnUse')
                tmp.append('stop')
                    .attr('offset', '0')
                    .attr('stop-color', opt_fire.linesColor[0])
                tmp.append('stop')
                    .attr('offset', '1')
                    .attr('stop-color', opt_fire.linesColor[0])
                    .attr('stop-opacity', 0)

                lines.push({
                    pos: [pos, pos2],
                    posNow: [[pos[0],pos[1]],[pos2[0],pos2[1]]],
                    selector: g.append('polygon')
                        .attr('fill', `url(#gon${j})`)
                        .attr('opaciity', 1)
                        .attr('points', `${pos[0]},${pos[1]} ${pos[0]},${pos[1]} ${pos2[0]},${pos2[1]} ${pos2[0]},${pos2[1]}`)
                })
            } else {
                if(j == start) {
                    typeDots.push(g.append('circle')
                        .attr('cx', pos[0])
                        .attr('cy', pos[1])
                        .attr('r', 3)
                        .attr('opacity', 0)
                        .attr('fill', opt_fire.linesColor[i + 1]))
                }
                lines.push({
                    pos: pos,
                    posNow: [pos[0],pos[1]],
                    selector: g.append('line')
                        .attr('x1', pos[0])
                        .attr('y1', pos[1])
                        .attr('x2', pos[0])
                        .attr('y2', pos[1])
                        .attr('opacity', 1)
                        .attr('stroke', opt_fire.linesColor[i + 1])
                })
            }
        }
    }

    // add defs
    let buildingGroup = fireSvg.select('#building').append('g')

    let ip1 = d3.interpolateRgb(opt_fire.buildingColor_bottom, opt_fire.buildingColor_left)
    let ip2 = d3.interpolateRgb(opt_fire.buildingColor_bottom, opt_fire.buildingColor_right)

    let def = buildingGroup.append('defs')
    for (let i = 0; i < 200; i++) {
        let tmp = def.append('linearGradient')
            .attr('id', `l${i}`)
            .attr('x1', '-350')
            .attr('x2', '100')
            .attr('y1', '50%')
            .attr('y2', '50%')
            .attr('gradientUnits', 'userSpaceOnUse')
        tmp.append('stop')
            .attr('offset', '0')
            .attr('stop-color', ip1(i / 200))
        tmp.append('stop')
            .attr('offset', '1')
            .attr('stop-color', ip2(i / 200))
    }

    /////////////
    function Particle(){
    }

    Particle.prototype.update = function(){
        let dx = this.destX - this.x
        let dy = this.destY - this.y
        let dist = Math.sqrt(dx * dx + dy * dy)
        let speed = this.speed
        if (dist <= 5) {
            return true
        } else if (dist < 200) {
            speed = (dist / 200) * this.speed
            speed = Math.max(speed, 0.05)
        }
        if(this.opacity != 1) {
            this.opacity += 0.005
        }
        this.x += speed * this.vector.x;
        this.y += speed * this.vector.y;
        return false
    }

    Particle.prototype.reset = function(x, y, destX, destY, speed, scale){
        this.opacity = 0
        this.scale = scale
        this.x =  x;
        this.y = y;
        this.destX = destX
        this.destY = destY
        let dx = destX - this.x
        let dy = destY - this.y
        let directionAngle = Math.PI / 2 - Math.atan2(dx, dy)
        this.speed = speed;
        this.vector = {
            x: Math.cos(directionAngle),
            y: Math.sin(directionAngle)
        }
    }
    ////////////////

    function stage_1(){
        console.log('stage_ff_1_enter')
        stage_ff = 1
        let particles = []
        let sakura_petal

        function enterStage2(){
            //add frame
            frame.transition().duration(1000)
                .attr('opacity', 1)

            //add building
            let base = buildingGroup.append('g').attr('opacity', 0)
            data_hospital.forEach(data=>{
                let building = new Building(data)
                building.height = 0

                base.append('polygon')
                    .attr('points', building.getTopD())
                    .attr('fill', `url(#l${199})`)
                    .attr('opacity', 0.3)
                    .on('click', (e)=>{
                        e.cancelBubble = true
                        clickBuilding(data.name - 1)
                    })

                let g2 = buildingGroup.append('g')
                buildings.push({height:0, structure:[]})
                let bb = buildings[buildings.length - 1].structure
                for (let i = 0; i < 200; i++) {
                    building.height += 1 / 2
                    bb.push(g2.append('polygon')
                        .attr('points', building.getTopD())
                        .attr('fill', 'none')
                        .attr('visibility', 'hidden')
                        .attr('stroke', `url(#l${i})`)
                        .on('click', (e)=>{
                            e.cancelBubble = true
                            clickBuilding(data.name - 1)
                        }))

                    if(i < opt_fire.minHeight) {
                        bb[bb.length - 1].transition().duration(2000).delay(2000)
                            .attr('visibility', 'visible')
                    }
                }
            })

            base.transition().duration(2000)
                .attr('opacity', 1)
                .on('end', ()=>{
                    stage_2()
                })
            sakura_petal&&sakura_petal.transition().duration(1000)
                .attr('opacity', 0)
                .on('end', function(){
                    d3.select(this).remove()
                })
            d3.select('#fireIllustration').transition().duration(1000)
                .attr('opacity', 1)
            typeDots.forEach(dot=>{
                dot.transition().duration(1000)
                    .attr('opacity', 1)
            })
            sakura_petal = null
            console.log('stage_ff_1_exit')
        }

        if(opt_fire.debug) {
            enterStage2()
            return
        }

        for (let i = 0; i < opt_fire.sakuraAmount; i++) {
            let ran = Math.random() * data_clean.hospital_sum
            for (let j = 0; j < data_clean.hospital_area.length; j++) {
                if(data_clean.hospital_area[j].sum >= ran) {
                    let area = data_clean.hospital_area[j].area
                    let pos = transformPos(Math.random()*(area[2] - area[0]) + area[0], Math.random()*(area[3] - area[1]) + area[1])
                    particles.push(new Particle())
                    particles[i].reset(pos[0] -100 + Math.random() * 200, pos[1] - 400 - Math.random() * 200, pos[0], pos[1], opt_fire.defaultSpeed + opt_fire.variantSpeed*Math.random(), Math.random() * 0.03 + 0.06)
                    break
                }
            }
        }

        ip1 = d3.interpolateRgb(opt_sakura.startColor, opt_sakura.middleColor)
        ip2 = d3.interpolateRgb(opt_sakura.middleColor, opt_sakura.endColor)

        sakura_petal = fireSvg.select('#building').selectAll()
            .data(particles)
            .join('path')
            .attr('d', d=>opt_sakura.sakura_svg[Math.floor(Math.random()*12)])
            .attr('opacity', 0)
            .attr('fill', d=>Math.random() > 0.5 ? ip2(Math.random()) : ip1(Math.random()))
            .attr('transform', d => {
                return `translate(${d.x},${d.y})scale(${d.scale}, ${d.scale})`
            });

        function animloop() {
            let out = 0
            sakura_petal
                .attr('transform', d=>{
                    out += d.update()? 1 : 0
                    return `translate(${d.x},${d.y})scale(${d.scale}, ${d.scale})`
                })
                .attr('opacity', d=>d.opacity)
            if (out === particles.length) {
                enterStage2()
                return
            }
            window.requestAnimationFrame(animloop);
        }
        animloop()
    }
    opt_fire.stage1 = stage_1

    let progress = 0
    let stage_now = 0
    let firstOut = true

    function checkIcons(s, e, is, np) {
        if (np >= e && progress <= s) {
            is.forEach(i=>{
                icons[i].transition().duration(1500).attr('opacity', 1)
            })
            return true
        } else if (np <= e && progress >= s) {
            is.forEach(i=>{
                icons[i].transition().duration(1500).attr('opacity', 0)
            })
            return true
        }
        return false
    }

    function calculatePos(pos, posNow, index, index_now, stage_now_tmp, stage, per){
        let dx = (pos[2] - pos[0])
        let dy = (pos[3] - pos[1])
        if (index > index_now) {
            posNow[0] += dx / 20 * (index - index_now)
            posNow[1] += dy / 20 * (index - index_now)
        } else if(index < index_now) {
            posNow[0] -= dx / 20 * (index_now - index)
            posNow[1] -= dy / 20 * (index_now - index)
        } else {
            let oo = dy * per + pos[1]
            if (oo == posNow[1]){
                return false
            } else if (dy > 0 && posNow[1] < oo || dy < 0 && posNow[1] > oo){
                posNow[0] += dx / 20
                posNow[1] += dy / 20
                if (dy > 0 && posNow[1] > oo || dy < 0 && posNow[1] < oo) {
                    posNow[0] = dx * per + pos[0]
                    posNow[1] = dy * per + pos[1]
                }
            } else if (dy < 0 && posNow[1] < oo || dy > 0 && posNow[1] > oo){
                posNow[0] -= dx / 20
                posNow[1] -= dy / 20
                if (dy > 0 && posNow[1] < oo || dy < 0 && posNow[1] > oo) {
                    posNow[0] = dx * per + pos[0]
                    posNow[1] = dy * per + pos[1]
                }
            }
        }
        if(dy > 0) {
            if (posNow[1] < pos[1]) {
                posNow[0] = pos[0];
                posNow[1] = pos[1];
                if(stage_now > 0 && stage_now_tmp == stage_now) stage_now -= 1;
            } else if(posNow[1] > pos[3]) {
                posNow[0] = pos[2];
                posNow[1] = pos[3];
                if(stage_now < 7 && stage_now_tmp == stage_now) stage_now += 1;
            }
        } else {
            if (posNow[1] > pos[1]) {
                posNow[0] = pos[0];
                posNow[1] = pos[1];
                if(stage_now > 0 && stage_now_tmp == stage_now) stage_now -= 1;
            } else if(posNow[1] < pos[3]) {
                posNow[0] = pos[2];
                posNow[1] = pos[3];
                if(stage_now < 7 && stage_now_tmp == stage_now) stage_now += 1;
            }
        }
        return true
    }

    function stage_2() {
        console.log('stage_ff_2_enter')
        stage_ff = 2
        opt_hospitalRenderer.startAnima()

        function animaloop(){
            if(stage_ff == 2){
                let stage = Math.floor(progress / 8)
                let per = progress % 8 / 7

                // render lines
                let stage_now_tmp = stage_now
                for (let i = -1; i < typeLines.length; i++) {
                    let start = i == -1 ? 0 : (8 - opt_fire.lineSize[i])
                    // render building
                    if (i != -1) {
                        let height = Math.max(opt_fire.minHeight + Math.floor(((progress) - (start * 8)) / (64 - (start * 8)) * 170), opt_fire.minHeight)
                        let building = buildings[i]
                        if (i == selected_building) {
                            let modify_height = building.height + selected_vec
                            if(modify_height < 0) {
                                modify_height = 0
                                selected_vec *= -1
                            } else if(modify_height > height) {
                                modify_height = height
                                selected_vec *= -1
                            }
                            height = modify_height
                        }
                        if(height > building.height) {
                            for (let j = building.height; j < height; j++) {
                                building.structure[j].attr('visibility', 'visible')
                            }
                        } else if (height < building.height) {
                            for (let j = height; j < building.height; j++) {
                                building.structure[j].attr('visibility', 'hidden')
                            }
                        }
                        building.height = height
                    }

                    let index = stage - start
                    let index_now = stage_now_tmp - start
                    if(index_now >= 0) {
                        let pos = i == -1 ? typeGon[0][index_now].pos : typeLines[i][index_now].pos
                        let posNow = i == -1 ? typeGon[0][index_now].posNow : typeLines[i][index_now].posNow
                        if (i == -1) {
                            if(calculatePos(pos[0], posNow[0], index, index_now, stage_now_tmp, stage, per) && calculatePos(pos[1], posNow[1], index, index_now, stage_now_tmp, stage, per)) {
                                typeGon[0][index_now].selector
                                    .attr('points', `${pos[0][0]},${pos[0][1]} ${posNow[0][0]},${posNow[0][1]} ${posNow[1][0]},${posNow[1][1]} ${pos[1][0]},${pos[1][1]}`)
                            }
                        } else {
                            if(calculatePos(pos, posNow, index, index_now, stage_now_tmp, stage, per)) {
                                typeLines[i][index_now].selector
                                    .attr('x2', posNow[0])
                                    .attr('y2', posNow[1])
                            }
                        }

                    }
                }
                window.requestAnimationFrame(animaloop)
            }
        }
        animaloop()
    }
    opt_fire.stage2 = stage_2

    function stage_3(isDown) {
        stage_ff = 100
        if(isDown) {
            scrollTo(3)
        } else {
            scrollTo(1)
        }
    }

    let nextPage = 0
    registerScroll('#fireSvg', (event, isDown) => {
        if(stage_ff == 0 && isDown) {
            stage_1()
        } else if(stage_ff == 2) {
            let np = progress + (isDown ? 1 : -1)
            if(np >= 0 && np <= 63) {
                if(checkIcons(3,4,[0,1,2,3,12], np)){}
                else if(checkIcons(7,8,[4], np)){}
                else if(checkIcons(15,16,[5], np)){}
                else if(checkIcons(23,24,[6], np)){}
                else if(checkIcons(27,28,[13], np)){}
                else if(checkIcons(31,32,[7], np)){}
                else if(checkIcons(35,36,[14], np)){}
                else if(checkIcons(39,40,[8], np)){}
                else if(checkIcons(47,48,[9], np)){}
                else if(checkIcons(55,56,[10], np)){}
                else if(checkIcons(62,63,[11], np)){}
                progress = np
            } else if(isDown && np > 63) {
                console.log('stage_ff_2_exit')
                let fireCar = d3.select('#fireCar')
                if(firstOut && parseFloat(fireCar.attr('opacity')) == 0) {
                    fireCar.transition().duration(2000)
                        .attr('opacity', 1)
                        .on('end', ()=>{
                            d3.select(fireCar.node().children[1]).transition().duration(3000)
                                .attr('transform', 'translate(540 250)')
                                .on('end',()=>{firstOut = false})
                        })
                } else if(!firstOut) {
                    if(nextPage === 0) {
                        nextPage = 1;showGuideNP(true,null,()=>{stage_3(isDown); nextPage = 0;})
                    } else if(nextPage === 2) {
                        nextPage = 0;hideGuideNP();stage_3(isDown)

                    }
                    return
                }
            } else if(!isDown && np < 0) {
                if(nextPage === 0) {
                    nextPage = 1;showGuideNP(false,null,()=>{stage_3(isDown); nextPage = 0;})
                } else if(nextPage === 2) {
                    nextPage = 0;hideGuideNP();stage_3(isDown)

                }
                return
            }
        } else if(stage_ff == 3) {
            stage_2()
        }
        if(nextPage !== 0) {
            nextPage = 0
            hideGuideNP()
        }
    }, 20)
})
function addCommentPin(x, y, comment) {
    showPin(x, y,2, {0:comment.name, 1:comment.time, 2:comment.location, 3:comment.comment})
}

function removeCommentPin() {
    hidePin(2)
}

function showPin(x, y, index, content, func) {
    let pin = $(`#flowPin_${index}`)
    let action = ()=>{
        pin.css('opacity', 0).css('display', '').css('transform', `translate(${x}px, ${y}px)`)
        if(content != null){
            Object.keys(content).forEach(key=>{
                $(`#flowPin_${index}_${key}`).text(content[key])
            })
        }
        if(func) {
            func(pin)
        }
        pin.animate({opacity: 1})
    }
    if (pin.css('opacity') === 1 || pin.css('opacity') === '1') {
        pin.animate({opacity: 0}, null, ()=>{
            action()
        })
    } else {
        action()
    }
}

let leaving = false
function hidePin(index, func) {
    if(leaving) return false
    let pin = $(`#flowPin_${index}`)
    if(func) {
        func(pin)
    }
    if (pin.css('opacity') === 1 || pin.css('opacity') === '1' && !leaving) {
        leaving = true
        pin.animate({opacity: 0}, null, ()=>{
            pin.css('display', 'none')
            leaving = false
        })
        return true
    }
    return false
}

let guide_focus
function showGuideNP(isDown, showCallback, clickCallback, isBlue) {
    if(guide_focus != null) {
        hideGuideNP()
    }
    if(isBlue) {
        guide_focus = d3.select('#guide_blue')
    } else {
        guide_focus = d3.select('#guide_white')
    }
    let rotate = `rotate(${isDown ? 0 : 180}deg)`
    guide_focus.style('transform', rotate)
        .style('top', `${isDown ? 980:52}px`)
        .style('display', null)
        .transition().duration(1000)
        .attr('opacity', 1)
        .on('end', ()=>{
            showCallback&&showCallback();
            let guide = guide_focus;
            (function anima(){
                if(guide === guide_focus) {
                    guide.transition().duration(1000).ease(d3.easeCubicIn)
                        .style('transform', `translate(0px, ${isDown? 20:-20}px)${rotate}`)
                        .on('end', ()=>{
                            guide.transition().duration(1000).ease(d3.easeCubicOut)
                                .style('transform', `translate(0px, 0px)${rotate}`)
                                .on('end', ()=>anima())
                        })
                }
            })()
        })
    guide_focus.on('click', ()=>{
        clickCallback&&clickCallback()
        hideGuideNP()
    })
}

function hideGuideNP() {
    if(guide_focus != null) {
        let guide = guide_focus
        guide_focus = null
        console.log('eeeee')
        guide.on('click', null)
        guide.transition().duration(1000)
            .attr('opacity', 0)
            .on('end', ()=>{
                guide.style('display', 'none')
            })
    }
}

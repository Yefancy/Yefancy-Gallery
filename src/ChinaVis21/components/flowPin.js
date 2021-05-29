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


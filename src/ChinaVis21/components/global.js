provincesMap = {"北京市": 6, "京": 6, "北京": 6, "天津市": 25, "津": 25, "天津": 25, "河北省": 11, "冀": 11, "石家庄": 11, "山西省": 10, "晋": 10, "太原": 10, "内蒙古自治区": 28, "内蒙": 28, "呼和浩特": 28, "辽宁省": 30, "辽": 30, "沈阳": 30, "吉林省": 1, "吉": 1, "长春": 1, "黑龙江省": 31, "黑": 31, "哈尔滨": 31, "上海市": 20, "沪": 20, "上海": 20, "江苏省": 14, "苏": 14, "南京": 14, "浙江省": 19, "浙": 19, "杭州": 19, "安徽省": 15, "皖": 15, "合肥": 15, "福建省": 22, "闽": 22, "福州": 22, "江西省": 17, "赣": 17, "南昌": 17, "山东省": 12, "鲁": 12, "济南": 12, "河南省": 18, "豫": 18, "郑州": 18, "湖北省": -1, "鄂": -1, "武汉": -1, "湖南省": 16, "湘": 16, "长沙": 16, "广东省": 9, "粤": 9, "广州": 9, "广西壮族自治区": 27, "桂": 27, "南宁": 27, "海南省": 3, "琼": 3, "海口": 3, "四川省": 26, "川": 26, "成都": 26, "贵州省": 24, "贵": 24, "贵阳": 24, "云南省": 29, "云": 29, "昆明": 29, "重庆市": 21, "渝": 21, "重庆": 21, "西藏自治区": 32, "藏": 32, "拉萨": 32, "陕西省": 13, "陕": 13, "西安": 13, "甘肃省": 5, "甘": 5, "兰州": 5, "青海省": 2, "青": 2, "西宁": 2, "宁夏回族自治区": 4, "宁": 4, "银川": 4, "新疆维吾尔自治区": 0, "新": 0, "乌鲁木齐": 0, "香港特别行政区": 8, "港": 8, "香港": 8, "澳门特别行政区": 7, "澳": 7, "澳门": 7, "台湾省": 23, "台": 23, "台北": 23}
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
    return this
};

//data clean

data_clean={
    loc_comments: [],
    weibo_date: Object.keys(data_weibo).sort(),
    hospital_area: [],
    hospital_sum: 0
}

for (let i = 0; i < 34; i++) {
    data_clean.loc_comments.push([])
}

data_comments.forEach(comment=>{
    let index = provincesMap[comment.location]
    if (index !== -1) {
        data_clean.loc_comments[index].push(comment)
    }
})

data_hospital_area.forEach(area=>{
    data_clean.hospital_sum += (area[2] - area[0]) * (area[3] - area[1])
    data_clean.hospital_area.push({sum:data_clean.hospital_sum, area:area})
})

var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';


let Page = 0
let widthDiv
let maskDiv
let flowPin
let videoDiv
let pageHeight = window.innerHeight

$(document).ready(function () {
    widthDiv = $('#widthDiv');
    maskDiv = $('#maskDiv');
    flowPin = $('#flowPin');
    videoDiv = $('#videoDiv');
    $('#maskDiv').bind({
        click: ()=>lockOrientation('landscape'),
        touchstart: ()=>lockOrientation('landscape')
    });
    function resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (width / height > 1920 / 1080) {
            widthDiv.css('width', `${192000 / (1080 * width / height)}%`)
            pageHeight = height
        } else {
            // widthDiv.css('width', `${192000 / (1080 * width / height)}%`)
            pageHeight = width * 1080 / 1920
            widthDiv.css('width', '100%')
        }
        widthDiv.css('top', `${-pageHeight * Page}px`)
        maskDiv.css('top', `${pageHeight}px`)
        let per = pageHeight / 1080
        flowPin.css('transform', `translate(${(width - per * 1920) / 2}px, 0px)scale(${per})`)
        videoDiv.css('height', `${pageHeight}px`)
    }
    window.addEventListener("resize", resize)
    resize()
    // video.get(0).muted = false
})

function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

let inTrans = false
function scrollTo(page, speed, callback, ease){
    if(inTrans) return false;
    if(page !== Page) {
        inTrans = true
        let offset = `${-pageHeight * page}px`
        if(speed) {
            if(ease) {
                widthDiv.animate({top: offset}, speed, ease,()=>{
                    callback&&callback()
                    inTrans = false
                })
            } else {
                widthDiv.animate({top: offset}, speed,()=>{
                    callback&&callback()
                    inTrans = false

                })
            }
            Page = page
            return
        }
        let callbackTo
        let callbackFrom
        if (page == 0){
            opt_mainVis.stage2()
        } else if (page == 1){
            d3.select('#cityBridgeSvg').transition().duration(1000)
                .attr('transform', 'translate(0 1060)');
            opt_sakura.startAnima()
            callbackTo = () => {
                stage_ss = 1
            }
        } else if (page == 2){
            callbackTo = ()=>{
                if(stage_ff === 0) {
                    opt_fire.stage1()
                } else if(stage_ff === 3) {
                    opt_fire.stage2()
                }
            }
        } else if (page == 3){
            callbackTo = ()=>{
                if(stage_ll == 0){
                    opt_lastKM.stage1()
                }
            }
        } else if (page == 4){
            callbackTo = ()=>{
                stage_ig = 0
                opt_infoGraphic.handleProgress()
            }
        }
        if (Page == 0){
            opt_mainVis.stage5()
        } else if (Page == 1){
            scroll_sakura = 0
            opt_cityBridge.showBarDots(-100)
            opt_sakura.setFallY(0)
            stage_ss = 0
            callbackFrom = () => opt_sakura.stopAnima()
        } else if (Page == 2){
            opt_hospitalRenderer.stopAnima()
            callbackFrom = ()=>{
                stage_ff = 3
            }
        } else if (Page == 3){
        } else if (Page == 4){
            stage_ig = -1
        }
        changeNavbar(page)
        widthDiv.animate({top: offset}, 1000, ()=>{
            if(Page == page) {
                callbackTo&&callbackTo()
            }
            callbackFrom&&callbackFrom()
            inTrans = false
        })
        Page = page
    }
    return true
}

function lockOrientation (orientation) {
    if(IsPC()) return
    // Go into full screen first
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    }

    // Then lock orientation
    screen.orientation.lock(orientation);
}

function registerScroll(selected, scrollHandler, sensitive){
    let startPos
    $(selected).bind(wheelEvent, function(event){
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
        if(Math.abs(nowPos.y - startPos.y) > sensitive) {
            if(nowPos.y < startPos.y){
                scrollHandler(event, true)
            } else if(nowPos.y > startPos.y) {
                scrollHandler(event, false)
            }
            startPos = nowPos
        }
    })
}




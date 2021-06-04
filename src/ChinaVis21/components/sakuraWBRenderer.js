import {Water} from "./threejs/Water.js";

$(document).ready(function () {

    let div = $('#sakuraWBDiv')
    let scene = new THREE.Scene();

    //点光源
    let point = new THREE.PointLight(0xaaaaaa);
    point.position.set(400, 1000, 300); //点光源位置
    scene.add(point); //点光源添加到场景中
    //环境光
    let ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);

    /**
     * 相机设置
     */

    let width = div.width(); //窗口宽度
    let height = width * 980 / 1920; //窗口高度
    let k = width / height; //窗口宽高比
    let s = 300; //三维场景显示范围控制系数，系数越大，显示的范围越大
    //创建相机对象
    let camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
    camera.position.set(0, -28, 85); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
    window.camera = camera
    /**
     * 创建渲染器对象
     */
    // var renderer = new THREE.WebGLRenderer();
    // renderer.setSize(width, height);//设置渲染区域尺寸
    // renderer.setClearColor(0x1a1b1e, 1); //设置背景颜色

    let renderer = new THREE.WebGLRenderer({antialias: true,alpha:true});
    renderer.setSize(width, height);//设置渲染区域尺寸
    renderer.setClearAlpha(0.0);

    (function () {
        function resize() {
            width = div.width();
            height = width * 980 / 1920;
            renderer.setSize(width,height);
        }
        window.addEventListener("resize", resize)
    })();

    let controls = new THREE.OrbitControls(camera,renderer.domElement);//创建控件对象
    window.controls = controls
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controls.enabled = false;

    // oldP  相机原来的位置
    // oldT  target原来的位置
    // newP  相机新的位置
    // newT  target新的位置
    // callBack  动画结束时的回调函数
    function animateCamera(oldP, oldT, newP, newT, callBack){
        // controls.enabled = false
        var tween = new TWEEN.Tween({
            x1: oldP.x, // 相机x
            y1: oldP.y, // 相机y
            z1: oldP.z, // 相机z
            x2: oldT.x, // 控制点的中心点x
            y2: oldT.y, // 控制点的中心点y
            z2: oldT.z  // 控制点的中心点z
        });
        tween.to({
            x1: newP.x,
            y1: newP.y,
            z1: newP.z,
            x2: newT.x,
            y2: newT.y,
            z2: newT.z
        }, 2000);
        tween.onUpdate(function(object){
            camera.position.x = object.x1;
            camera.position.y = object.y1;
            camera.position.z = object.z1;
            controls.target.x = object.x2;
            controls.target.y = object.y2;
            controls.target.z = object.z2;
            controls.update();
        })
        tween.onComplete(function(){
            callBack&&callBack()
        })
        tween.easing(TWEEN.Easing.Cubic.InOut);
        tween.start();
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // sakura
    let maps = []
    for (let i = 1; i <= 12; i++) {
        maps.push(new THREE.TextureLoader().load(`resources/sakura2/s${i}-01.png`))
    }

    let ip = d3.interpolateRgb('#D84479', '#F7B3B4')
    let ip2 = d3.interpolateRgb('#d5a7a7', '#e08eab')

    let sakura_group = new THREE.Group()

    let box = [70,30,70]
    let speed = 0.04
    let count = d3.sum(data_clean.loc_comments, d=>d.length)
    for (let i = 0; i < 2500; i++) {
        let material = new THREE.SpriteMaterial( { map: maps[Math.floor(Math.random() * 11) + 1], color: ip(Math.random()) } );
        let sakura = new THREE.Sprite(material);
        material.rotation = Math.PI * 2 * Math.random()
        material.opacity = Math.random() * 0.5 + 0.5
        sakura.position.set(Math.random() * box[0]*2 - box[0], Math.random() * box[1]*2 - box[1], Math.random() * box[2]*2 - box[2])
        sakura.speed = new THREE.Vector3(Math.random() * speed - speed / 2, Math.random() * speed - speed / 2, Math.random() * speed - speed / 2)
        sakura.oOp = material.opacity
        sakura.ci = Math.floor(Math.random() * count)
        sakura_group.add(sakura)
    }

    scene.add( sakura_group );

    // water
    const params = {
        color: '#ffffff',
        scale: 4,
        flowX: 1,
        flowY: 1
    };

    let water = new Water( new THREE.PlaneGeometry( 400, 400 ), {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024
    } );

    water.position.y = -30;
    water.rotation.x = Math.PI * - 0.5;

    let waterBG = new THREE.Mesh(new THREE.PlaneGeometry( 400, 400 ), new THREE.MeshBasicMaterial({
            color: '#484a4e',
        }
    ))

    waterBG.position.y = -33;
    waterBG.rotation.x = Math.PI * - 0.5;

    scene.add(water, waterBG);

    let island_mesh

    //island
    new THREE.STLLoader().load('models/mountain.stl', function (geometry){
        let material = new THREE.MeshLambertMaterial({
            color: 0xffffff
        }); //材质对象Material
        island_mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        island_mesh.scale.set(0.1, 0.1, 0.1)
        island_mesh.rotateX(-Math.PI / 2)
        island_mesh.position.set(0,-40,0)
        opt_sakura.island_mesh = island_mesh
        scene.add(island_mesh); //网格模型添加到场景中
    })


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let hoverObject
    let hoverTime = 0
    let catchObject
    let focus = false
    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1,-1);


    function onMouseMove(e) {
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        mouse.x = ( e.offsetX / width ) * 2 - 1;
        mouse.y = - ( e.offsetY / height ) * 2 + 1;
        if(mouse.x > 0.8 || mouse.x < -0.8 || mouse.y > 0.8 || mouse.y < -0.8){
            mouse.x = -1
            mouse.y = -1
        }
    }

    let lastCameraPos = new THREE.Vector3(0, 0, 100)
    let isAnima = false
    let rope_index
    function onMouseClick(e) {
        if(hoverObject != null && catchObject != null && focus == false) {
            focus = true
            isAnima = true
            let vec = camera.position.clone().sub(hoverObject.position).normalize().multiplyScalar(3)
            lastCameraPos.copy(camera.position)
            animateCamera(camera.position, controls.target, hoverObject.position.clone().add(vec), hoverObject.position, ()=>{
                let sum = 0
                for (let i = 0; i < data_clean.loc_comments.length; i++) {
                    if(sum + data_clean.loc_comments[i].length > hoverObject.ci) {
                        let comment = data_clean.loc_comments[i][hoverObject.ci - sum]
                        showPin(1920 / 2 - 220 / 2, 1080 / 2 - 536 / 2 -20, 3, {0:comment.name, 1:comment.location, 2:comment.comment}, ()=>{
                            $.get("http://api.btstu.cn/sjtx/api.php",{ lx: "c1", format: "json" }, function(result){
                                let def = d3.select('#raduisImage').attr('width', result.width).attr('height', result.height)
                                def.select('image').attr('xlink:href', result.imgurl)
                            });
                        })
                        rope_index = i
                        let rope = $('#rope')
                        rope.css('display', '')
                        d3.select(rope.children()[rope_index]).transition()
                            .attr('opacity', 1)
                        break;
                    }
                    sum += data_clean.loc_comments[i].length
                }
                isAnima = false
            })
        } else if(focus && !isAnima){
            hidePin(3)
            let rope = $('#rope')
            d3.select(rope.children()[rope_index]).transition()
                .attr('opacity', 0)
                .on('end', ()=>{
                    rope.css('display', 'none')
                })
            isAnima = true
            animateCamera(camera.position, controls.target, lastCameraPos, new THREE.Vector3(0, 0, 0), ()=>{
                mouse.x = -1
                mouse.y = -1
                focus = false
                isAnima = false
                if(!focus && hoverObject != null) {
                    hoverObject.material.color.set(ip(Math.random()));
                    hoverObject.material.opacity = hoverObject.oOp
                    hoverObject = null
                    controls.autoRotateSpeed = 0.3
                    if(catchObject != null) {
                        catchObject.forEach(catched=>{
                            catched.material.color.set(ip(Math.random()))
                        })
                        catchObject = null
                    }
                    hoverTime = 0
                }
            })
        }
    }

    function onMouseWheel(e) {
        mouse.x = -1
        mouse.y = -1
        if(!focus && hoverObject != null) {
            hoverObject.material.color.set(ip(Math.random()));
            hoverObject.material.opacity = hoverObject.oOp
            hoverObject = null
            controls.autoRotateSpeed = 0.3
            if(catchObject != null) {
                catchObject.forEach(catched=>{
                    catched.material.color.set(ip(Math.random()))
                })
                catchObject = null
            }
            hoverTime = 0
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let anima = false
    function render(time) {
        if(anima) {
            if(catchObject == null) {
                controls.update()
            }
            logic();//执行渲染操作
            renderer.render(scene,camera);//执行渲染操作
            TWEEN.update(time)
            requestAnimationFrame(render);//请求再次执行渲染函数render
        }
    }

    let fall_y = 0

    function logic() {
        if(fall_y == 0 && !focus && mouse.x !== -1) {
            // 通过摄像机和鼠标位置更新射线
            rayCaster.setFromCamera( mouse, camera );

            // 计算物体和射线的焦点
            const intersects = rayCaster.intersectObjects(sakura_group.children, false );

            if(hoverObject == null) {
                if(intersects.length >0) {
                    hoverObject = intersects[0].object
                    hoverObject.material.color.set('#f6d6d6');
                    hoverObject.material.opacity = 1
                    controls.autoRotateSpeed = IsPC() ? 0.1 : 0
                }
            } else {
                let find = false
                for ( let i = 0; i < intersects.length; i ++ ) {
                    if (intersects[i].object === hoverObject) {
                        find = true
                        break
                    }
                }
                if(!find) {
                    hoverObject.material.color.set(ip(Math.random()));
                    hoverObject.material.opacity = hoverObject.oOp
                    hoverObject = null
                    controls.autoRotateSpeed = 0.3
                    if(catchObject != null) {
                        catchObject.forEach(catched=>{
                            catched.material.color.set(ip(Math.random()))
                        })
                        catchObject = null
                    }
                    hoverTime = 0
                } else if(hoverTime > 30 && catchObject == null) {
                    catchObject = []
                    controls.autoRotateSpeed = 0
                    sakura_group.children.forEach(child=>{
                        let dist = hoverObject.position.distanceTo(child.position)
                        if(dist < 20) {
                            // child.material.color.set(ip2(Math.random()))
                            catchObject.push(child)
                        }
                    })
                } else {
                    hoverTime++
                }
            }
        }

        var worldVector = new THREE.Vector3(
            0,
            0,
            0
        )

        for (let i = 0; i < sakura_group.children.length; i++) {
            let s = sakura_group.children[i]
            if (s === hoverObject) {
                if (focus) {
                   if(s.material.opacity > 0) {
                       s.material.opacity -= 0.1
                   }
                } else {
                    if(s.material.opacity < s.oOp) {
                        s.material.opacity += 0.1
                    }
                }
            } else if(catchObject != null && catchObject.includes(s)) {
                let r = s.position.distanceTo(hoverObject.position)
                let vec
                if(r < 15) {
                    let rVec = hoverObject.position.clone().sub(s.position)
                    let normalVec = rVec.clone().cross(s.speed).normalize().multiplyScalar(focus? 0.01:0.1)
                    vec = normalVec.sub(rVec).normalize().multiplyScalar(r).add(rVec)
                    if(r > 3) {
                        s.position.add(rVec.normalize().multiplyScalar(0.1))
                    }
                } else {
                    let rVec = hoverObject.position.clone().sub(s.position)
                    let normalVec = rVec.clone().cross(s.speed).normalize().multiplyScalar(0.1)
                    vec = normalVec.sub(rVec).normalize().multiplyScalar(r).add(rVec)
                }
                s.position.add(vec)
            }
            else {
                if(catchObject != null && s.material.opacity > 0.3) {
                    s.material.opacity -= 0.01
                } else if(catchObject == null && s.material.opacity < s.oOp){
                    s.material.opacity += 0.01
                }

                s.position.add(s.speed)

                if (s.position.x > box[0]) {
                    s.position.x = box[0]
                    s.speed.setX(-s.speed.x)
                } else if (s.position.x < -box[0]) {
                    s.position.x = -box[0]
                    s.speed.setX(-s.speed.x)
                }
                if (s.position.y > box[1]) {
                    s.position.y = box[1]
                    s.speed.setY(-s.speed.y)
                } else if (s.position.y < -box[1]) {
                    s.position.y = -box[1]
                    if(s.speed.y == -0.2) {
                        s.speed.setY(0)
                    } else {
                        s.speed.setY(-s.speed.y)
                    }
                }
                if (s.position.z > box[2]) {
                    s.position.z = box[2]
                    s.speed.setZ(-s.speed.z)
                } else if (s.position.z < -box[2]) {
                    s.position.z = -box[2]
                    s.speed.setZ(-s.speed.z)
                }
                if (fall_y > 0) {
                    let yOffset = worldVector.copy(s.position).project(camera).y
                    if (yOffset >= (1 - fall_y)) {
                        s.speed.setY(-0.2)
                    }
                } else if (!focus) {
                    let yOffset = worldVector.copy(s.position).project(camera).y
                    if(yOffset > 0.8) {
                        s.material.opacity = Math.min(s.oOp * (1 - yOffset) / 0.2, s.material.opacity)
                    }
                }
            }
        }
    }

    div.get(0).appendChild(renderer.domElement); //body元素中插入canvas对象
    div.click(onMouseClick)
    div.bind('wheel',onMouseWheel)
    div.mousemove(onMouseMove)
    div.mouse

    opt_sakura.startAnima = function() {
        anima = true
        render()
        console.log('start sakura renderer')

    }

    opt_sakura.stopAnima = function() {
        anima = false
        console.log('stop sakura renderer')
    }

    opt_sakura.setFallY = function(y) {
        if(focus) return false
        fall_y = y
        if(fall_y == 0) {
            for (let i = 0; i < sakura_group.children.length; i++) {
                let s = sakura_group.children[i]
                if(s.speed.y == -0.2 || s.speed.y == 0) {
                    s.speed.setY(Math.random() * speed - speed / 2)
                }
            }
        }
        return true
    }

    progressLoaded('樱花渲染器组件')
})
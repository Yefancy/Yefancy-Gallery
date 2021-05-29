opt_hospitalRenderer = {
    linesColor: [
        '#DA5E8A',
        '#F7B3B4',
        '#9AE8E8',
        '#C4F2F1',
        '#299DA5',
        '#F08B99',
        '#5FD3D3',
        '#F7D2D4'
    ]
}
$(document).ready(function () {
    let scene = new THREE.Scene();
    let div = $('#hospital_div')

    let buildingsObj
    let OBJLoader = new THREE.OBJLoader();//obj加载器
    let buildingsMeshesGroup = new THREE.Group()
    OBJLoader.load('models/B.obj', function(obj) {
        buildingsObj = obj
        for (let i = 0; i < buildingsObj.children.length; i++) {
            let building = buildingsObj.children[i]
            let mesh = new THREE.Mesh(building.geometry.clone(), new THREE.MeshLambertMaterial({
                color: opt_hospitalRenderer.linesColor[i],
                opacity:0.6,
                transparent:true,
            }))
            mesh.name = i
            buildingsMeshesGroup.add(mesh)
        }
        scene.add(buildingsMeshesGroup)
        buildingsMeshesGroup.position.set(-250, 0, -300)
    })

    let point = new THREE.PointLight(0xffffff);
    point.position.set(400, 1000, 300); //点光源位置
    scene.add(point); //点光源添加到场景中
    //环境光
    let ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);

    /**
     * 相机设置
     */
    let width = div.width(); //窗口宽度
    let height = div.height(); //窗口高度
    let k = width / height; //窗口宽高比
    let s = 300; //三维场景显示范围控制系数，系数越大，显示的范围越大
    //创建相机对象
    let camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, -1000, 1000);
    camera.position.set(150, 120, 150); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
    /**
     * 创建渲染器对象
     */
    let renderer = new THREE.WebGLRenderer({antialias: true,alpha:true});
    renderer.setSize(width, height);//设置渲染区域尺寸
    renderer.setClearAlpha(0.0);

    let controls = new THREE.OrbitControls(camera,renderer.domElement);//创建控件对象
    controls.autoRotate = true
    controls.enableZoom = false

    let anima = false

    function render() {
        if(anima) {
            for (let i = 0; i < buildingsMeshesGroup.children.length; i++) {
                let building = buildingsMeshesGroup.children[i].material;
                if(selected_render_building != null) {
                    if(selected_render_building === 7-i){
                        if(building.opacity < 1)
                            building.opacity += 0.01
                    } else {
                        if(building.opacity > 0.2)
                            building.opacity -= 0.01
                    }
                } else {
                    if (building.opacity > 0.6) {
                        building.opacity -= 0.01
                    } else if (building.opacity < 0.6){
                        building.opacity += 0.01
                    }
                }
            }
            controls.update()
            renderScene();//执行渲染操作
            requestAnimationFrame(render);//请求再次执行渲染函数render
        }
    }

    function renderScene() {
        renderer.render(scene,camera);//执行渲染操作
    }

    let selected_render_building = null

    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1,-1);

    div.get(0).appendChild(renderer.domElement); //body元素中插入canvas对象
    div.click(function (e){
        mouse.x = ( e.offsetX / width ) * 2 - 1;
        mouse.y = - ( e.offsetY / height ) * 2 + 1;
        rayCaster.setFromCamera(mouse, camera);
        // 计算物体和射线的焦点
        const intersects = rayCaster.intersectObjects(buildingsMeshesGroup.children, true);
        if(intersects.length > 0) {
            let index = 7 - intersects[0].object.name
            clickBuilding(4 === index ? 6:6 === index ? 4 : index)
        } else {
            clickBuilding(selected_building)
        }
    })

    opt_hospitalRenderer.startAnima = function startHospitalRender() {
        anima = true
        render()
        div.css('display', '').animate({opacity: 1})
    }

    opt_hospitalRenderer.stopAnima = function stopHospitalRender() {
        div.animate({opacity: 0}, ()=>{
            $('#hospital_div').css('display', 'none')
        })
        anima = false
    }

    opt_hospitalRenderer.selectBuilding = function selectBuilding(index){
        selected_render_building = 4 === index ? 6:6 === index ? 4 : index
    }
})



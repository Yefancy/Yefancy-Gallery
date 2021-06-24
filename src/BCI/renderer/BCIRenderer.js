import * as THREE from '../js/threejs/build/three.module.js';

import Stats from '../js/threejs/examples/jsm/libs/stats.module.js';
import {GUI} from '../js/threejs/examples/jsm/libs/dat.gui.module.js';
import {OrbitControls} from "../js/threejs/examples/jsm/controls/OrbitControls.js";
import {DragControls} from "../js/threejs/examples/jsm/controls/DragControls.js";
import {LineGeometry} from "../js/threejs/examples/jsm/lines/LineGeometry.js";
import {Line2} from "../js/threejs/examples/jsm/lines/Line2.js";
import {LineMaterial} from "../js/threejs/examples/jsm/lines/LineMaterial.js";
import {TDSLoader} from '../js/threejs/examples/jsm/loaders/TDSLoader.js';
import * as bci from '../data/bci.js';
import * as config from '../data/config.js';

let camera, scene, renderer, stats, params, timeF, f1, f2, f3, f4, orbitControl;
let timeController
let counter = 1;
const mouse = new THREE.Vector2( 1, 1 );


init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 20, 20, 20 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();

    const ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);

    const point = new THREE.PointLight(0xffffff, 0.6);
    point.position.set(400, 200, 300);
    scene.add(point);

    const point2 = new THREE.PointLight(0xffffff, 0.6);
    point2.position.set(-400, -200, -300); //点光源位置
    scene.add(point2); //点光源添加到场景中

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // controls
    orbitControl = new OrbitControls( camera, renderer.domElement );
    orbitControl.autoRotateSpeed = 1;
    orbitControl.autoRotate = true;
    let dragControl;

    stats = new Stats();
    document.body.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'mousemove', onMouseMove );

    // add brain
    const loader = new TDSLoader( );
    let brainG, brainWLG
    loader.load( 'assets/brain.3ds', function ( object ) {
        brainWLG = new THREE.Group()
        brainG = object
        scene.add( object );
        brainG.rotateX(-Math.PI/2)
        brainG.scale.set(4, 4, 4)
        window.brainG = brainG
        brainG.children.forEach(p=>{
            p.material.transparent = true
            p.material.opacity = 0.5
            p.material.side = THREE.FrontSide
            const wireframe = new THREE.WireframeGeometry( p.geometry );
            const line = new THREE.LineSegments( wireframe );
            line.material.depthTest = false;
            line.material.opacity = 0.5;
            line.material.transparent = true;
            line.position.set(p.position.x, p.position.y, p.position.z)
            brainWLG.add(line)
        })
        brainWLG.visible = false
        brainWLG.rotateX(-Math.PI/2)
        brainWLG.scale.set(4, 4, 4)
        window.brainWLG = brainWLG
        scene.add(brainWLG)

        // pre data
        params.导入数据集(bci.default)
        // pre config
        params.加载配置(config.default)
    } );

    // add point mesh
    const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );
    let pointG = new THREE.Group();
    let labelG = new THREE.Group();
    scene.add(pointG);
    scene.add(labelG);
    function buildLabels(){
        labelG.clear();
        // add label
        pointG.children.forEach(mesh=>{
            let label = makeTextSprite(mesh.name)
            label.position.set(mesh.position.x, mesh.position.y + 1, mesh.position.z)
            labelG.add(label)
            mesh.label = label
        })
    }
    function buildPoints(data) {
        let meshes = []
        pointG.clear();
        Object.keys(f1.__folders).forEach(key=>{
            f1.removeFolder(f1.__folders[key])
            if(f1.__folders[key]) delete f1.__folders[key]
        })

        if (dragControl) dragControl.dispose();
        for (let j = 0; j < data.length; j++) {
            let option = {
                color: 0xffffff
            }
            const material = new THREE.MeshPhongMaterial(option);
            let mesh = new THREE.Mesh(geometry, material)
            if (j % 2 !== 0)
                mesh.position.set(j / 2 + 0.5, 0, 0)
            else
                mesh.position.set(0, j / 2, 0)
            mesh.index = j
            mesh.name = "" + j
            meshes.push(mesh);
            pointG.add(mesh);

            let p = f1.addFolder(mesh.name)
            function changePos() {
                lineG.children.forEach(line=>{
                    if(line.from === mesh.index || line.to === mesh.index) {
                        const from = pointG.children[line.from].position
                        const to = pointG.children[line.to].position
                        line.geometry.setPositions([from.x, from.y, from.z, to.x, to.y, to.z]);
                    }
                })
            }
            p.add(mesh, 'name').onChange(name=>{
                p.name = name
                buildLabels()
            })
            p.add(mesh.position, 'x', -30, 30).onChange(changePos)
            p.add(mesh.position, 'y', -30, 30).onChange(changePos)
            p.add(mesh.position, 'z', -30, 30).onChange(changePos)
            p.addColor(option, 'color').onChange(e=>{
                mesh.material.color.set(e)
            })
            mesh.controller = p
        }

        buildLabels()

        let lines
        dragControl = new DragControls( meshes, camera, renderer.domElement );
        dragControl.addEventListener( 'dragstart', (e)=>{
            if(dragControl.enabled) {
                orbitControl.enabled = false;
                lines = []
                lineG.children.forEach(line=>{
                    if(line.from === e.object.index || line.to === e.object.index) {
                        lines.push(line)
                    }
                })
            }
        });

        dragControl.addEventListener( 'drag', (e)=>{
            lines.forEach(line=>{
                const from = pointG.children[line.from].position
                const to = pointG.children[line.to].position
                line.geometry.setPositions([from.x, from.y, from.z, to.x, to.y, to.z]);
            })
            e.object.controller.updateDisplay()
            e.object.label.position.set(e.object.position.x, e.object.position.y + 1, e.object.position.z)
        });

        dragControl.addEventListener( 'dragend', (e)=>{
            orbitControl.enabled = true;
            e.object.controller.updateDisplay()
            e.object.label.position.set(e.object.position.x, e.object.position.y + 1, e.object.position.z)
        } );
    }
    window.pointG = pointG
    window.labelG = labelG

    // add line mesh
    let lineG = new THREE.Group();
    scene.add(lineG)
    function buildLines(data, time){
        lineG.clear()
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data.length; j++) {
                if(data[i][j][time] !== 0) {
                    const from = pointG.children[i].position
                    const to = pointG.children[j].position
                    const geometry = new LineGeometry();
                    geometry.setPositions([from.x, from.y, from.z, to.x, to.y, to.z]);
                    let matLine = new LineMaterial( {
                        color: data[i][j][time] > 0 ? params.正相干 : params.负相干,
                        linewidth: params.线宽 * 0.0001, // in pixels
                        vertexColors: false,
                        dashed: params.虚线,
                        alphaToCoverage: true,
                        opacity: Math.min(1, Math.abs(data[i][j][time]) / (params.透明度阈值))
                    } );
                    const line = new Line2( geometry, matLine );
                    line.computeLineDistances();
                    line.scale.set( 1, 1, 1 );
                    line.from = i
                    line.to = j
                    line.value = data[i][j][time]
                    lineG.add(line);
                }
            }
        }
    }
    window.lineG = lineG


    // GUI
    const gui = new GUI();
    window.gui = gui
    window.timeF = timeF

    params = {
        正相干: 0xff0000,
        负相干: 0x0000ff,
        线宽: 50,
        虚线: false,
        透明度阈值: 1,
        可视: true,
        data: null,
        当前时间: 0,
        自动播放: false,
        播放速度: 60,
        brain: {
            可视: true,
            模式: 'Phone',
            渲染模式: ['Phone', 'WireFrame'],
            缩放: 4,
            颜色: 0xffffff,
            透明度: 0.5,
        },
        导入数据集 :function (d){
            this.data = d ? d : JSON.parse(prompt("粘贴json格式的数据集","[[[0]]]"))
            if (this.data == null) return;
            if(timeController) timeF.remove(timeController)
            this.当前时间 = 0
            buildPoints(this.data);
            buildLines(this.data, 0)
            timeController = timeF.add(params, '当前时间', 0, this.data[0][0].length - 1).onChange(e=>{
                let time = Math.floor(e)
                buildLines(this.data, time);
            })

        },
        加载配置 :function (c){
            let config = c ? c : JSON.parse(prompt("粘贴json格式的配置文件",""))
            if(config && config !== "") {
                for (let i = 0; i < pointG.children.length; i++) {
                    let pos = config.points[i].position
                    pointG.children[i].name = config.points[i].name
                    pointG.children[i].position.set(pos.x, pos.y, pos.z)
                    pointG.children[i].material.color.set(config.points[i].color)
                    pointG.children[i].controller.name = config.points[i].name
                    pointG.children[i].controller.updateDisplay()
                }

                buildLabels()

                params.正相干 = config.relate.c1
                params.负相干 = config.relate.c2
                params.线宽 = config.relate.lw
                params.虚线 = config.relate.dashed
                params.透明度阈值 = config.relate.os
                f2 && f2.__controllers.forEach(c=>c.updateDisplay())
                lineG.children.forEach(line=>{
                    if(line.value > 0) {
                        line.material.color.set(config.relate.c1)
                    }
                    if(line.value < 0) {
                        line.material.color.set(config.relate.c2)
                    }
                    line.material.linewidth = config.relate.lw * 0.0001
                    line.material.dashed = config.relate.dashed
                    line.material.opacity = Math.min(1, Math.abs(line.value) / config.relate.os)
                    const from = pointG.children[line.from].position
                    const to = pointG.children[line.to].position
                    line.geometry.setPositions([from.x, from.y, from.z, to.x, to.y, to.z]);
                })
                params.brain.可视 = config.brain.可视
                params.brain.缩放 = config.brain.缩放
                params.brain.颜色 = config.brain.颜色
                params.brain.透明度 = config.brain.透明度
                params.brain.模式 = config.brain.模式

                if(brainG && params.brain.模式 === 'Phone') {
                    brainG.visible = params.brain.可视
                } else if(brainWLG && params.brain.模式 === 'WireFrame') {
                    brainWLG.visible = params.brain.可视
                }
                if (brainG && params.可视 && params.brain.模式 === 'Phone') {
                    brainG.visible = true
                    brainWLG.visible = false
                } else if(brainWLG && params.可视 && params.brain.模式 === 'WireFrame') {
                    brainG.visible = false
                    brainWLG.visible = true
                }
                if(brainG) {
                    brainG.scale.set(params.brain.缩放,params.brain.缩放,params.brain.缩放)
                    brainWLG.scale.set(params.brain.缩放,params.brain.缩放,params.brain.缩放)
                    brainG.children.forEach(part=>{
                        part.material.color.set(params.brain.颜色)
                        part.material.opacity = params.brain.透明度
                    })
                    brainWLG.children.forEach(part=>{
                        part.material.color.set(params.brain.颜色)
                        part.material.opacity = params.brain.透明度
                    })
                }
                f3 && f3.__controllers.forEach(c=>c.updateDisplay())
            }
        },
        读取配置 :function (){
            let points = []
            pointG.children.forEach(mesh=>{
                points.push({name: mesh.name, position: mesh.position, color: mesh.material.color})
            })
            let newPage = window.open();
            let config = {
                relate: {
                    c1: this.正相干,
                    c2: this.负相干,
                    lw: this.线宽,
                    dashed: this.虚线,
                    os: this.透明度阈值,
                },
                points,
                brain: params.brain
            }
            newPage.document.write(JSON.stringify(config))
        },
        激活鼠标拖动调整 :true,
        极点标签: true
    }
    params.buildLines = buildLines
    gui.add(params, '导入数据集');
    gui.add(params, '加载配置');
    gui.add(params, '读取配置');
    gui.add(params, '激活鼠标拖动调整').onChange(e => dragControl.enabled = e);
    gui.add(params, '极点标签').onChange(e => labelG.visible = e);
    timeF = gui.addFolder('时间轴');
    timeF.add(params, '自动播放')
    timeF.add(params, '播放速度', 60, 119)
    f1 = gui.addFolder('电极点配置')
    f2 = gui.addFolder('相关性配置')
    f2.addColor(params, '正相干').onChange(e=> {
        lineG.children.forEach(line=>{
            if(line.value > 0) {
                line.material.color.set(e)
            }
        })
    });
    f2.addColor(params, '负相干').onChange(e=> {
        lineG.children.forEach(line=>{
            if(line.value < 0) {
                line.material.color.set(e)
            }
        })
    });
    f2.add(params, '线宽', 1, 100).onChange(e=>{
        lineG.children.forEach(line=>{
            line.material.linewidth = e * 0.0001
        })
    })
    f2.add(params, '透明度阈值', 0, 1).onChange(e=>{
        lineG.children.forEach(line=>{
            line.material.opacity = Math.min(1, Math.abs(line.value) / e)
        })
    })
    f2.add(params, '虚线', 1, 20).onChange(e=>{
        lineG.children.forEach(line=>{
            line.material.dashed = e
        })
    })
    f2.add(params, '可视').onChange(e=>{
        lineG.visible = e
    })
    f3 = gui.addFolder("大脑模型配置")
    f3.add(params.brain, '可视').onChange(e=>{
        if(brainG && params.brain.模式 === 'Phone') {
            brainG.visible = e
        } else if(brainWLG && params.brain.模式 === 'WireFrame') {
            brainWLG.visible = e
        }
    })
    f3.add(params.brain, '模式').options(params.brain.渲染模式).onChange(e=>{
        if(brainG && params.可视 && e === 'Phone') {
            brainG.visible = true
            brainWLG.visible = false
        } else if(brainWLG && params.可视 && e === 'WireFrame') {
            brainG.visible = false
            brainWLG.visible = true
        }
    })
    f3.addColor(params.brain, '颜色').onChange(e=>{
        if(brainG) {
            brainG.children.forEach(part=>{
                part.material.color.set(e)
            })
            brainWLG.children.forEach(part=>{
                part.material.color.set(e)
            })
        }
    })
    f3.add(params.brain, '透明度', 0, 1).onChange(e=>{
        if(brainG) {
            brainG.children.forEach(part=>{
                part.material.opacity = e
            })
            brainWLG.children.forEach(part=>{
                part.material.opacity = e
            })
        }
    })
    f3.add(params.brain, '缩放', 1, 10).onChange(e=>{
        if(brainG) {
            brainG.scale.set(e,e,e)
            brainWLG.scale.set(e,e,e)
        }
    })
    f4 = gui.addFolder("摄像机配置")
    f4.add(orbitControl, "autoRotate")
    f4.add(orbitControl, "autoRotateSpeed", 0, 30)
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function animate() {
    orbitControl.update()
    if(params && params.自动播放) {
        if (counter % (120 - Math.floor(params.播放速度)) === 0) {
            counter = 0
            params.当前时间 = (Math.floor(params.当前时间) + 1) % params.data[0][0].length
            timeController.updateDisplay()
            params.buildLines(params.data, params.当前时间)
        }
        counter++;
    }

    requestAnimationFrame( animate );

    render();

}

function render() {

    renderer.render( scene, camera );

    stats.update();

}

function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    let fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    let fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    let borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    let borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:255, a:1.0 };

    let backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    let metrics = context.measureText( message );
    let textWidth = metrics.width;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    canvas.width = textWidth + borderThickness
    canvas.height = fontsize * 1.4 + borderThickness
    let max = Math.max(canvas.width, canvas.height)
    // roundRect(context, 0, 0, canvas.width, canvas.height, 1);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 255, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    let texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;
    texture.wrapS =  0.5

    let spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, depthTest:false} );
    let sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(canvas.width / max * 1.5, canvas.height/max * 1.5,1)
    return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
// 导出初始化函数
export default function initApp(THREE) {
    console.log("THREE in app:", THREE);
    
    // 创建场景
    const w = window.innerWidth
    const h = window.innerHeight
    
    const scene = new THREE.Scene()
    //创建物体
    const axes = new THREE.AxesHelper(2, 2, 2)
    scene.add(axes)

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial()
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    //位置
    cube.position.set(1, 1, 1)
    //旋转
    //cube.rotation.x = 45 / 180 * Math.PI
    //cube.rotation.y = 45 / 180 * Math.PI
    //缩放
    cube.scale.set(2, 2, 2)
    //创建灯光
    const light = new THREE.AmbientLight()
    scene.add(light)
    //创建相机
    const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 100);
    camera.position.set(5, 5, 5)
    camera.lookAt(0,0,0)
    //创建渲染器
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(w,h)
    //通过设置运动时间间隔的方法实现运动
    /*setInterval(() => {
        cube.rotation.z += 0.01
        renderer.render(scene,camera)
        },1000 / 60
        )*/
    //通过requestAnimationFrame方法实现运动/解决不同刷新率的问题
    /*let time = Date.now()
    function tick(){
        let currentTime = Date.now()
        let deltaTime = currentTime - time
        time = currentTime
        cube.rotation.z += deltaTime
        renderer.render(scene,camera)
        requestAnimationFrame(tick)
    }*/
    tick()
    //通过THREEJS自带的Clock类的方法实现运动
    const clock = new THREE.Clock
    tick() {
        const time = clock.getElapsedTime()
        //cube.rotation.z = time
        cube.position.x = Math.sin(time * 0.1) * 2
        cube.position.y = Math.cos(time * 0.1）* 2

        renderer.render(scene,camera)
        requestAnimationFrame(tick)
    }
    document.body.append(renderer.domElement)
}

// 导出初始化函数
export default function initApp(THREE, Stats, OrbitControls) {
    console.log("THREE in app:", THREE);
    
    // 创建场景
    const w = window.innerWidth
    const h = window.innerHeight
    
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x333333) // 添加窗口背景色
    // 创建物体
    const axes = new THREE.AxesHelper(5)
    scene.add(axes)

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshNormalMaterial({ 
        color: 0xff0000, // 改为更醒目的红色
        wireframe: false
    })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    // 位置
    cube.position.set(1, 1, 1)
    // 旋转
    //cube.rotation.x = 45 / 180 * Math.PI
    //cube.rotation.y = 45 / 180 * Math.PI
    // 缩放
    cube.scale.set(2, 2, 2)
    // 创建灯光
    const light = new THREE.AmbientLight(0xffffff, 1) // 增加光强度
    scene.add(light)
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 100);
    camera.position.set(5, 5, 5)
    camera.lookAt(0,0,0)
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true // 允许透明背景  
            })
    renderer.setSize(w,h)
    document.body.appendChild(renderer.domElement) // 立即添加到DOM
   
    // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    })
    
    // 通过设置运动时间间隔的方法实现运动
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

    // ===== 添加FPS计数器 =====
    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb
    document.getElementById('stats-container').appendChild(stats.dom)

    // ===== 添加轨道控制器（鼠标交互）=====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果，使操作更平滑
    controls.dampingFactor = 0.05; // 阻尼系数
    controls.screenSpacePanning = false; // 定义平移方式
    controls.minDistance = 3; // 最小缩放距离
    controls.maxDistance = 20; // 最大缩放距离
    controls.maxPolarAngle = Math.PI / 2; // 限制垂直旋转角度
    
    // 通过THREEJS自带的Clock类的方法实现运动
    const clock = new THREE.Clock()
    function tick() {
        stats.begin() // 开始性能监测
        const time = clock.getElapsedTime()
        //cube.rotation.z = time
        cube.position.x = Math.sin(time * 2 ) * 2
        cube.position.y = Math.cos(time * 2 ) * 2
        // 旋转动画
        cube.rotation.x = time * 0.7;
        cube.rotation.y = time * 0.5;
        // 更新控制器
        controls.update();
        renderer.render(scene,camera)
        stats.end() // 结束性能监测
        requestAnimationFrame(tick)
    }
    tick()
}

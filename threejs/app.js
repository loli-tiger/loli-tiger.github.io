// 导出初始化函数
function initApp(THREE, Stats, OrbitControls) {
    console.log("Three.js version:", THREE.REVISION);
    
    // 获取DOM元素
    const loadingEl = document.getElementById('loading');
    const resetBtn = document.getElementById('reset-btn');
    
    // 创建场景
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // 创建网格地面
    const gridSize = 20;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    // 创建坐标轴
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 创建立方体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff3300,
        shininess: 100,
        specular: 0xffffff
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);
    cube.position.set(0, 1, 0);
    cube.scale.set(2, 2, 2);
    
    // 创建灯光系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
    
    // 添加灯光辅助
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 100);
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
   
    // 窗口大小变化处理
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    // 添加FPS计数器
    const stats = new Stats();
    stats.showPanel(0);
    document.getElementById('stats-container').appendChild(stats.dom);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    
    // 重置视角功能
    resetBtn.addEventListener('click', () => {
        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);
        controls.reset();
    });

    // 动画循环
    const clock = new THREE.Clock();
    function animate() {
        stats.begin();
        
        const time = clock.getElapsedTime();
        const delta = clock.getDelta();
        
        // 立方体动画
        cube.position.x = Math.sin(time * 1.2) * 3;
        cube.position.z = Math.cos(time * 1.2) * 3;
        cube.rotation.x = time * 0.7;
        cube.rotation.y = time * 0.9;
        
        // 点光源动画
        pointLight.position.x = Math.sin(time * 0.8) * 6;
        pointLight.position.z = Math.cos(time * 0.8) * 6;
        
        // 更新控制器
        controls.update();
        
        // 渲染场景
        renderer.render(scene, camera);
        
        stats.end();
        requestAnimationFrame(animate);
    }
    
    // 启动动画
    animate();
    
    // 移除加载提示
    setTimeout(() => {
        loadingEl.style.display = 'none';
    }, 500);
}

// 导出函数供HTML使用
window.initApp = initApp;

// 增强的初始化函数
function initApp(THREE, Stats, OrbitControls) {
    console.log("Three.js版本: r" + THREE.REVISION);
    
    // 获取DOM元素
    const loadingEl = document.getElementById('loading');
    const resetBtn = document.getElementById('reset-btn');
    const statsContainer = document.getElementById('stats-container');
    const statusText = document.getElementById('status-text');
    
    // 1. 创建场景
    statusText.textContent = "创建场景...";
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // 2. 创建相机
    statusText.textContent = "创建相机...";
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // 3. 创建渲染器 - 添加详细的错误处理
    statusText.textContent = "创建渲染器...";
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
    } catch (e) {
        console.error("无法创建WebGL渲染器:", e);
        statusText.textContent = "错误: 浏览器不支持WebGL";
        throw new Error("WebGL不可用: " + e.message);
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // 4. 添加光源
    statusText.textContent = "添加光源...";
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // 5. 添加场景物体
    statusText.textContent = "创建物体...";
    
    // 网格地面
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    // 坐标轴
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // 创建立方体 - 使用更醒目的颜色
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff5722, // 橙色
        shininess: 100,
        specular: 0xffffff
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1, 0);
    scene.add(cube);
    
    // 添加多个物体确保场景可见
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x2196F3, // 蓝色
        shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 1, 0);
    scene.add(sphere);
    
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0x4CAF50, // 绿色
        shininess: 100
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 1, 0);
    scene.add(torus);
    
    // 6. 添加FPS计数器
    statusText.textContent = "添加性能监控...";
    const stats = new Stats();
    stats.showPanel(0);
    statsContainer.appendChild(stats.dom);
    
    // 7. 添加轨道控制器
    statusText.textContent = "添加控制器...";
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    
    // 8. 窗口大小调整处理
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // 9. 重置视角功能
    resetBtn.addEventListener('click', () => {
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
        controls.reset();
    });
    
    // 10. 动画循环
    statusText.textContent = "启动动画循环...";
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        stats.begin();
        
        const time = clock.getElapsedTime();
        
        // 立方体动画
        cube.rotation.x = time * 0.5;
        cube.rotation.y = time * 0.8;
        cube.position.y = Math.sin(time * 1.5) * 0.5 + 1;
        
        // 球体动画
        sphere.rotation.x = time * 0.4;
        sphere.rotation.z = time * 0.6;
        sphere.position.x = 3 + Math.sin(time * 0.7) * 2;
        
        // 圆环动画
        torus.rotation.x = time * 0.6;
        torus.rotation.y = time * 0.4;
        torus.position.x = -3 + Math.cos(time * 0.8) * 2;
        
        controls.update();
        renderer.render(scene, camera);
        stats.end();
    }
    
    // 初始渲染
    renderer.render(scene, camera);
    
    // 启动动画循环
    animate();
    
    // 添加场景就绪日志
    console.log("Three.js场景已成功初始化!");
    console.log("场景包含:", scene.children.length, "个对象");
}

function initApp(THREE, Stats, OrbitControls) {
    console.log("Three.js版本: r" + THREE.REVISION);
    
    const loadingEl = document.getElementById('loading');
    const resetBtn = document.getElementById('reset-btn');
    const statsContainer = document.getElementById('stats-container');
    const statusText = document.getElementById('status-text');
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
    } catch (e) {
        statusText.textContent = "错误: " + e.message;
        showError("无法创建渲染器: " + e.message);
        return;
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // 创建原有物体
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff5722,
        shininess: 100,
        specular: 0xffffff
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1, 0);
    scene.add(cube);
    
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x2196F3,
        shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 1, 0);
    scene.add(sphere);
    
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0x4CAF50,
        shininess: 100
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 1, 0);
    scene.add(torus);
    
    // 添加外部模型加载功能
    statusText.textContent = "加载外部模型...";
    const loader = new THREE.OBJLoader();
    loader.load(
        // 使用一个示例模型URL（可替换为您的模型路径）
        'https://threejs.org/examples/models/obj/male02/male02.obj',
        (object) => {
            // 生成随机颜色
            const randomColor = new THREE.Color(
                Math.random() * 0.5 + 0.5, 
                Math.random() * 0.5 + 0.5, 
                Math.random() * 0.5 + 0.5
            );
            
            // 应用随机Phong材质到模型所有部分
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: randomColor,
                        shininess: 100,
                        specular: 0xffffff
                    });
                }
            });
            
            // 调整模型位置和大小
            object.position.set(0, 0, 5);
            object.scale.set(0.8, 0.8, 0.8);
            object.rotation.y = Math.PI;
            
            scene.add(object);
            statusText.textContent = "外部模型加载完成!";
        },
        (xhr) => {
            const percent = Math.round(xhr.loaded / xhr.total * 100);
            statusText.textContent = `加载外部模型: ${percent}%`;
        },
        (error) => {
            statusText.textContent = "外部模型加载失败";
            showError("模型加载失败: " + error.message);
            console.error('模型加载错误:', error);
        }
    );
    
    const stats = new Stats();
    stats.showPanel(0);
    statsContainer.appendChild(stats.dom);
    
    try {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        
        resetBtn.addEventListener('click', () => {
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            controls.reset();
        });

        // 确保视窗高度正确
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            stats.begin();
            
            const time = clock.getElapsedTime();
            
            cube.rotation.x = time * 0.5;
            cube.rotation.y = time * 0.8;
            cube.position.y = Math.sin(time * 1.5) * 0.5 + 1;
            
            sphere.rotation.x = time * 0.4;
            sphere.rotation.z = time * 0.6;
            sphere.position.x = 3 + Math.sin(time * 0.7) * 2;
            
            torus.rotation.x = time * 0.6;
            torus.rotation.y = time * 0.4;
            torus.position.x = -3 + Math.cos(time * 0.8) * 2;
            
            controls.update();
            renderer.render(scene, camera);
            stats.end();
        }
        
        renderer.render(scene, camera);
        animate();
        
        console.log("Three.js场景已成功初始化!");
        console.log("场景包含:", scene.children.length, "个对象");
        
        setTimeout(() => {
            loadingEl.style.display = 'none';
        }, 500);
        
    } catch (e) {
        showError("控制器初始化失败: " + e.message);
        statusText.textContent = "控制器初始化失败";
    }
}

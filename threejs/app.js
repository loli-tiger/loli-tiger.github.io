function initApp(THREE, Stats, OrbitControls) {
    console.log("Three.js版本: r" + THREE.REVISION);
    
    const loadingEl = document.getElementById('loading');
    const resetBtn = document.getElementById('reset-btn');
    const statsContainer = document.getElementById('stats-container');
    const statusText = document.getElementById('status-text');

    
    // 显示错误函数
    function showError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = "错误: " + message;
        errorMessage.style.display = 'block';
        console.error(message);
    }
    
    // 1. 创建场景
    statusText.textContent = "创建场景...";
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // 2. 创建相机
    statusText.textContent = "创建相机...";
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // 3. 创建渲染器
    statusText.textContent = "创建渲染器...";
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
    
    // 创建立方体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff5722,
        shininess: 100,
        specular: 0xffffff
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1, 0);
    scene.add(cube);
    
    // 添加球体
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x2196F3,
        shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 1, 0);
    scene.add(sphere);
    
    // 添加圆环
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0x4CAF50,
        shininess: 100
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 1, 0);
    scene.add(torus);
    
    // 6. 添加外部模型加载功能
    statusText.textContent = "加载外部模型...";

    // 声明变量存储加载的模型对象
    let externalModel = null;
    let gltfModel = null; // 新增：存储GLTF模型
    
    // 创建GUI控制器
    const gui = new dat.GUI({ name: '模型控制面板', width: 300 });
    gui.close(); // 默认折叠

    // 添加GUI重置按钮
    gui.add({
        resetAll: function() {
            if (externalModelFolder) externalModelFolder.revert();
            if (gltfModelFolder) gltfModelFolder.revert();
        }
    }, 'resetAll').name('重置所有设置');
    
    let externalModelFolder, gltfModelFolder;
    
    // 创建HDR环境贴图
    statusText.textContent = "加载HDR环境贴图...";
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // 加载HDR图像
    new THREE.RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load(
            'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr',
            (texture) => {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                scene.environment = envMap;
                
                // 释放内存
                texture.dispose();
                pmremGenerator.dispose();
                
                console.log("HDR环境贴图加载成功");
                statusText.textContent = "HDR环境贴图加载成功";
            },
            (xhr) => {
                const percent = Math.round(xhr.loaded / xhr.total * 100);
                statusText.textContent = `加载HDR环境贴图: ${percent}%`;
            },
            (error) => {
                statusText.textContent = "HDR环境贴图加载失败";
                showError("HDR环境贴图加载失败: " + error.message);
                console.error('HDR环境贴图加载错误:', error);
            }
        );
    
    try {
        // 创建OBJ加载器 - 现在应该已可用
        const loader = new THREE.OBJLoader();
        
        // 使用一个可靠的模型URL
        const modelUrl = '4.obj';
        
        loader.load(
            modelUrl,
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
                object.position.set(0, 0, 1);
                object.scale.set(1.5, 1.5, 1.5);
                object.rotation.y = Math.PI;
                
                scene.add(object);
                statusText.textContent = "外部模型加载完成!";

                 // 保存模型引用
                externalModel = object;

                 // 添加GUI控制
                externalModelFolder = gui.addFolder('OBJ模型控制');
                externalModelFolder.add(externalModel.position, 'x', -10, 10, 0.1).name('位置 X');
                externalModelFolder.add(externalModel.position, 'y', -5, 10, 0.1).name('位置 Y');
                externalModelFolder.add(externalModel.position, 'z', -10, 10, 0.1).name('位置 Z');
                
                externalModelFolder.add(externalModel.rotation, 'x', -Math.PI, Math.PI, 0.01).name('旋转 X');
                externalModelFolder.add(externalModel.rotation, 'y', -Math.PI, Math.PI, 0.01).name('旋转 Y');
                externalModelFolder.add(externalModel.rotation, 'z', -Math.PI, Math.PI, 0.01).name('旋转 Z');
                
                externalModelFolder.add(externalModel.scale, 'x', 0.1, 5, 0.1).name('缩放 X').onChange((v) => {
                    externalModel.scale.y = v;
                    externalModel.scale.z = v;
                });
                
                externalModelFolder.open();
                
                console.log("模型加载成功:", object);
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
    } catch (e) {
        showError("创建OBJLoader失败: " + e.message);
        statusText.textContent = "创建加载器失败";
    }

        // 新增：加载GLTF模型
    statusText.textContent = "加载GLTF模型...";
    try {
        if (typeof THREE.GLTFLoader === 'function') {
            const gltfLoader = new THREE.GLTFLoader();
            
            // 使用一个可靠的GLTF模型URL
            const gltfModelUrl = 'espresso.gltf';
            
            gltfLoader.load(
                gltfModelUrl,
                (gltf) => {
                    const model = gltf.scene;
                    
                    // 应用材质到模型所有部分
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshPhongMaterial({
                                color: 0x9c27b0, // 紫色
                                shininess: 80,
                                specular: 0xffffff
                            });
                        }
                    });
                    
                    // 调整模型位置和大小
                    model.position.set(-5, 1, 0);
                    model.scale.set(1.2, 1.2, 1.2);
                    scene.add(model);
                    
                    // 保存模型引用
                    gltfModel = model;
                    statusText.textContent = "GLTF模型加载完成!";

                    // 添加GUI控制
                    gltfModelFolder = gui.addFolder('GLTF模型控制');
                    gltfModelFolder.add(gltfModel.position, 'x', -10, 10, 0.1).name('位置 X');
                    gltfModelFolder.add(gltfModel.position, 'y', -5, 10, 0.1).name('位置 Y');
                    gltfModelFolder.add(gltfModel.position, 'z', -10, 10, 0.1).name('位置 Z');
                    
                    gltfModelFolder.add(gltfModel.rotation, 'x', -Math.PI, Math.PI, 0.01).name('旋转 X');
                    gltfModelFolder.add(gltfModel.rotation, 'y', -Math.PI, Math.PI, 0.01).name('旋转 Y');
                    gltfModelFolder.add(gltfModel.rotation, 'z', -Math.PI, Math.PI, 0.01).name('旋转 Z');
                    
                    gltfModelFolder.add(gltfModel.scale, 'x', 0.1, 5, 0.1).name('缩放 X').onChange((v) => {
                        gltfModel.scale.y = v;
                        gltfModel.scale.z = v;
                    });
                    
                    gltfModelFolder.open();
                    
                    console.log("GLTF模型加载成功:", model);
                },
                (xhr) => {
                    const percent = Math.round(xhr.loaded / xhr.total * 100);
                    statusText.textContent = `加载GLTF模型: ${percent}%`;
                },
                (error) => {
                    statusText.textContent = "GLTF模型加载失败";
                    showError("GLTF模型加载失败: " + error.message);
                    console.error('GLTF模型加载错误:', error);
                }
            );
        } else {
            throw new Error("GLTFLoader未可用");
        }
    } catch (e) {
        showError("创建GLTFLoader失败: " + e.message);
        statusText.textContent = "创建GLTF加载器失败";
    }
    
    // 7. 添加FPS计数器
    statusText.textContent = "添加性能监控...";
    const stats = new Stats();
    stats.showPanel(0);
    statsContainer.appendChild(stats.dom);
    
    // 8. 添加轨道控制器
    statusText.textContent = "添加控制器...";
    try {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        
        // 重置视角功能
        resetBtn.addEventListener('click', () => {
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            controls.reset();
        });

        // 添加窗口大小变化监听
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 动画循环
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

            
            
            if (externalModel) {
                 // 添加更多动画效果
                externalModel.rotation.x = time * 0.6;
                externalModel.rotation.y = time * 0.4;
                externalModel.rotation.z = time * 0.3;
                externalModel.position.x = Math.sin(time * 0.8) * 3;
                externalModel.position.y = Math.cos(time * 1.2) * 0.5;
            }

             // 新增：GLTF模型动画
           if (gltfModel) {
                gltfModel.rotation.y = time * 0.5;
                gltfModel.position.y = Math.sin(time * 1.2) * 0.3 + 1;
                gltfModel.position.z = Math.cos(time * 0.7) * 1.5;
            }
            
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
        
        // 移除加载提示
        setTimeout(() => {
            loadingEl.style.display = 'none';
        }, 500);
        
    } catch (e) {
        showError("控制器初始化失败: " + e.message);
        statusText.textContent = "控制器初始化失败";
    }
}

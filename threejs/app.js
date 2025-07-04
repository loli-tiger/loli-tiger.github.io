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
    scene.background = new THREE.Color(0xffffff); // 背景改为纯白色
    
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
    renderer.shadowMap.enabled = true; // 启用阴影
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用平滑阴影
    document.body.appendChild(renderer.domElement);
    
    // 4. 添加光源
    statusText.textContent = "添加光源...";
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true; // 启用阴影投射
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // 5. 添加场景物体
    statusText.textContent = "创建物体...";
    
    // 创建白色地面（与背景同色）
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2; // 确保物体在地面之上
    ground.receiveShadow = true; // 接收阴影
    scene.add(ground);
    
    // 移除原始网格地面和坐标轴
    // const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    // scene.add(gridHelper);
    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);
    
    // 创建立方体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff5722,
        shininess: 100,
        specular: 0xffffff
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1, 0);
    cube.castShadow = true; // 投射阴影
    scene.add(cube);
    
    // 添加球体
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x2196F3,
        shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 1, 0);
    sphere.castShadow = true; // 投射阴影
    scene.add(sphere);
    
    // 添加圆环
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0x4CAF50,
        shininess: 100
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 1, 0);
    torus.castShadow = true; // 投射阴影
    scene.add(torus);
    
    // 6. 添加外部模型加载功能
    statusText.textContent = "加载外部模型...";

    // 声明变量存储加载的模型对象
    let externalModel = null;
    let gltfModel = null;
    
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
    
    // 将重置视角按钮集成到面板
    gui.add({
        resetView: function() {
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            controls.reset();
        }
    }, 'resetView').name('重置视角');
    
    // 隐藏原始重置按钮
    resetBtn.style.display = 'none';
    
    let externalModelFolder, gltfModelFolder;
    
    // 创建HDR环境贴图
    statusText.textContent = "加载HDR环境贴图...";
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // 存储当前HDR纹理
    let currentHDRTexture = null;
    
    // 创建HDR上传功能
    const hdrFolder = gui.addFolder('HDR环境贴图');
    hdrFolder.open();
    
    // 创建预览容器
    const previewContainer = document.createElement('div');
    previewContainer.style.width = '100%';
    previewContainer.style.height = '100px';
    previewContainer.style.marginTop = '10px';
    previewContainer.style.backgroundColor = '#f0f0f0';
    previewContainer.style.borderRadius = '4px';
    previewContainer.style.overflow = 'hidden';
    previewContainer.style.display = 'flex';
    previewContainer.style.justifyContent = 'center';
    previewContainer.style.alignItems = 'center';
    
    const previewText = document.createElement('div');
    previewText.textContent = 'HDR预览';
    previewText.style.color = '#666';
    previewContainer.appendChild(previewText);
    
    hdrFolder.__ul.appendChild(previewContainer);
    
    hdrFolder.add({
        uploadHDR: function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.hdr';
            input.onchange = e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        // 清理旧的HDR纹理
                        if (currentHDRTexture) {
                            currentHDRTexture.dispose();
                        }
                        
                        new THREE.RGBELoader()
                            .setDataType(THREE.UnsignedByteType)
                            .load(
                                event.target.result,
                                (texture) => {
                                    currentHDRTexture = texture;
                                    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                                    scene.environment = envMap;
                                    
                                    // 创建预览
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    canvas.width = 200;
                                    canvas.height = 100;
                                    
                                    // 创建临时图像用于预览
                                    const image = new Image();
                                    image.onload = function() {
                                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                                        previewContainer.removeChild(previewText);
                                        const hdrPreview = new Image();
                                        hdrPreview.src = canvas.toDataURL('image/jpeg');
                                        hdrPreview.style.width = '100%';
                                        hdrPreview.style.height = '100%';
                                        hdrPreview.style.objectFit = 'cover';
                                        previewContainer.appendChild(hdrPreview);
                                    };
                                    image.src = URL.createObjectURL(file);
                                    
                                    console.log("HDR环境贴图上传成功");
                                },
                                undefined,
                                (error) => {
                                    statusText.textContent = "HDR环境贴图上传失败";
                                    showError("HDR环境贴图上传失败: " + error.message);
                                    console.error('HDR环境贴图上传错误:', error);
                                }
                            );
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        }
    }, 'uploadHDR').name('上传HDR文件');
    
    // 加载初始HDR图像
    new THREE.RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load(
            'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr',
            (texture) => {
                currentHDRTexture = texture;
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                scene.environment = envMap;
                
                // 创建预览
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 200;
                canvas.height = 100;
                
                // 创建临时图像用于预览
                const image = new Image();
                image.onload = function() {
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    previewContainer.removeChild(previewText);
                    const hdrPreview = new Image();
                    hdrPreview.src = canvas.toDataURL('image/jpeg');
                    hdrPreview.style.width = '100%';
                    hdrPreview.style.height = '100%';
                    hdrPreview.style.objectFit = 'cover';
                    previewContainer.appendChild(hdrPreview);
                };
                image.src = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr';
                
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
        // 创建OBJ加载器
        const loader = new THREE.OBJLoader();
        const modelUrl = '4.obj';
        
        loader.load(
            modelUrl,
            (object) => {
                const randomColor = new THREE.Color(
                    Math.random() * 0.5 + 0.5, 
                    Math.random() * 0.5 + 0.5, 
                    Math.random() * 0.5 + 0.5
                );
                
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: randomColor,
                            shininess: 100,
                            specular: 0xffffff
                        });
                        child.castShadow = true; // 投射阴影
                    }
                });
                
                object.position.set(0, 0, 1);
                object.scale.set(1.5, 1.5, 1.5);
                object.rotation.y = Math.PI;
                scene.add(object);
                statusText.textContent = "外部模型加载完成!";

                externalModel = object;

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

    // 加载初始GLTF模型
    statusText.textContent = "加载GLTF模型...";
    try {
        if (typeof THREE.GLTFLoader === 'function') {
            const gltfLoader = new THREE.GLTFLoader();
            const gltfModelUrl = 'blender.gltf';
            
            gltfLoader.load(
                gltfModelUrl,
                (gltf) => {
                    const model = gltf.scene;
                    
                    model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.envMapIntensity = 2.0;
                            if (child.material.isMeshStandardMaterial) {
                                child.material.metalness = 0.8;
                                child.material.roughness = 0.2;
                            }
                            child.castShadow = true; // 投射阴影
                        }
                    });
                    
                    model.position.set(-5, 1, 0);
                    model.scale.set(1.2, 1.2, 1.2);
                    scene.add(model);
                    
                    gltfModel = model;
                    statusText.textContent = "GLTF模型加载完成!";

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
    
    // 添加GLTF/GLB模型上传功能
    const uploadFolder = gui.addFolder('模型上传');
    uploadFolder.open();
    
    // 模型计数器
    let modelCount = 0;
    
    uploadFolder.add({
        uploadModel: function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.gltf,.glb';
            input.onchange = e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const loader = new THREE.GLTFLoader();
                        loader.load(
                            event.target.result,
                            gltf => {
                                const model = gltf.scene;
                                modelCount++;
                                
                                // 设置初始缩放为原始尺寸的1/10
                                model.scale.set(0.1, 0.1, 0.1);
                                model.position.set(0, 0, 0);
                                model.name = `Model_${modelCount}`;
                                
                                model.traverse(child => {
                                    if (child.isMesh) {
                                        child.castShadow = true; // 投射阴影
                                        child.receiveShadow = true; // 接收阴影
                                    }
                                });
                                
                                scene.add(model);
                                
                                // 添加控制面板
                                const modelFolder = gui.addFolder(`模型 ${modelCount}`);
                                modelFolder.add(model.position, 'x', -20, 20, 0.1).name('位置 X');
                                modelFolder.add(model.position, 'y', -10, 20, 0.1).name('位置 Y');
                                modelFolder.add(model.position, 'z', -20, 20, 0.1).name('位置 Z');
                                
                                modelFolder.add(model.rotation, 'x', -Math.PI, Math.PI, 0.01).name('旋转 X');
                                modelFolder.add(model.rotation, 'y', -Math.PI, Math.PI, 0.01).name('旋转 Y');
                                modelFolder.add(model.rotation, 'z', -Math.PI, Math.PI, 0.01).name('旋转 Z');
                                
                                modelFolder.add(model.scale, 'x', 0.01, 2, 0.01).name('缩放 X');
                                modelFolder.add(model.scale, 'y', 0.01, 2, 0.01).name('缩放 Y');
                                modelFolder.add(model.scale, 'z', 0.01, 2, 0.01).name('缩放 Z');
                                
                                modelFolder.open();
                            },
                            undefined,
                            error => {
                                showError("模型加载失败: " + error.message);
                                console.error('模型加载错误:', error);
                            }
                        );
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        }
    }, 'uploadModel').name('上传GLTF/GLB模型');
    
    // 7. 添加FPS计数器
    statusText.textContent = "添加性能监控...";
    const stats = new Stats();
    stats.showPanel(0);
    
    // 将性能监控集成到面板
    const perfFolder = gui.addFolder('性能监控');
    perfFolder.open();
    perfFolder.__ul.appendChild(stats.dom);
    stats.dom.style.position = 'relative';
    stats.dom.style.left = '0';
    statsContainer.style.display = 'none'; // 隐藏原始容器
    
    // 8. 添加轨道控制器
    statusText.textContent = "添加控制器...";
    try {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        
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
                externalModel.rotation.x = time * 0.6;
                externalModel.rotation.y = time * 0.4;
                externalModel.rotation.z = time * 0.3;
                externalModel.position.x = Math.sin(time * 0.8) * 3;
                externalModel.position.y = Math.cos(time * 1.2) * 0.5;
            }

            if (gltfModel) {
                gltfModel.rotation.y = time * 0.5;
                gltfModel.position.y = Math.sin(time * 1.2) * 0.3 + 1;
                gltfModel.position.z = Math.cos(time * 0.7) * 1.5;
            }
            
            // 新导入的模型没有动画
            
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

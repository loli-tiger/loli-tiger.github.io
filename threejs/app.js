// 导出初始化函数
export default function initApp(THREE) {
    console.log("THREE in app:", THREE);
    
    // 创建场景
    const w = window.innerWidth
    const h = window.innerHeight
    
    const scene = new THREE.Scene()

    const geometry2 = new THREE.BoxGeometry()
    const material2 = new THREE.MeshBasicMaterial()
    const cube = new THREE.Mesh(geometry2, material2)
    scene.add(cube)
    
    const light = new THREE.AmbientLight()
    scene.add(light)
    

    const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 100);
    camera.position.set(0,0,5)
    camera.lookAt(0,0,0)
    
  //  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('myCanvas') });
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize = (w,h)
    renderer.render(scene,camera)

    document.body.append(renderer.domElement)
    
    // 添加立方体
 /*   const geometry1 = new THREE.BoxGeometry();
    const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube1 = new THREE.Mesh(geometry1, material1);
    scene.add(cube1);
    
    camera.position.z = 5;
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();*/
}

// 导出初始化函数
export default function initApp(THREE) {
    console.log("THREE in app:", THREE);
    
    // 创建场景
    const scene = new THREE.Scene();
    const cube
    scene.add(cube)
    const light = new THREE.AmbientLight()
    scene.add(light)
    

    const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('myCanvas') });
    
    // 添加立方体
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube2 = new THREE.Mesh(geometry, material);
    scene.add(cube2);
    
    camera.position.z = 5;
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

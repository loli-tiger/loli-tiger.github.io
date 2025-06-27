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
    cube.rotation.x = 45 / 180 * Math.PI
    cube.rotation.y = 45 / 180 * Math.PI
    //缩放
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
    renderer.render(scene,camera)

    document.body.append(renderer.domElement)
}

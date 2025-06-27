// 导出初始化函数
export default function initApp(THREE) {
    console.log("THREE in app:", THREE);
    
    // 创建场景
    const w = window.innerWidth
    const h = window.innerHeight
    
    const scene = new THREE.Scene()

    const axes = new THREE.AxesHelper(2, 2, 2)
    scene.add(axes)

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial()
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    
    const light = new THREE.AmbientLight()
    scene.add(light)
    
    const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 100);
    camera.position.set(0,0,5)
    camera.lookAt(0,0,0)
    
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(w,h)
    renderer.render(scene,camera)

    document.body.append(renderer.domElement)
}

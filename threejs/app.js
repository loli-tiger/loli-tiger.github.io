function updateHDRPreview(texture) {
    // 创建canvas绘制预览
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // 创建临时图像
    const image = new Image();
    image.onload = function() {
        // 清除预览区域
        while (previewArea.firstChild) {
            previewArea.removeChild(previewArea.firstChild);
        }
        
        // 创建预览图像
        const hdrPreview = new Image();
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        hdrPreview.src = canvas.toDataURL('image/jpeg');
        hdrPreview.style.width = '100%';
        hdrPreview.style.height = '100%';
        hdrPreview.style.objectFit = 'cover';
        previewArea.appendChild(hdrPreview);
    };
    
    // 使用默认图像作为预览
    image.src = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/equirectangular/venice_sunset_1k.hdr';
}

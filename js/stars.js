document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stars-canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        console.error('WebGL不受支持，使用備用星空');
        createFallbackStars();
        return;
    }

    // WebGL初始化及設置
    function initWebGL() {
        // 著色器代碼
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute float a_size;
            attribute float a_alpha;
            
            uniform vec2 u_resolution;
            
            varying float v_alpha;
            
            void main() {
                // 將像素座標轉換為 0.0 到 1.0
                vec2 zeroToOne = a_position / u_resolution;
                
                // 將座標從 0->1 轉換為 0->2
                vec2 zeroToTwo = zeroToOne * 2.0;
                
                // 將座標從 0->2 轉換為 -1->+1 (裁剪空間)
                vec2 clipSpace = zeroToTwo - 1.0;
                
                // WebGL中Y軸向上增長，但Canvas中向下增長
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                
                // 設置點的大小和透明度
                gl_PointSize = a_size;
                v_alpha = a_alpha;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            varying float v_alpha;
            
            void main() {
                // 計算到點中心的距離
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(gl_PointCoord, center);
                
                // 創建一個柔和的圓形點
                float alpha = smoothstep(0.5, 0.3, dist) * v_alpha;
                
                // 設置星星的顏色為白色，帶有透明度
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
            }
        `;

        // 創建並編譯著色器
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('著色器編譯錯誤:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        }

        // 創建著色器程序
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('無法初始化著色器程序:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    // 生成星星
    function createStars(count) {
        const positions = new Float32Array(count * 2); // x, y
        const sizes = new Float32Array(count);         // 大小
        const alphas = new Float32Array(count);        // 透明度
        
        for (let i = 0; i < count; i++) {
            const idx = i * 2;
            positions[idx] = Math.random() * canvas.width;
            positions[idx + 1] = Math.random() * canvas.height;
            
            // 大小變化
            sizes[i] = 1.0 + Math.random() * 3.0;
            
            // 透明度變化
            alphas[i] = 0.1 + Math.random() * 0.9;
        }
        
        return { positions, sizes, alphas };
    }

    // 更新星星動畫
    function updateStars(stars, time) {
        const { alphas } = stars;
        
        for (let i = 0; i < alphas.length; i++) {
            // 創建閃爍效果
            alphas[i] = 0.1 + (Math.sin(time * 0.001 + i * 0.1) * 0.5 + 0.5) * 0.9;
        }
    }

    // 設置 WebGL 繪製
    function setupWebGL() {
        // 初始化著色器程序
        const program = initWebGL();
        if (!program) return null;
        
        gl.useProgram(program);
        
        // 獲取屬性和 uniform 地址
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const sizeAttributeLocation = gl.getAttribLocation(program, 'a_size');
        const alphaAttributeLocation = gl.getAttribLocation(program, 'a_alpha');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        
        // 創建和綁定緩衝區
        const positionBuffer = gl.createBuffer();
        const sizeBuffer = gl.createBuffer();
        const alphaBuffer = gl.createBuffer();
        
        // 創建星星
        const numStars = 200;
        const stars = createStars(numStars);
        
        // 設置分辨率
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        
        // 繪製函數
        function draw(time) {
            // 調整畫布大小
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
            }
            
            // 更新星星
            updateStars(stars, time);
            
            // 清空畫布
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            // 綁定位置緩衝區並填充數據
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, stars.positions, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            
            // 綁定大小緩衝區並填充數據
            gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, stars.sizes, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(sizeAttributeLocation);
            gl.vertexAttribPointer(sizeAttributeLocation, 1, gl.FLOAT, false, 0, 0);
            
            // 綁定透明度緩衝區並填充數據
            gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, stars.alphas, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(alphaAttributeLocation);
            gl.vertexAttribPointer(alphaAttributeLocation, 1, gl.FLOAT, false, 0, 0);
            
            // 啟用混合模式
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            
            // 繪製點
            gl.drawArrays(gl.POINTS, 0, numStars);
            
            // 請求下一幀動畫
            requestAnimationFrame(draw);
        }
        
        return draw;
    }

    // 如果WebGL不可用則使用Canvas 2D作為備用
    function createFallbackStars() {
        const ctx = canvas.getContext('2d');
        const stars = [];
        const starCount = 150;
        
        // 創建星星
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 0.5 + Math.random() * 2,
                opacity: 0.1 + Math.random() * 0.9,
                speed: 0.01 + Math.random() * 0.05
            });
        }
        
        // 動畫函數
        function animate() {
            // 調整畫布大小
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }
            
            // 清空畫布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 繪製星星
            ctx.fillStyle = 'white';
            
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                
                // 閃爍效果
                star.opacity = 0.1 + (Math.sin(Date.now() * star.speed) * 0.5 + 0.5) * 0.9;
                
                ctx.beginPath();
                ctx.globalAlpha = star.opacity;
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    // 初始化
    const draw = setupWebGL();
    if (draw) {
        requestAnimationFrame(draw);
    }
}); 
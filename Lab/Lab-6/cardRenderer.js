const canvas = document.getElementById('glCanvas');
        const gl = canvas.getContext('webgl');
        const cardTexture = document.getElementById('cardTexture');

        if (!gl) {
            alert('WebGL not supported in your browser');
            throw new Error('WebGL not supported');
        }

        const imagePaths = [
            'image.jpeg',
            'image1.jpg',
            'image2.jpg'
        ];

        let currentImageIndex = 0;
        let currentTexture = null;

        // Shader sources
        const vsSource = `
            attribute vec4 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;
            void main() {
                gl_Position = aPosition;
                vTexCoord = aTexCoord;
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform sampler2D uTexture;
            uniform vec4 uColor;
            uniform bool uUseTexture;
            
            void main() {
                if (uUseTexture) {
                    gl_FragColor = texture2D(uTexture, vTexCoord);
                } else {
                    gl_FragColor = uColor;
                }
            }
        `;

        // Initialize shaders
        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        // Create and link shader program
        const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
        const shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(shaderProgram));
            throw new Error('Shader program failed to link');
        }

        // Get shader program info
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                position: gl.getAttribLocation(shaderProgram, 'aPosition'),
                texCoord: gl.getAttribLocation(shaderProgram, 'aTexCoord'),
            },
            uniformLocations: {
                texture: gl.getUniformLocation(shaderProgram, 'uTexture'),
                color: gl.getUniformLocation(shaderProgram, 'uColor'),
                useTexture: gl.getUniformLocation(shaderProgram, 'uUseTexture'),
            },
        };

        // Create vertex buffers
        const positions = new Float32Array([
            // Top half (textured)
            -0.8,  0.8,
             0.8,  0.8,
            -0.8,  0.0,
             0.8,  0.0,
            // Bottom half (colored)
            -0.8,  0.0,
             0.8,  0.0,
            -0.8, -0.8,
             0.8, -0.8,
        ]);

        const texCoords = new Float32Array([
            // Top half
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            // Bottom half
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ]);

        // Create and bind position buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        // Create and bind texture coordinate buffer
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        // Utility function for random color
        function getRandomColor() {
            return new Float32Array([
                Math.random(),
                Math.random(),
                Math.random(),
                1.0
            ]);
        }

        // Texture handling
        function loadTexture(imagePath) {
            if (currentTexture) {
                gl.deleteTexture(currentTexture);
            }

            currentTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, currentTexture);

            // Loading placeholder
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                          new Uint8Array([128, 128, 128, 255]));

            cardTexture.src = imagePath;

            cardTexture.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, currentTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cardTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                render();
            };

            cardTexture.onerror = () => {
                console.error('Error loading image');
            };
        }

        // Render function
        let currentColor = getRandomColor();

        function render() {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.9, 0.9, 0.9, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(programInfo.program);

            // Set up position attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.position);

            // Set up texture coordinate attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

            // Draw textured top half
            gl.uniform1i(programInfo.uniformLocations.useTexture, 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Draw colored bottom half
            gl.uniform1i(programInfo.uniformLocations.useTexture, 0);
            gl.uniform4fv(programInfo.uniformLocations.color, currentColor);
            gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
        }

        // Generate new card function
        function generateNewCard() {
            currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
            currentColor = getRandomColor();
            loadTexture(imagePaths[currentImageIndex]);
        }

        // Initial setup
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Add button click handler
        document.getElementById('refreshButton').addEventListener('click', generateNewCard);

        // Load initial card
        generateNewCard();
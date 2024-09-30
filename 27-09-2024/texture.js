function helloRectangle(gl, textures) {
    const canvas = document.getElementById('demo-canvas');
    if (!canvas) {
        showError('Could not find HTML canvas element - check for typos, or loading JavaScript file too early');
        return;
    }

    // Rectangle vertices with texture coordinates (x, y, u, v)
    const rectangleVertices = [
        // x, y, u, v
        -0.5, 0.5, 0.0, 1.0,   // Top left
        -0.5, -0.5, 0.0, 0.0,  // Bottom left
        0.5, -0.5, 1.0, 0.0,   // Bottom right
        0.5, 0.5, 1.0, 1.0     // Top right
    ];

    const rectangleIndices = [
        0, 1, 2,  // First triangle
        0, 2, 3   // Second triangle
    ];

    // Vertex buffer
    const rectangleGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangleVertices), gl.STATIC_DRAW);

    // Index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rectangleIndices), gl.STATIC_DRAW);

    // Vertex Shader with texture coordinates
    const vertexShaderSourceCode = `#version 300 es
    precision mediump float;
    in vec2 vertexPosition;
    in vec2 vertexTexCoord;
    out vec2 texCoord;
    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
        texCoord = vertexTexCoord;  // Pass texture coordinates to fragment shader
    }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        showError(`Failed to compile vertex shader: ${gl.getShaderInfoLog(vertexShader)}`);
        return;
    }

    // Fragment Shader for rendering textures
    const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;
    in vec2 texCoord;
    uniform sampler2D texture0;
    uniform sampler2D texture1;
    out vec4 outputColor;
    void main() {
        vec4 color0 = texture(texture0, texCoord);
        vec4 color1 = texture(texture1, texCoord);
        outputColor = color0 * color1;  // Combine textures
    }`;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        showError(`Failed to compile fragment shader: ${gl.getShaderInfoLog(fragmentShader)}`);
        return;
    }

    // Create program and link shaders
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        showError(`Failed to link GPU program: ${gl.getProgramInfoLog(program)}`);
        return;
    }

    gl.useProgram(program);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'vertexPosition');
    const texCoordLocation = gl.getAttribLocation(program, 'vertexTexCoord');
    const texture0Location = gl.getUniformLocation(program, 'texture0');
    const texture1Location = gl.getUniformLocation(program, 'texture1');

    // Bind vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleGeoBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 4 * 4, 0);  // 2 floats for position

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 4 * 4, 2 * 4);  // 2 floats for texture coordinates

    // Bind textures to texture units
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(texture0Location, 0);  // Assign texture unit 0

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(texture1Location, 1);  // Assign texture unit 1

    // Render the rectangle
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, rectangleIndices.length, gl.UNSIGNED_SHORT, 0);
}

function main() {
    loadImages([
        "/campnou",
        "/cyberpunk",
    ], function(images) {
        const canvas = document.getElementById('demo-canvas');
        const gl = canvas.getContext("webgl2");
        if (!gl) {
            showError('WebGL 2 is not supported');
            return;
        }

        // Upload the images as textures
        const textures = [];
        for (let i = 0; i < images.length; i++) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
            textures.push(texture);
        }

        // Render the rectangle with textures
        helloRectangle(gl, textures);
    });
}
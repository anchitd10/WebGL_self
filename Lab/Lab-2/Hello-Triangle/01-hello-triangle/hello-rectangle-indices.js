/** Helper method to output an error message to the screen */
function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

function helloRectangle() {
    // Setup WebGL Context
    const canvas = document.getElementById('demo-canvas');
    if (!canvas) {
        showError('Could not find HTML canvas element - check for typos, or loading JavaScript file too early');
        return;
    }
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        const isWebGl1Supported = !!(document.createElement('canvas')).getContext('webgl');
        if (isWebGl1Supported) {
            showError('WebGL 1 is supported, but not v2 - try using a different device or browser');
        } else {
            showError('WebGL is not supported on this device - try using a different device or browser');
        }
        return;
    }

    // Rectangle vertices
    const rectangleVertices = [
        -0.5, 0.5,   // Top left
        -0.5, -0.5,  // Bottom left
        0.5, -0.5,   // Bottom right
        0.5, 0.5     // Top right
    ];

    const rectangleIndices = [
        0, 1, 2,  // First triangle
        0, 2, 3   // Second triangle
    ];

    // const rectangleGeoCpuBuffer = new Float32Array(rectangleVertices);

    //vertex buffer
    const rectangleGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangleVertices), gl.STATIC_DRAW);
    // gl.bufferData(gl.ARRAY_BUFFER, rectangleGeoCpuBuffer, gl.STATIC_DRAW);

    //index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rectangleIndices), gl.STATIC_DRAW);


    // Vertex Shader
    const vertexShaderSourceCode = `#version 300 es
    precision mediump float;
    in vec2 vertexPosition;
    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
    }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        showError(`Failed to compile vertex shader: ${errorMessage}`);
        return;
    }

    // Fragment Shader
    const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;
    out vec4 outputColor;
    void main() {
        outputColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red color for rectangle
    }`;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(fragmentShader);
        showError(`Failed to compile fragment shader: ${errorMessage}`);
        return;
    }

    const helloRectangleProgram = gl.createProgram();
    gl.attachShader(helloRectangleProgram, vertexShader);
    gl.attachShader(helloRectangleProgram, fragmentShader);
    gl.linkProgram(helloRectangleProgram);
    if (!gl.getProgramParameter(helloRectangleProgram, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(helloRectangleProgram);
        showError(`Failed to link GPU program: ${errorMessage}`);
        return;
    }

    const vertexPositionAttributeLocation = gl.getAttribLocation(helloRectangleProgram, 'vertexPosition');
    if (vertexPositionAttributeLocation < 0) {
        showError(`Failed to get attribute location for vertexPosition`);
        return;
    }

    // Render
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Use the program and set up the attribute pointers
    gl.useProgram(helloRectangleProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleGeoBuffer);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    gl.vertexAttribPointer(
        vertexPositionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // Draw the rectangle
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, rectangleIndices.length, gl.UNSIGNED_SHORT, 0);
}

try {
    helloRectangle();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}

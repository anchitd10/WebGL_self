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

    // Devil Star vertices
    const starVertices = [
        0.0, 0.8,   // Top vertex
        -0.45, -0.45, // Bottom-left
        0.45, -0.45,  // Bottom-right
        -0.45, 0.45,  // Top-left
        0.45, 0.45,   // Top-right
        0.0, -0.8   // Bottom vertex
    ];

    const starIndices = [
        0, 1, 2,  //first triangle
        3, 4, 5   //second triangle
    ];

    // Diamond vertices
    const diamondVertices = [
        0.0, 0.8,   // top
        -0.5, 0.0,  // left
        0.0, -0.8,  // bottom
        0.5, 0.0    // right
    ];

    const diamondIndices = [
        0, 1, 3,  //top
        1, 2, 3   //bottom
    ];

    // const rectangleGeoCpuBuffer = new Float32Array(rectangleVertices);

    //star vertex buffer
    const starGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starVertices), gl.STATIC_DRAW);
    // gl.bufferData(gl.ARRAY_BUFFER, rectangleGeoCpuBuffer, gl.STATIC_DRAW);

    //star index buffer
    const starIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, starIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(starIndices), gl.STATIC_DRAW);

    //diamond vertex buffer
    const diamondGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, diamondGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diamondVertices), gl.STATIC_DRAW);
    // gl.bufferData(gl.ARRAY_BUFFER, rectangleGeoCpuBuffer, gl.STATIC_DRAW);

    //star index buffer
    const diamondIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diamondIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(diamondIndices), gl.STATIC_DRAW);


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

    const starDiamondProgram = gl.createProgram();
    gl.attachShader(starDiamondProgram, vertexShader);
    gl.attachShader(starDiamondProgram, fragmentShader);
    gl.linkProgram(starDiamondProgram);
    if (!gl.getProgramParameter(starDiamondProgram, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(starDiamondProgram);
        showError(`Failed to link GPU program: ${errorMessage}`);
        return;
    }

    const vertexPositionAttributeLocation = gl.getAttribLocation(starDiamondProgram, 'vertexPosition');
    if (vertexPositionAttributeLocation < 0) {
        showError(`Failed to get attribute location for vertexPosition`);
        return;
    }

    // Render
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.viewport(0, 0, canvas.width, canvas.height);

   // Draw devil star in the top half
    gl.viewport(0, canvas.height / 2, canvas.width, canvas.height / 2);  //first two arguments are start x-y coordinates adn the next two are the height and width to be used
    gl.useProgram(starDiamondProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, starGeoBuffer);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    gl.vertexAttribPointer(
        vertexPositionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, starIndexBuffer);
    gl.drawElements(gl.TRIANGLES, starIndices.length, gl.UNSIGNED_SHORT, 0);

    // Draw diamond in the bottom half
    gl.viewport(0, 0, canvas.width, canvas.height / 2);
    gl.useProgram(starDiamondProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, diamondGeoBuffer);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    gl.vertexAttribPointer(
        vertexPositionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diamondIndexBuffer);
    gl.drawElements(gl.TRIANGLES, diamondIndices.length, gl.UNSIGNED_SHORT, 0);
}

try {
    helloRectangle();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}

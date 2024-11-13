// Vertex Shader Code
var vertexShaderText = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;

    void main() {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
`;

// Fragment Shader Code
var fragmentShaderText = `
    precision mediump float;
    varying vec3 fragColor;

    void main() {
        gl_FragColor = vec4(fragColor, 1.0);
    }
`;

// Main display function code
var gl, program;
var allTriangles = []; // To store all triangles' vertices

var InitDemo = function() {
    console.log("This is working");

    var canvas = document.getElementById('game-surface');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.log("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert("WebGL not supported");
        return;
    }

    canvas.width = 800;
    canvas.height = 600;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.75, 0.85, 0.8, 1.0); // Set clear color to light blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Get shader code from above
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    // Compile the shader code
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling vertexShader", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling fragmentShader", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR linking program", gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("ERROR validating program", gl.getProgramInfoLog(program));
    }
};

// Function to draw the triangle based on user input
function drawUserTriangle() {
    var x1 = parseFloat(document.getElementById('x1').value);
    var y1 = parseFloat(document.getElementById('y1').value);
    var x2 = parseFloat(document.getElementById('x2').value);
    var y2 = parseFloat(document.getElementById('y2').value);
    var x3 = parseFloat(document.getElementById('x3').value);
    var y3 = parseFloat(document.getElementById('y3').value);

    var r = parseFloat(document.getElementById('r').value);
    var g = parseFloat(document.getElementById('g').value);
    var b = parseFloat(document.getElementById('b').value);

    // Store the new triangle's vertices
    var triangleVertices = [
        x1, y1, r, g, b,
        x2, y2, r, g, b,
        x3, y3, r, g, b
    ];

    allTriangles.push(triangleVertices); // Add the new triangle to the array

    // Clear the canvas and render all triangles
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create and bind the buffer for all triangles
    var triangleVerticesBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBufferObject);

    // Flatten the array of all triangles into one array for WebGL to render
    var flattenedVertices = new Float32Array(allTriangles.flat());
    gl.bufferData(gl.ARRAY_BUFFER, flattenedVertices, gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var colorAttribLocation = gl.getAttribLocation(program, "vertColor");

    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Main render loop to draw all triangles
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, flattenedVertices.length / 5);
}

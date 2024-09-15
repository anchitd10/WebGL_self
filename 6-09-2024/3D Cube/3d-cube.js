// Helper function to flatten a 2D array
function flatten(arr) {
    return new Float32Array(arr.flat());
}

// Cube vertices and colors
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ), 
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// var vertices = [
//     glMatrix.vec4.fromValues(-0.5, -0.5,  0.5, 1.0),
//     glMatrix.vec4.fromValues(-0.5,  0.5,  0.5, 1.0), 
//     glMatrix.vec4.fromValues( 0.5,  0.5,  0.5, 1.0),
//     glMatrix.vec4.fromValues( 0.5, -0.5,  0.5, 1.0),
//     glMatrix.vec4.fromValues(-0.5, -0.5, -0.5, 1.0),
//     glMatrix.vec4.fromValues(-0.5,  0.5, -0.5, 1.0),
//     glMatrix.vec4.fromValues( 0.5,  0.5, -0.5, 1.0),
//     glMatrix.vec4.fromValues( 0.5, -0.5, -0.5, 1.0)
// ];


var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];


const points = [];
const colors = [];

// Define a quad face
function quad(a, b, c, d) {
    const indices = [a, b, c, a, c, d];
    for (let i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]); // Use solid color
    }
}

// Define the cube
function colorCube() {
    quad(1, 0, 3, 2);  // Front
    quad(2, 3, 7, 6);  // Top
    quad(3, 0, 4, 7);  // Bottom
    quad(6, 5, 1, 2);  // Left
    quad(4, 5, 6, 7);  // Back
    quad(5, 4, 0, 1);  // Right
}

// Initialize shaders and buffers
function init() {
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    // gl.disable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Vertex Shader Source
    const vertexShaderSource = `
        attribute vec4 vPosition;
        attribute vec4 vColor;
        varying vec4 fColor;
        uniform mat4 uModelViewProjectionMatrix; // Uniform matrix

        void main() {
            fColor = vColor;
            gl_Position = vPosition;
            gl_Position = uModelViewProjectionMatrix * vPosition; // Apply the identity matrix
        }
    `;

    // Fragment Shader Source
    const fragmentShaderSource = `
        precision mediump float;
        varying vec4 fColor;

        void main() {
            gl_FragColor = fColor;
        }
    `;

    function initShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    function initProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('An error occurred linking the program:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    // Compile shaders and link the program
    const vertexShader = initShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = initProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        return; // Exit if shader compilation or linking failed
    }
    gl.useProgram(program);

    colorCube(); // Generate cube vertices and colors

    // Initialize buffers
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Get attribute locations
    const positionLocation = gl.getAttribLocation(program, 'vPosition');
    const colorLocation = gl.getAttribLocation(program, 'vColor');

    // Set up vertex attribute pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); // Enable depth test for 3D rendering

    // Get the location of the uniform matrix in the shader
    const mvpMatrixLocation = gl.getUniformLocation(program, 'uModelViewProjectionMatrix');

    // Create an identity matrix
    const identityMatrix = mat4.create();

    // Pass the identity matrix to the shader
    gl.uniformMatrix4fv(mvpMatrixLocation, false, identityMatrix);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
        requestAnimationFrame(render);
    }

    render();
}

// Start the WebGL application
window.onload = init;

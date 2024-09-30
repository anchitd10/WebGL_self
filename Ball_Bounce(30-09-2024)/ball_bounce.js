// Helper method to output an error message to the screen
function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

function initBallBounce() {
    const canvas = document.getElementById('demo-canvas');
    const scoreDisplay = document.getElementById('score');
    if (!canvas) {
        showError('Canvas element not found');
        return;
    }

    const gl = canvas.getContext('webgl2');
    if (!gl) {
        showError('WebGL not supported');
        return;
    }

    let score = 0;
    const ballRadius = 20;
    const ballPosition = [400, 400]; // Initial ball position
    let velocity = [2, 3]; // Ball velocity (x and y directions)

    // Vertex shader for rendering a single point (ball)
    const vertexShaderSource = `#version 300 es
    precision mediump float;
    in vec2 a_position;
    uniform vec2 u_resolution;
    void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = ${ballRadius * 2}.0; // Adjust point size for the ball
    }`;

    // Fragment shader to render a circle instead of a rectangle
    const fragmentShaderSource = `#version 300 es
    precision mediump float;
    out vec4 outColor;
    
    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5, 0.5);
        float distanceFromCenter = length(coord);
        if (distanceFromCenter > 0.5) {
            discard; // Discard pixel
        }
        outColor = vec4(0.0, 0.7, 0.3, 1.0); // Green color
    }`;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Render loop to animate the ball
    function render() {
        // Update ball position based on velocity
        ballPosition[0] += velocity[0];
        ballPosition[1] += velocity[1];

        // Check for collision with the canvas edges and bounce
        if (ballPosition[0] - ballRadius <= 0 || ballPosition[0] + ballRadius >= canvas.width) {
            velocity[0] *= -1;
        }
        if (ballPosition[1] - ballRadius <= 0 || ballPosition[1] + ballRadius >= canvas.height) {
            velocity[1] *= -1;
        }

        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use the program
        gl.useProgram(program);

        // Set the resolution uniform
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        // Set the ball's new position
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballPosition), gl.STATIC_DRAW);

        // Enable the attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw the ball as a single point
        gl.drawArrays(gl.POINTS, 0, 1);

        // Request next frame
        requestAnimationFrame(render);
    }

    // Listen for clicks on the canvas
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if the click was inside the ball's radius
        const dx = x - ballPosition[0];
        const dy = y - ballPosition[1];
        if (dx * dx + dy * dy <= ballRadius * ballRadius) {
            score++;
            scoreDisplay.innerText = `Score: ${score}`;
        }
    });

    // Start rendering
    requestAnimationFrame(render);
}

// Create shader helper function
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        showError('Shader compile failed: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create program helper function
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        showError('Program link failed: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// Initialize the ball bounce animation
try {
    initBallBounce();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}

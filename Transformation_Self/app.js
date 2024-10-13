// vertexShader Code
var vertexShaderText = 
[
    'precision mediump float;',
    '',
    'attribute vec2 vertPosition;',
    'attribute vec3 vertColor;',
    'varying vec3 fragColor;',
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProjection;',
    '',
    'void main()',
    '{',
    '   fragColor = vertColor;',
    '   gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 0.0, 1.0);',
    '}'
].join('\n');
//order matters---->right to left
//screen coords(projection), camera(view), coords for model(world)
//projecion * view * world(order)

//fragmentShader Code
var fragmentShaderText = 
[
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    'void main()',
    '{',
    '   gl_FragColor = vec4(fragColor, 1.0);',
    '}'
].join('\n');



// main display function code
var InitDemo = function(){
    console.log("This is working");

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');

    if(!gl){
        console.log("Webgl not supported, falling back on experimental-webgl");
        gl = canvas.getContext('experimental-webgl');
    }

    if(!gl){
        alert("Webgl not supported");
    }


    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //get shadercode from above
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    //compile the shader code
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling vertexShader", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling fragmentShader", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("ERROR linking program", gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error("ERROR validating program", gl.getProgramInfoLog(program));
        return;
    }


    //create buffer to display
    var triangleVertices =
    [  //X,  Y,   z             R     G     B
        0.0, 0.5, 0.0,        1.0,  1.0,  0.0,
        -0.5, -0.5, 0.0,      0.7,  0.0,  1.0,
        0.5, -0.5, 0.0,       0.1,  1.0,  0.6
    ];

    //send information to graphics card
    var triangleVerticesBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttriblocation = gl.getAttribLocation(program, "vertPosition");
    var colorAttriblocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        positionAttriblocation,  //attribute location
        3,   //number of elements
        gl.FLOAT,  //type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,     // size of an individual vertex(stride: specifies in how many next parameters we will begin the next vertex)
        0     // offset from the beginning of single vertex data in triangleVertices to this attribute
    );

    gl.vertexAttribPointer(
        colorAttriblocation,  //attribute location
        3,   //number of elements
        gl.FLOAT,  //type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,     // size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT     // offset from the beginning of single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttriblocation);
    gl.enableVertexAttribArray(colorAttriblocation);

    //specify which program is being used
    gl.useProgram(program);

    //specify location for the spaces in the GPU
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjectionUniformLocation = gl.getUniformLocation(program, 'mProjection');

    //create identity matrices
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    // initial identity matrices
    // mat4.identity(worldMatrix);
    // mat4.identity(viewMatrix);
    // mat4.identity(projMatrix);

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
    //                   user's place, point to center, y-axis is pointng up
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjectionUniformLocation, gl.FALSE, projMatrix);


    //Main render loop

    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function(){
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        // milliseconds since window started
        // divided by 1000 to convert to milliseconds
        // one full rotation every 6 seconds

        mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]); // rotate worldMatrix about identityMarix by angle in particulat axis
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);  //update the worldMatrix

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);   // (primitive, vertices to skip(step), number of vertices to draw)

};
// vertexShader Code
var vertexShaderText = 
[
    'precision mediump float;',
    '',
    'attribute vec2 vertPosition;',
    'attribute vec3 vertColor;',
    'varying vec3 fragColor;',
    '',
    'void main()',
    '{',
    '   fragColor = vertColor;',
    '   gl_Position = vec4(vertPosition, 0.0, 1.0);',
    '}'
].join('\n');

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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

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
    [  //X,  Y             R     G     B
        0.0, 0.5,         1.0,  1.0,  0.0,
        -0.5, -0.5,       0.7,  0.0,  1.0,
        0.5, -0.5,        0.1,  1.0,  0.6
    ];

    //send information to graphics card
    var triangleVerticesBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttriblocation = gl.getAttribLocation(program, "vertPosition");
    var colorAttriblocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        positionAttriblocation,  //attribute location
        2,   //number of elements
        gl.FLOAT,  //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,     // size of an individual vertex(stride: specifies in how many next parameters we will begin the next vertex)
        0     // offset from the beginning of single vertex data in triangleVertices to this attribute
    );

    gl.vertexAttribPointer(
        colorAttriblocation,  //attribute location
        3,   //number of elements
        gl.FLOAT,  //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,     // size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT     // offset from the beginning of single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttriblocation);
    gl.enableVertexAttribArray(colorAttriblocation);


    //Main render loop
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);   // (primitive, vertices to skip(step), number of vertices to draw)

};
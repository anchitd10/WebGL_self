// vertexShader Code
var vertexShaderText = 
[
    'precision mediump float;',
    '',
    'attribute vec3 vertPosition;',
    'attribute vec2 vertTexCoord;',
    'varying vec2 fragTexCoord;',
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProjection;',
    '',
    'void main()',
    '{',
    '   fragTexCoord = vertTexCoord;',
    '   gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 1.0);',
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
    'varying vec2 fragTexCoord;',
    'uniform sampler2D sampler;',
    '',
    'void main()',
    '{',
    '   gl_FragColor = texture2D(sampler, fragTexCoord);',
    '}'
].join('\n');

var gl;

// main display function code
var InitDemo = function(){
    console.log("This is working");

    var canvas = document.getElementById('game-surface');
    gl = canvas.getContext('webgl');

    if(!gl){
        console.log("Webgl not supported, falling back on experimental-webgl");
        gl = canvas.getContext('experimental-webgl');
    }

    if(!gl){
        alert("Webgl not supported");
    }


    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);


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
    var boxVertices = 
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,  

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   0, 1,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		// Right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		// Front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		// Back
		1.0, 1.0, -1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

    //send information to graphics card
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
    gl.vertexAttribPointer(
        positionAttribLocation,  //attribute location
        3,   //number of elements
        gl.FLOAT,  //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,     // size of an individual vertex(stride: specifies in how many next parameters we will begin the next vertex)
        0     // offset from the beginning of single vertex data in triangleVertices to this attribute
    );

    gl.vertexAttribPointer(
        texCoordAttribLocation,  //attribute location
        2,   //number of elements
        gl.FLOAT,  //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,     // size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT     // offset from the beginning of single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);


    //-------------create texture------------------
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('crate-image')
    );
    
    gl.bindTexture(gl.TEXTURE_2D, null);


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
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    //                   user's place, point to center, y-axis is pointng up
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjectionUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    
    //--------Main render loop

    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function(){
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        // milliseconds since window started
        // divided by 1000 to convert to milliseconds
        // one full rotation every 6 seconds

        // mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]); // rotate worldMatrix about identityMarix by angle in particulat axis
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1,0,0]);
        mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);  //update the worldMatrix

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);   // (primitive, vertices to skip(step), number of vertices to draw)

};
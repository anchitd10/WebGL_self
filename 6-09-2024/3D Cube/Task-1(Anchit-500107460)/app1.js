var vertexShaderText =
	[
		'precision mediump float;',
		'',
		'attribute vec3 vertPosition;',
		'attribute vec3 vertColor;',
		'varying vec3 fragColor;',
		'uniform mat4 mWorld;',
		'uniform mat4 mView;',
		'uniform mat4 mProj;',
		'',
		'void main()',
		'{',
		'  fragColor = vertColor;',
		'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
		'}'
	].join('\n');

var fragmentShaderText =
	[
		'precision mediump float;',
		'',
		'varying vec3 fragColor;',
		'void main()',
		'{',
		'  gl_FragColor = vec4(fragColor, 1.0);',
		'}'
	].join('\n');

var InitDemo = function () {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);
	gl.disable(gl.CULL_FACE);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}


	var boxVertices = [
		// Front Face
		-1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // Bottom Left
		1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // Bottom Right
		1.0, 1.0, 1.0, 1.0, 0.0, 0.0, // Top Right
		-1.0, 1.0, 1.0, 1.0, 0.0, 0.0, // Top Left

		/// Back Face
		-1.0, -1.0, -1.0, 0.0, 1.0, 0.0, // Bottom Left
		1.0, -1.0, -1.0, 0.0, 1.0, 0.0, // Bottom Right
		1.0, 1.0, -1.0, 0.0, 1.0, 0.0, // Top Right
		-1.0, 1.0, -1.0, 0.0, 1.0, 0.0, // Top Left

		// Top Face
		-1.0, 1.0, 1.0, 1.0, 1.0, 0.0, // Top Front Left
		1.0, 1.0, 1.0, 1.0, 1.0, 0.0, // Top Front Right
		1.0, 1.0, -1.0, 1.0, 1.0, 0.0, // Top Back Right
		-1.0, 1.0, -1.0, 1.0, 1.0, 0.0, // Top Back Left

		// Bottom Face
		-1.0, -1.0, 1.0, 0.0, 1.0, 1.0, // Bottom Front Left
		1.0, -1.0, 1.0, 0.0, 1.0, 1.0, // Bottom Front Right
		1.0, -1.0, -1.0, 0.0, 1.0, 1.0, // Bottom Back Right
		-1.0, -1.0, -1.0, 0.0, 1.0, 1.0, // Bottom Back Left

		// Right Face
		1.0, -1.0, 1.0, 1.0, 0.0, 1.0, // Bottom Front Right
		1.0, -1.0, -1.0, 1.0, 0.0, 1.0, // Bottom Back Right
		1.0, 1.0, -1.0, 1.0, 0.0, 1.0, // Top Back Right
		1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // Top Front Right

		// Left Face
		-1.0, -1.0, 1.0, 0.0, 1.0, 0.0, // Bottom Front Left
		-1.0, -1.0, -1.0, 0.0, 1.0, 0.0, // Bottom Back Left
		-1.0, 1.0, -1.0, 0.0, 1.0, 0.0, // Top Back Left
		-1.0, 1.0, 1.0, 0.0, 1.0, 0.0, // Top Front Left
	];

	var boxIndices = [
		// Front Face
		0, 1, 2,
		0, 2, 3,

		// Back Face
		4, 5, 6,
		4, 6, 7,

		// Top Face
		8, 9, 10,
		8, 10, 11,

		// Bottom Face
		12, 13, 14,
		12, 14, 15,

		// Right Face
		16, 17, 18,
		16, 18, 19,

		// Left Face
		20, 21, 22,
		20, 22, 23
	];



	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [2, 2, -8], [0, 0, 0], [0, 1, 0]); // mat4.lookAt function positions the camera at (2, 2, -8), looking at the origin (0, 0, 0), with the up direction set to (0, 1, 0) (y-axis).
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
};

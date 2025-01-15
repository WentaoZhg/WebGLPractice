class CurveDrawer {
    constructor() {

        this.prog = InitShaderProgram(curvesVS, curvesFS);

        this.t = gl.getAttribLocation(this.prog, 't');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        this.p0 = gl.getUniformLocation(this.prog, 'p0');
        this.p1 = gl.getUniformLocation(this.prog, 'p1');
        this.p2 = gl.getUniformLocation(this.prog, 'p2');
        this.p3 = gl.getUniformLocation(this.prog, 'p3');

        // Initialize the attribute buffer
        this.steps = 100;
        var tv = [];
        for (var i = 0; i < this.steps; ++i) {
            tv.push(i / (this.steps - 1));
        }

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);

    }

    setViewport(width, height) {

        gl.useProgram(this.prog);
        let tMatrix = [2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1];
        gl.uniformMatrix4fv(this.mvp, false, tMatrix)

    }

    updatePoints(pt) {

        let p = [];
        for (let i = 0; i < pt.length; ++i) {
            let x = pt[i].getAttribute('cx');
            let y = pt[i].getAttribute('cy');
            p.push([x, y]);
        }

        gl.uniform2fv(this.p0, p[0]);
        gl.uniform2fv(this.p1, p[1]);
        gl.uniform2fv(this.p2, p[2]);
        gl.uniform2fv(this.p3, p[3]);

    }

    draw() {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(this.t, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.t);

        gl.drawArrays(gl.LINE_STRIP, 0, this.steps);

    }
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		// Bezier curve equation
		float u = pow((1.0 - t),3.0) ;
		float v = pow((1.0 - t),2.0);
		float x = u * p0.x + 3.0 * v * t * p1.x + 3.0 * (1.0 - t) * pow(t,2.0) * p2.x + pow(t,3.0) * p3.x;
		float y = u * p0.y + 3.0 * v * t * p1.y + 3.0 * (1.0 - t) * pow(t,2.0) * p2.y + pow(t,3.0) * p3.y;
    gl_Position = mvp * vec4(x, y, 0.0, 1.0);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;
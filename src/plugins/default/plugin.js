if (window.__bg_engine_plugin) {
    console.error("plugin alreayd exists")
}
window.__bg_engine_plugin = function() {
    if (!window.__bg_engine_plugin_settings) {
        console.error("missing plugin settings")
    }

    const {color} = __bg_engine_plugin_settings()


    const vertexShader = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0); 
    }
    `

    const fragmentShader = `
    precision highp float;
    // precision mediump float;

    uniform vec3 u_color;
    uniform float u_time;

    void main() {
        gl_FragColor = vec4(u_color * (sin(u_time/1000.0)*0.5 + 0.5), 1.0); 
    }
    `

    const addUniforms = function(gl, shaderProgram) {
        // Get a reference to the "u_color" variable of the vertex shader,
        // which we'll connect with the color parameter sent to this function
        var sh_color = gl.getUniformLocation(shaderProgram, "u_color");
        gl.uniform3f(sh_color, ...color);
        
        var sh_time = gl.getUniformLocation(shaderProgram, "u_time");
        gl.uniform1f(sh_time, performance.now())
    }

    return {
        vertexShader,
        fragmentShader,
        addUniforms,
        timeUpdating: true
    }
}


const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const CANVAS_CLASS = "bg-engine-fullpage"
let $canvas = $("." + CANVAS_CLASS);
if (!$canvas) {
    $canvas = document.createElement("canvas")
    $canvas.classList.add(CANVAS_CLASS)
    document.body.prepend($canvas)
}


const style = `.bg-engine-fullpage {
    position: fixed;
    z-index: -999;
}`


addStyle(style)

const gl = $canvas.getContext("webgl2")
if (!gl) { console.log("Unable to initialize WebGL. Your browser may not support it."); }

let sizeDirty = true;
const fitSize = function() {
    $canvas.width = window.innerWidth
    $canvas.height = window.innerHeight

    gl.viewportWidth = $canvas.width;
    gl.viewportHeight = $canvas.height;

    sizeDirty  = true
}

fitSize()
init()
window.addEventListener("resize", debounce(fitSize, 100))






/* https://sites.google.com/site/progyumming/javascript/shortest-webgl */
function init() {
    var {vertexShader, fragmentShader, addUniforms, timeUpdating} = window.__bg_engine_plugin()
    var shaderProgram = buildShaderProgram(gl, vertexShader, fragmentShader)
    gl.useProgram(shaderProgram);
    
    // Draw the object given a set of 2D points, in this case a square
    const draw = () => {
        if (sizeDirty || timeUpdating) {
            drawObject(gl, shaderProgram, 2, addUniforms, [
                -0.5, -0.5,
                0.5, -0.5,
                -0.5,  0.5,
                0.5,  0.5
                // -1, -1,
                // 1,-1,
                // -1, 1,
                // 1, 1
            ]);
        }
        requestAnimationFrame(draw)
    }
    draw()
}

// Create a GLSL shader program given:
// - a WebGL context,
// - a string for the vertex shader, and
// - a string for the fragment shader.
function buildShaderProgram(gl, vertShaderSrc, fragShaderSrc) {
    function buildShader(type, source) {
        var sh;
        if (type == "fragment")
            sh = gl.createShader(gl.FRAGMENT_SHADER);
        else if (type == "vertex")
            sh = gl.createShader(gl.VERTEX_SHADER);
        else // Unknown shader type
            return null;
        gl.shaderSource(sh, source);
        gl.compileShader(sh);
        // See if it compiled successfully
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            console.log("An error occurred compiling the " + type +
            " shader: " + gl.getShaderInfoLog(sh));
            return null;
        } else { return sh; }
    };
    
    var prog = gl.createProgram();
    gl.attachShader(prog, buildShader('vertex', vertShaderSrc));
    gl.attachShader(prog, buildShader('fragment', fragShaderSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Could not link the shader program!";
    }
    return prog;
}

// Draw an object given a shader program and a list of vertices
function drawObject(gl, shaderProgram, coordDimensions, addUniforms, vertexCoords) {
    // Create a buffer and put a single clipspace rectangle in it (2 triangles)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);// Set this buffer as the current one for the next buffer operations
    // Fill the buffer with the triangles.
    // STATIC_DRAW states that we are only going to write to this buffer very infrequently
    // so the system can optimise for this situation.
    // It doesn't stop us from writing to the buffer again,
    // but it might not be as efficient.
    // See http://stackoverflow.com/q/16462517 for more details.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoords), gl.STATIC_DRAW);
    // Get a reference to the "a_position" variable of the vertex shader,
    // which we'll connect with the 3D vertex data now stored in the current WebGL buffer.
    var sh_position = gl.getAttribLocation(shaderProgram, "a_position");
    // Enable the a_position vertex attribute for rendering
    // All client-side capabilities are disabled by default,
    // including all vertex attribute arrays.
    gl.enableVertexAttribArray(sh_position);
    // Specify the data structure of the array that will be used to store the vertex position data.
    // The parameters indicate that the vertexPos attribute is:
    // - a list of elements with 2 components each (2D vertices) 
    // - of type gl.Float
    // - and they should be un-normalized.
    // The final two parameters are rarely used.
    // The first specifies the stride of the data i.e. the amount of storage allocated to each element
    // and the second specifies the offset i.e. where the data starts.
    // For standard JavaScript arrays both are set to zero to indicate tight packing and no offset.
    gl.vertexAttribPointer(sh_position, coordDimensions, gl.FLOAT, false, 0, 0);

    addUniforms(gl, shaderProgram)

    // Set black as the background color
    
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0, 0, 0, 1); // defaults to white (1,1,1)
    // Manually clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    // draw the array set as current by the bindBuffer() command.
    // - parameter 1: how the vertices are to be grouped into geometric primitives.
    //   TRIANGLES requires a full set of 3 vertices for each triangle,
    //   so the common vertices need to be repeated;
    //   TRIANGLE_STRIP reuses the last 3 vertices, so if the triangles are connected,
    //   this only requires each vertex to be specified once.
    //   See https://www.khronos.org/message_boards/showthread.php/7292-Different-drawArrays-modes-in-WebGL#post23621
    // - Parameter 2: on what index to start
    // - Parameter 3: how many vertices to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCoords.length/coordDimensions);
}


function debounce(func, duration) {
    let timeout
    return function (...args) {
    const effect = () => {
        timeout = null
        return func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(effect, duration)
    }
}

function addStyle(styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
};
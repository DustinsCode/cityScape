/**
 * Created by Hans Dulimarta.
 *
 * Modified by Dustin Thurston 2/14/18
 */
let canvas
let gl;
let allObjs = [];

var projUnif;
var projMat, viewMat;

let camera = mat4.create();

function main() {
    canvas = document.getElementById("my-canvas");

    /* setup window resize listener */
    window.addEventListener('resize', resizeWindow);

    gl = WebGLUtils.create3DContext(canvas, null);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then (prog => {

        /* put all one-time initialization logic here */
        gl.useProgram (prog);
    gl.clearColor (0, 0, 0, 1);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

    /* the vertex shader defines TWO attribute vars and ONE uniform var */
    let posAttr = gl.getAttribLocation (prog, "vertexPos");
    let colAttr = gl.getAttribLocation (prog, "vertexCol");
    Object3D.linkShaderAttrib({
        positionAttr: posAttr,
        colorAttr: colAttr
    });
    let modelUnif = gl.getUniformLocation (prog, "modelCF");
    projUnif = gl.getUniformLocation (prog, "projection");
    viewUnif = gl.getUniformLocation (prog, "view");
    Object3D.linkShaderUniform({
        projection: projUnif,
        view: viewUnif,
        model: modelUnif
    });
    gl.enableVertexAttribArray (posAttr);
    gl.enableVertexAttribArray (colAttr);
    projMat = mat4.create();
    gl.uniformMatrix4fv (projUnif, false, projMat);
    viewMat = mat4.lookAt(mat4.create(),
        vec3.fromValues (-1, -1, 2),  // eye coord
        vec3.fromValues (0.5, 0.5, 1),  // gaze point
        vec3.fromValues (0, 0, 1)   // Z is up
    );
    gl.uniformMatrix4fv (viewUnif, false, viewMat);

    /* recalculate new viewport */
    resizeWindow();

    createObject();

    window.addEventListener('keydown', event => {
        let key = String.fromCharCode(event.keyCode);
       switch(key){
           case 'W':   //forward
               mat4.invert(camera, viewMat);
               mat4.translate(camera, camera, vec3.fromValues(0,0, -.1/2));
               mat4.invert(viewMat, camera);
               break;
           case 'S':   //backward
               mat4.invert(camera, viewMat);
               mat4.translate(camera, camera, vec3.fromValues(0,0, .1/2));
               mat4.invert(viewMat, camera);
               break;
           case 'A':   //yaw left
               mat4.invert(camera, viewMat);
               mat4.rotateY(camera, camera, .1/2);
               mat4.invert(viewMat, camera);
               break;
           case 'D':   //yaw right
               mat4.invert(camera, viewMat);
               mat4.rotateY(camera, camera, -.1/2);
               mat4.invert(viewMat, camera);
               break;
           case 'E':   //pitch up
               mat4.invert(camera, viewMat);
               mat4.rotateX(camera, camera, .1/2);
               mat4.invert(viewMat, camera);
               break;
           case 'Q':  //pitch down
               mat4.invert(camera, viewMat);
               mat4.rotateX(camera, camera, -.1/2);
               mat4.invert(viewMat, camera);
               break;
           case 'J':  //roll left
               mat4.invert(camera, viewMat);
               mat4.rotateZ(camera, camera, .1/2);
               mat4.invert(viewMat, camera);
               break;
           case 'L':  //roll right
               mat4.invert(camera, viewMat);
               mat4.rotateZ(camera, camera, -.1/2);
               mat4.invert(viewMat, camera);
               break;
           case 'I':
               mat4.invert(camera, viewMat);
               mat4.translate(camera, camera, vec3.fromValues(0,.1/2, 0));
               mat4.invert(viewMat, camera);
               break;
           case 'K':
               mat4.invert(camera, viewMat);
               mat4.translate(camera, camera, vec3.fromValues(0,-.1/2, 0));
               mat4.invert(viewMat, camera);
               break;
           case 'U':
               mat4.invert(camera, viewMat);
               mat4.translate(camera, camera, vec3.fromValues(-.1/2,0, 0));
               mat4.invert(viewMat, camera);
               break;
           case 'O':
               mat4.invert(camera, viewMat);
               mat4.translate(camera, camera, vec3.fromValues(.1/2,0, 0));
               mat4.invert(viewMat, camera);
               break;
       }

       gl.uniformMatrix4fv(viewUnif, false, viewMat);
       window.requestAnimFrame(drawScene);
    });

    /* initiate the render request */
    window.requestAnimFrame(drawScene);


});
}

function drawScene() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    /* in the following three cases we rotate the coordinate frame by 1 degree */
    for (var k = 0; k<allObjs.length; k++)
        allObjs[k].draw(gl);

}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(max, min) {
    return Math.floor(Math.random() * Math.floor(max))+min;
}

function createObject() {


    for(var i = 0; i < 10; i ++) {

        for(var j = 0; j<10; j++) {
            let chance = Math.random();
            //1/3 chance to get either a polygonal prism, a cone, or a "sphere" (if it worked :/ )
            if(chance <= 0.333333) {
                let obj = new PolygonalPrism(gl,
                    {
                        topRadius: getRandomArbitrary(0.0, 0.4),
                        bottomRadius: getRandomArbitrary(0.0, 0.4),
                        numSides: getRandomInt(6,4),
                        height: getRandomArbitrary(0.5, 2.0),
                        //topColor: vec3.fromValues(1,0,0),
                        //bottomColor: vec3.fromValues(1,1,1)
                    });
                mat4.translate (obj.coordFrame, obj.coordFrame, vec3.fromValues(i , j, 0));
                allObjs.push(obj);
            }else if(chance >0.333333 && chance <= 0.666666) {

                let obj = new Cone(gl, {
                    radius: getRandomArbitrary(0.1, 0.3),
                    height: getRandomArbitrary(0.5, 2.0)
                });
                mat4.translate (obj.coordFrame, obj.coordFrame, vec3.fromValues(i, j, 0));
                allObjs.push(obj);
            }else{
                let obj = new Sphere(gl,0.5,1);

                mat4.translate (obj.coordFrame, obj.coordFrame, vec3.fromValues(i, j, 0));
                allObjs.push(obj);
            }

        }
    }
}


function resizeWindow() {
    let w = window.innerWidth - 16;
    let h = 0.75 * window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    mat4.perspective (projMat, glMatrix.toRadian(60), w/h, 0.05, 20);
    gl.uniformMatrix4fv (projUnif, false, projMat);
    gl.viewport(0, 0, w, h);
}
/**
 * Created by Hans Dulimarta on 2/1/17.
 *
 * Modified by Dustin Thurston 2/14/18
 */
class Sphere extends Object3D {
    /**
     * Create a 3D sphere with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} RADIUS  radius of the sphere
     * @param {Number} subDiv number of recursive subdivisions
     * @param {vec3}   [col1]    color #1 to use
     */
    constructor (gl, RADIUS, subDiv, col1) {
        super(gl);
        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());

        this.RADIUS = RADIUS;
        let seedA = vec3.fromValues(1, 1, 1);
        vec3.normalize(seedA, seedA);
        vec3.scale (seedA, seedA, RADIUS);
        let seedB = vec3.fromValues(-1, -1, 1);
        vec3.normalize(seedB, seedB);
        vec3.scale (seedB, seedB, RADIUS);
        let seedC = vec3.fromValues(-1, 1, -1);
        vec3.normalize(seedC, seedC);
        vec3.scale (seedC, seedC, RADIUS);
        let seedD = vec3.fromValues(1, -1, -1);
        vec3.normalize(seedD, seedD);
        vec3.scale (seedD, seedD, RADIUS);

        /* TODO: complete the rest of the code here */

        this.vertices = [];
        this.indices = [];
        this.colors = [];

        //recursive calls
        this.subDivide(seedA, seedC, seedB, subDiv);
        this.subDivide(seedD, seedA, seedB, subDiv);
        this.subDivide(seedD, seedC, seedA, subDiv);
        this.subDivide(seedB, seedC, seedD, subDiv);

        var color = Math.random();
        //loop to push random colors to the color array
        for(let x=0; x< this.vertices.length; x++) {
            this.colors.push(col1[0], col1[1], col1[2]);
        }

        //push to the index array
        for(var x = 0; x < this.vertices.length; x++){
            this.indices.push(x);
        }
        this.indices.push(0);

        console.log(this.indices);
        console.log(this.vertices);

        this.colorBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.colors), gl.STATIC_DRAW);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

        let buff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.indices), gl.STATIC_DRAW);
        this.primitives.push({type: gl.TRIANGLES, buffer: buff, numPoints: this.indices.length/3});

    }

    subDivide(seed1, seed2, seed3, subDiv){

        if(subDiv > 0) {

            //midpoint1 between A and B
            var mp1x = (seed1[0] + seed2[0]) / 2;
            var mp1y = (seed1[1] + seed2[1]) / 2;
            var mp1z = (seed1[2] + seed2[2]) / 2;


            var mp1 = vec3.fromValues(mp1x, mp1y, mp1z);
            vec3.normalize(mp1, mp1);
            vec3.scale(mp1, mp1, this.RADIUS);

            //this.vertices.push(mp1[0],mp1[1],mp1[2]);

            //midpoint 2 between B and C
            var mp2x = (seed2[0] + seed3[0]) / 2;
            var mp2y = (seed2[1] + seed3[1]) / 2;
            var mp2z = (seed2[2] + seed3[2]) / 2;


            var mp2 = vec3.fromValues(mp2x, mp2y, mp2z);
            vec3.normalize(mp2, mp2);
            vec3.scale(mp2, mp2, this.RADIUS);

            //this.vertices.push(mp2[0],mp2[1],mp2[2]);

            //midpoint 3 between A and C
            var mp3x = (seed1[0] + seed3[0]) / 2;
            var mp3y = (seed1[1] + seed3[1]) / 2;
            var mp3z = (seed1[2] + seed3[2]) / 2;


            var mp3 = vec3.fromValues(mp3x, mp3y, mp3z);
            vec3.normalize(mp3, mp3);
            vec3.scale(mp3, mp3, this.RADIUS);

            //this.vertices.push(mp3[0],mp3[1],mp3[2]);

            //make sure it's counter clockwise
            this.subDivide(seed1,mp1,mp3, subDiv-1);
            this.subDivide(mp1,seed2,mp2, subDiv-1);
            this.subDivide(mp3,mp2,seed3, subDiv-1);
            this.subDivide(mp2,mp3,mp1, subDiv-1);

        }else{

            //push the vertices
            this.vertices.push(seed1[0], seed1[1], seed1[2]);
            this.vertices.push(seed2[0], seed2[1], seed2[2]);
            this.vertices.push(seed3[0], seed3[1], seed3[2]);

            return;
        }
    }
}
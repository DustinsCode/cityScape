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

        //pushing initial seed values to vertex array
        this.vertices.push(seedA[0], seedA[1], seedA[2],
            seedB[0], seedB[1], seedB[2],
            seedC[0], seedC[1], seedC[2],
            seedD[0], seedD[1], seedD[2]);

        //this.indices.push(0,1,2,3,4,5,6,7,8,9,10,11);

        //this.indices.push(0,3,6,  3,6,9,  0,6,9,  0,3,9);

        //trying to just make the tetrahedron, but it just gives me strange
        //triangles that only show up at certain angles
        this.indices.push(0, 1, 2,
            1,2,3,
            0,2,3,
            0,1,3);


/*  //THIS IS WHERE I WOULD RECURSIVELY SUBDIVIDE, but I can't get it to work at all.
        this.subDivide(seedA, seedB, seedC, subDiv);
        this.subDivide(seedA, seedC, seedD, subDiv);
        this.subDivide(seedB, seedC, seedD, subDiv);
        this.subDivide(seedA, seedB, seedD, subDiv);
*/

        //loop to push random colors to the color array
        for(let x=0; x< this.vertices.length; x++) {
            this.colors.push(Math.random());
        }

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
        this.primitives.push({type: gl.TRIANGLES, buffer: buff, numPoints: this.indices.length});

    }

    subDivide(seed1, seed2, seed3, subDiv){

        if(subDiv > 0) {
            var mp1x = (seed1[0] + seed2[0]) / 2;
            var mp1y = (seed1[1] + seed2[1]) / 2;
            var mp1z = (seed1[2] + seed2[2]) / 2;



            var mp1 = vec3.fromValues(mp1x, mp1y, mp1z);
            vec3.normalize(mp1, mp1);
            vec3.scale(mp1, mp1, this.RADIUS);

            this.vertices.push(mp1[0],mp1[1],mp1[2]);

            var mp2x = (seed1[0] + seed3[0]) / 2;
            var mp2y = (seed1[1] + seed3[1]) / 2;
            var mp2z = (seed1[2] + seed3[2]) / 2;


            var mp2 = vec3.fromValues(mp2x, mp2y, mp2z);
            vec3.normalize(mp2, mp2);
            vec3.scale(mp2, mp2, this.RADIUS);

            this.vertices.push(mp2[0],mp2[1],mp2[2]);

            var mp3x = (seed2[0] + seed3[0]) / 2;
            var mp3y = (seed2[1] + seed3[1]) / 2;
            var mp3z = (seed2[2] + seed3[2]) / 2;


            var mp3 = vec3.fromValues(mp3x, mp3y, mp3z);
            vec3.normalize(mp3, mp3);
            vec3.scale(mp3, mp3, this.RADIUS);

            this.vertices.push(mp3[0],mp3[1],mp3[2]);

            //this.vertices.(mp1,mp2,mp3);

            this.subDivide(seed1,mp1,mp2, subDiv-1);
            this.subDivide(mp1,seed2,mp3, subDiv-1);
            this.subDivide(mp2,mp3,seed3, subDiv-1);
            this.subDivide(mp1,mp2,mp3, subDiv-1);

        }else{

            //i have no idea what I'm trying to do here.
            //I can't figure out how to know which indexes to push
            //or how WebGl knows/reads the indexes
            var loc = this.vertices.length-1;
            for(var i = 0; i <=loc; i++){
                this.indices.push(i, loc, loc-1);
            }

            //console.log(this.indices);
            //this.indices.push(vec3.fromValues(mp1,seed2,mp3));
            //this.indices.push(vec3.fromValues(mp2,mp3,seed3));

            return;
        }
    }
}
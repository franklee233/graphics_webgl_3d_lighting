// Hangbin Li - EECS 351 Project C
// drawing function javascript file

function makeGroundGrid() {
    //==============================================================================
    // Create a list of vertices that create a large grid of lines in the x,y plane
    // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

    var xcount = 1000; // # of lines to draw in x,y to make the grid.
    var ycount = 1000;
    var xymax = 500.0; // grid size; extends to cover +/-xymax in x and y.

    // Create an (global) array to hold this ground-plane's vertices:
    gndVerts = new Float32Array(floatsPerVertex * 2 * (xcount + ycount));
    // draw a grid made of xcount+ycount lines; 2 vertices per line.

    var xgap = xymax / (xcount - 1); // HALF-spacing between lines in x,y;
    var ygap = xymax / (ycount - 1); // (why half? because v==(0line number/2))

    // First, step thru x values as we make vertical lines of constant-x:
    for (v = 0, j = 0; v < 2 * xcount; v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // put even-numbered vertices at (xnow, -xymax, 0)
            gndVerts[j] = -xymax + (v) * xgap; // x
            gndVerts[j + 1] = -xymax; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        } else { // put odd-numbered vertices at (xnow, +xymax, 0).
            gndVerts[j] = -xymax + (v - 1) * xgap; // x
            gndVerts[j + 1] = xymax; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        }
        gndVerts[j + 4] = gndVerts[j];
        gndVerts[j + 5] = gndVerts[j + 1];
        gndVerts[j + 6] = gndVerts[j + 2];
    }
    // Second, step thru y values as wqe make horizontal lines of constant-y:
    // (don't re-initialize j--we're adding more vertices to the array)
    for (v = 0; v < 2 * ycount; v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // put even-numbered vertices at (-xymax, ynow, 0)
            gndVerts[j] = -xymax; // x
            gndVerts[j + 1] = -xymax + (v) * ygap; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        } else { // put odd-numbered vertices at (+xymax, ynow, 0).
            gndVerts[j] = xymax; // x
            gndVerts[j + 1] = -xymax + (v - 1) * ygap; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        }
        gndVerts[j + 4] = gndVerts[j];
        gndVerts[j + 5] = gndVerts[j + 1];
        gndVerts[j + 6] = gndVerts[j + 2];
    }
}

function makeSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 13; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = 27; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    sphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                sphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts[j + 2] = cos0;
                sphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                sphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts[j + 2] = cos1; // z
                sphVerts[j + 3] = 1.0; // w.  
            }
            sphVerts[j + 4] = sphVerts[j];
            sphVerts[j + 5] = sphVerts[j + 1];
            sphVerts[j + 6] = sphVerts[j + 2];
        }
    }
}

function makeDistortSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 13; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = 27; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    disphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                disphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                disphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                disphVerts[j + 2] = cos0 * (autoShaderChange + 0.2) * 2;
                disphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                disphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                disphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                disphVerts[j + 2] = cos1 * (autoShaderChange + 0.2) * 2; // z
                disphVerts[j + 3] = 1.0; // w.  
            }
            disphVerts[j + 4] = disphVerts[j];
            disphVerts[j + 5] = disphVerts[j + 1];
            disphVerts[j + 6] = disphVerts[j + 2];
        }
    }
}


function makeHemisphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 30; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = slices * 2 + 1; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    hsphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices / 2; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                hsphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 2] = cos0;
                hsphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                hsphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                hsphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                hsphVerts[j + 2] = cos1; // z
                hsphVerts[j + 3] = 1.0; // w.   
            }
            hsphVerts[j + 4] = hsphVerts[j];
            hsphVerts[j + 5] = hsphVerts[j + 1];
            hsphVerts[j + 6] = hsphVerts[j + 2];
        }
    }
    for (s = slices / 2; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                hsphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 2] = hsphVerts[j - floatsPerVertex + 2];
                hsphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                hsphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                hsphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                hsphVerts[j + 2] = hsphVerts[j - floatsPerVertex + 2];
                hsphVerts[j + 3] = 1.0; // w.        
            }
            hsphVerts[j + 4] = hsphVerts[j];
            hsphVerts[j + 5] = hsphVerts[j + 1];
            hsphVerts[j + 6] = hsphVerts[j + 2];
        }
    }
}

function makeTexCube() {
    texCubeVerts = new Float32Array([
        // Vertex coordinates and color
        -1.0, -1, -1.0, 1.0, -1.0, -1.0, -1.0, // v7 
        -1.0, -1, 1.0, 1.0, -1.0, -1.0, 1.0, // v2 
        1.0, -1, 1.0, 1.0, 1.0, -1.0, 1.0, // v3 
        1.0, -1, -1.0, 1.0, 1.0, -1.0, -1.0, // v4 
        1.0, 1, -1.0, 1.0, 1.0, 1.0, -1.0, // v5 
        -1.0, 1, -1.0, 1.0, -1.0, 1.0, -1.0, // v6 
        -1.0, 1, 1.0, 1.0, -1.0, 1.0, 1.0, // v1 
        -1.0, -1, 1.0, 1.0, -1.0, -1.0, 1.0, // v2 
        -1.0, -1, -1.0, 1.0, -1.0, -1.0, -1.0, // v7 

        //---------------------
        1.0, 1, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 
        -1.0, 1, 1.0, 1.0, -1.0, 1.0, 1.0, // v1 
        -1.0, -1, 1.0, 1.0, -1.0, -1.0, 1.0, // v2 
        1.0, -1, 1.0, 1.0, 1.0, -1.0, 1.0, // v3 
        1.0, -1, -1.0, 1.0, 1.0, -1.0, -1.0, // v4 
        1.0, 1, -1.0, 1.0, 1.0, 1.0, -1.0, // v5 
        -1.0, 1, -1.0, 1.0, -1.0, 1.0, -1.0, // v6 
        -1.0, 1, 1.0, 1.0, -1.0, 1.0, 1.0, // v1 
        1.0, 1, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 
    ]);
}

function makeCube() {
    // Create a (global) array to hold this cylinder's vertices;
    var cubeVerts = new Float32Array([
        // Vertex coordinates(x,y,z,w) and color (R,G,B) for a color tetrahedron:
        /*
         * red cube
         */
        // +x face: 
        1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // Node 3
        1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // Node 2
        1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, // Node 4

        1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, // Node 4
        1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, // Node 7
        1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // Node 3

        // +y face: 
        -1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 0.0, // Node 1
        -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, // Node 5
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, // Node 4

        1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, // Node 4
        1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 0.0, // Node 2 
        -1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 0.0, // Node 1

        // +z face: 
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.1, // Node 5
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.1, // Node 6
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.1, // Node 7

        1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.1, // Node 7
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.1, // Node 4
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.1, // Node 5

        // -x face: 
        -1.0, -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, // Node 6   
        -1.0, 1.0, 1.0, 1.0, -1.0, 0.0, 0.0, // Node 5 
        -1.0, 1.0, -1.0, 1.0, -1.0, 0.0, 0.0, // Node 1

        -1.0, 1.0, -1.0, 1.0, -1.0, 0.0, 0.0, // Node 1
        -1.0, -1.0, -1.0, 1.0, -1.0, 0.0, 0.0, // Node 0  
        -1.0, -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, // Node 6  

        // -y face: 
        1.0, -1.0, -1.0, 1.0, 0.0, -1.0, 0.0, // Node 3
        1.0, -1.0, 1.0, 1.0, 0.0, -1.0, 0.0, // Node 7
        -1.0, -1.0, 1.0, 1.0, 0.0, -1.0, 0.0, // Node 6

        -1.0, -1.0, 1.0, 1.0, 0.0, -1.0, 0.0, // Node 6
        -1.0, -1.0, -1.0, 1.0, 0.0, -1.0, 0.0, // Node 0
        1.0, -1.0, -1.0, 1.0, 0.0, -1.0, 0.0, // Node 3

        // -z face: 
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, // Node 2
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, -1.0, // Node 3
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, -1.0, // Node 0       

        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, -1.0, // Node 0
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, // Node 1
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0 // Node 2
    ]);
    return cubeVerts;

}

function makeBodyCubes() {
    //==============================================================================
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    // // gl.TRIANGLE_FAN version 1
    // ubCubeVerts = new Float32Array([
    //     // Vertex coordinates and color
    //     -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, // v7 
    //     -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, // v2 
    //     1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // v3 
    //     1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, // v4 
    //     1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, // v5 
    //     -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, // v6 
    //     -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // v1 
    //     -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, // v2 
    //     -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, // v7 

    //     //---------------------
    //     1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 
    //     -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // v1 
    //     -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, // v2 
    //     1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // v3 
    //     1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, // v4 
    //     1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, // v5 
    //     -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, // v6 
    //     -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // v1 
    //     1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 
    // ]);

    // gl.TRIANGLE_FAN version 2
    ubCubeVerts = new Float32Array([
        // Vertex coordinates and color
        -1.0, -0.64, -1.3, 1.0, -1.0, -1.0, -1.0, // v7 
        -1.0, -0.64, 1.3, 1.0, -1.0, -1.0, 1.0, // v2 
        1.0, -0.64, 1.3, 1.0, 1.0, -1.0, 1.0, // v3 
        1.0, -0.64, -1.3, 1.0, 1.0, -1.0, -1.0, // v4 
        1.0, 0.64, -1.3, 1.0, 1.0, 1.0, -1.0, // v5 
        -1.0, 0.64, -1.3, 1.0, -1.0, 1.0, -1.0, // v6 
        -1.0, 0.64, 1.3, 1.0, -1.0, 1.0, 1.0, // v1 
        -1.0, -0.64, 1.3, 1.0, -1.0, -1.0, 1.0, // v2 
        -1.0, -0.64, -1.3, 1.0, -1.0, -1.0, -1.0, // v7 

        //---------------------
        1.0, 0.64, 1.3, 1.0, 1.0, 1.0, 1.0, // v0 
        -1.0, 0.64, 1.3, 1.0, -1.0, 1.0, 1.0, // v1 
        -1.0, -0.64, 1.3, 1.0, -1.0, -1.0, 1.0, // v2 
        1.0, -0.64, 1.3, 1.0, 1.0, -1.0, 1.0, // v3 
        1.0, -0.64, -1.3, 1.0, 1.0, -1.0, -1.0, // v4 
        1.0, 0.64, -1.3, 1.0, 1.0, 1.0, -1.0, // v5 
        -1.0, 0.64, -1.3, 1.0, -1.0, 1.0, -1.0, // v6 
        -1.0, 0.64, 1.3, 1.0, -1.0, 1.0, 1.0, // v1 
        1.0, 0.64, 1.3, 1.0, 1.0, 1.0, 1.0, // v0 
    ]);

    // // gl.TRIANGLES version 1
    // ubCubeVerts = new Float32Array([
    //     // Vertex coordinates and color
    //     -1.0, -1.0, -1.0, 1.0, 0, 0, -1.0, // v7 
    //     -1.0, -1.0, 1.0, 1.0, 0, 0, -1.0, // v2 
    //     1.0, -1.0, 1.0, 1.0, 0, 0, -1.0, // v3 

    //     -1.0, -1.0, -1.0, 1.0, 0, 0, -1.0, // v7 
    //     1.0, -1.0, 1.0, 1.0, 0, 0, -1.0, // v3 
    //     1.0, -1.0, -1.0, 1.0, 0, 0, -1.0, // v4 

    //     -1.0, -1.0, -1.0, 1.0, -1.0, 0, 0, // v7 
    //     1.0, -1.0, -1.0, 1.0, -1.0, 0, 0, // v4 
    //     1.0, 1.0, -1.0, 1.0, -1.0, 0, 0, // v5

    //     -1.0, -1.0, -1.0, 1.0, -1.0, 0, 0, // v7 
    //     1.0, 1.0, -1.0, 1.0, -1.0, 0, 0, // v5
    //     -1.0, 1.0, -1.0, 1.0, -1.0, 0, 0, // v6

    //     -1.0, -1.0, -1.0, 1.0, 0, -1.0, 0, // v7 
    //     -1.0, 1.0, -1.0, 1.0, 0, -1.0, 0, // v6
    //     -1.0, 1.0, 1.0, 1.0, 0, -1.0, 0, // v1

    //     -1.0, -1.0, -1.0, 1.0, 0, -1.0, 0, // v7 
    //     -1.0, 1.0, 1.0, 1.0, 0, -1.0, 0, // v1
    //     -1.0, -1.0, 1.0, 1.0, 0, -1.0, 0, // v2 

    //     //---------------------
    //     1.0, 1.0, 1.0, 1.0, 1.0, 0, 0, // v0 
    //     -1.0, 1.0, 1.0, 1.0, 1.0, 0, 0, // v1 
    //     -1.0, -1.0, 1.0, 1.0, 1.0, 0, 0, // v2 

    //     1.0, 1.0, 1.0, 1.0, 1.0, 0, 0, // v0 
    //     -1.0, -1.0, 1.0, 1.0, 1.0, 0, 0, // v2 
    //     1.0, -1.0, 1.0, 1.0, 1.0, 0, 0, // v3

    //     1.0, 1.0, 1.0, 1.0, 0, 1.0, 0, // v0 
    //     1.0, -1.0, 1.0, 1.0, 0, 1.0, 0, // v3
    //     1.0, -1.0, -1.0, 1.0, 0, 1.0, 0, // v4 

    //     1.0, 1.0, 1.0, 1.0, 0, 1.0, 0, // v0
    //     1.0, -1.0, -1.0, 1.0, 0, 1.0, 0, // v4 
    //     1.0, 1.0, -1.0, 1.0, 0, 1.0, 0, // v5

    //     1.0, 1.0, 1.0, 1.0, 0, 0, 1, // v0
    //     1.0, 1.0, -1.0, 1.0, 0, 0, 1, // v5
    //     -1.0, 1.0, -1.0, 1.0, 0, 0, 1, // v6

    //     -1.0, 1.0, -1.0, 1.0, 0, 0, 1, // v6
    //     -1.0, 1.0, 1.0, 1.0, 0, 0, 1, // v1 
    //     1.0, 1.0, 1.0, 1.0, 0, 0, 1, // v0 
    // ]);

    // // gl.TRIANGLES version 2
    // ubCubeVerts = new Float32Array([
    //     1, 1, 1, 1, 0, 0, 1, // v0-v1-v2-v3 front
    //     -1, 1, 1, 1, 0, 0, 1, // v0-v1-v2-v3 front
    //     -1, -1, 1, 1, 0, 0, 1, // v0-v1-v2-v3 front
    //     1, -1, 1, 1, 0, 0, 1, // v0-v1-v2-v3 front
    //     -1, -1, 1, 1, 0, 0, 1, // v0-v1-v2-v3 front
    //     1, 1, 1, 1, 0, 0, 1, // v0-v1-v2-v3 front

    //     1, 1, 1, 1, 1, 0, 0, // v0-v3-v4-v5 right
    //     1, -1, 1, 1, 1, 0, 0, // v0-v3-v4-v5 right
    //     1, -1, -1, 1, 1, 0, 0, // v0-v3-v4-v5 right
    //     1, 1, -1, 1, 1, 0, 0, // v0-v3-v4-v5 right
    //     1, -1, -1, 1, 1, 0, 0, // v0-v3-v4-v5 right
    //     1, 1, 1, 1, 1, 0, 0, // v0-v3-v4-v5 right

    //     1, 1, 1, 1, 0, 1, 0, // v0-v5-v6-v1 top 
    //     1, 1, -1, 1, 0, 1, 0, // v0-v5-v6-v1 top 
    //     -1, 1, -1, 1, 0, 1, 0, // v0-v5-v6-v1 top 
    //     -1, 1, 1, 1, 0, 1, 0, // v0-v5-v6-v1 top 
    //     -1, 1, -1, 1, 0, 1, 0, // v0-v5-v6-v1 top 
    //     1, 1, 1, 1, 0, 1, 0, // v0-v5-v6-v1 top 

    //     -1, 1, 1, 1, -1, 0, 0, // v1-v6-v7-v2 left
    //     -1, 1, -1, 1, -1, 0, 0, // v1-v6-v7-v2 left
    //     -1, -1, -1, 1, -1, 0, 0, // v1-v6-v7-v2 left
    //     -1, -1, 1, 1, -1, 0, 0, // v1-v6-v7-v2 left
    //     -1, -1, -1, 1, -1, 0, 0, // v1-v6-v7-v2 left
    //     -1, 1, 1, 1, -1, 0, 0, // v1-v6-v7-v2 left

    //     -1, -1, -1, 1, 0, -1, 0, // v7-v4-v3-v2 bottom
    //     1, -1, -1, 1, 0, -1, 0, // v7-v4-v3-v2 bottom
    //     1, -1, 1, 1, 0, -1, 0, // v7-v4-v3-v2 bottom
    //     -1, -1, 1, 1, 0, -1, 0, // v7-v4-v3-v2 bottom
    //     1, -1, 1, 1, 0, -1, 0, // v7-v4-v3-v2 bottom
    //     -1, -1, -1, 1, 0, -1, 0, // v7-v4-v3-v2 bottom

    //     1, -1, -1, 1, 0, 0, -1, // v4-v7-v6-v5 back
    //     -1, -1, -1, 1, 0, 0, -1, // v4-v7-v6-v5 back
    //     -1, 1, -1, 1, 0, 0, -1, // v4-v7-v6-v5 back
    //     1, 1, -1, 1, 0, 0, -1, // v4-v7-v6-v5 back
    //     -1, 1, -1, 1, 0, 0, -1, // v4-v7-v6-v5 back
    //     1, -1, -1, 1, 0, 0, -1, // v4-v7-v6-v5 back
    // ]);
}

function makeCylinder() {
    //==============================================================================
    // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
    var capVerts = 60; // # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.6 / 50; // radius of bottom of cylinder (top always 1.0)
    var cyldLength = 0.25;

    // Create a (global) array to hold this cylinder's vertices;
    cyldVerts = new Float32Array(((capVerts * 6) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 

    // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
    // v counts vertices: j counts array elements (vertices * elements per vertex)
    for (v = 1, j = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
        // skip the first vertex--not needed.
        if (v % 2 == 0) { // put even# vertices at center of cylinder's top cap:
            cyldVerts[j] = 0.0; // x,y,z,w == 0,0,1,1
            cyldVerts[j + 1] = 0.0;
            cyldVerts[j + 2] = cyldLength;
            cyldVerts[j + 3] = 1.0; // r,g,b = topColr[]
        } else { // put odd# vertices around the top cap's outer edge;
            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
            //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
            cyldVerts[j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            cyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            cyldVerts[j + 2] = cyldLength; // z
            cyldVerts[j + 3] = 1.0; // w.
        }
        cyldVerts[j + 4] = cyldVerts[j];
        cyldVerts[j + 5] = cyldVerts[j + 1];
        cyldVerts[j + 6] = 1;
    }

    // Create the cylinder side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    for (v = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
        if (v % 2 == 0) // position all even# vertices along top cap:
        {
            cyldVerts[j] = botRadius * Math.cos(Math.PI * (v) / capVerts); // x
            cyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
            cyldVerts[j + 2] = cyldLength; // z
            cyldVerts[j + 3] = 1.0; // w.
        } else // position all odd# vertices along the bottom cap:
        {
            cyldVerts[j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            cyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            cyldVerts[j + 2] = 0.0; // z
            cyldVerts[j + 3] = 1.0; // w.
        }
        cyldVerts[j + 4] = cyldVerts[j];
        cyldVerts[j + 5] = cyldVerts[j + 1];
        cyldVerts[j + 6] = 0;
    }

    // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
    // v counts the vertices in the cap; j continues to count array elements
    for (v = 0; v < (2 * capVerts - 1); v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // position even #'d vertices around bot cap's outer edge
            cyldVerts[j] = botRadius * Math.cos(Math.PI * (v) / capVerts); // x
            cyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
            cyldVerts[j + 2] = 0.0; // z
            cyldVerts[j + 3] = 1.0; // w.
        } else { // position odd#'d vertices at center of the bottom cap:
            cyldVerts[j] = 0.0; // x,y,z,w == 0,0,-1,1
            cyldVerts[j + 1] = 0.0;
            cyldVerts[j + 2] = 0.0;
            cyldVerts[j + 3] = 1.0; // r,g,b = botColr[]
        }
        cyldVerts[j + 4] = cyldVerts[j];
        cyldVerts[j + 5] = cyldVerts[j + 1];
        cyldVerts[j + 6] = -1;
    }
}

function makeTwistCylinder() {
    //==============================================================================
    // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
    var capVerts = 60; // # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.6 / 50; // radius of bottom of cylinder (top always 1.0)
    var cyldLength = 0.25;

    // Create a (global) array to hold this cylinder's vertices;
    twcyldVerts = new Float32Array(((capVerts * 6) - 2) * floatsPerVertex * 100);
    // # of vertices * # of elements needed to store them. 


    for (var cldSlice = 0; cldSlice < 100; cldSlice++) {

        // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
        // v counts vertices: j counts array elements (vertices * elements per vertex)
        for (v = 1, j = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
            // skip the first vertex--not needed.
            if (v % 2 == 0) { // put even# vertices at center of cylinder's top cap:
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j] = 0.0 + cldSlice * autoShaderChange / 100; // x,y,z,w == 0,0,1,1
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1] = 0.0;
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 2] = cyldLength * (cldSlice + 1);
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 3] = 1.0; // r,g,b = topColr[]
            } else { // put odd# vertices around the top cap's outer edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts) + cldSlice * autoShaderChange / 100; // x
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 2] = cyldLength * (cldSlice + 1); // z
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 3] = 1.0; // w.
            }
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 4] = twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j];
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 5] = twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1];
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 6] = 1;
        }
        // Create the cylinder side walls, made of 2*capVerts vertices.
        // v counts vertices within the wall; j continues to count array elements
        for (v = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
            if (v % 2 == 0) // position all even# vertices along top cap:
            {
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j] = botRadius * Math.cos(Math.PI * (v) / capVerts) + cldSlice * autoShaderChange / 100; // x
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 2] = cyldLength * (cldSlice + 1); // z
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 3] = 1.0; // w.
            } else // position all odd# vertices along the bottom cap:
            {
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts) + cldSlice * autoShaderChange / 100; // x
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 2] = 0.0 + cldSlice * cyldLength; // z
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 3] = 1.0; // w.
            }
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 4] = twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j];
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 5] = twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1];
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 6] = 0;
        }
        // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
        // v counts the vertices in the cap; j continues to count array elements
        for (v = 0; v < (2 * capVerts - 1); v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // position even #'d vertices around bot cap's outer edge
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j] = botRadius * Math.cos(Math.PI * (v) / capVerts) + cldSlice * autoShaderChange / 100; // x
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 2] = 0.0 + cyldLength * cldSlice; // z
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 3] = 1.0; // w.
            } else { // position odd#'d vertices at center of the bottom cap:
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j] = 0.0 + cldSlice * autoShaderChange / 100; // x,y,z,w == 0,0,-1,1
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1] = 0.0;
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 2] = 0.0 + cyldLength * cldSlice;
                twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 3] = 1.0; // r,g,b = botColr[]
            }
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 4] = twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j];
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 5] = twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 1];
            twcyldVerts[((capVerts * 6) - 2) * floatsPerVertex * cldSlice + j + 6] = -1;
        }
    }
}

// Hangbin Li - EECS 351 Project C
// main javascript file

//23456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
//
// PointLightedSphere_perFragment.js (c) 2012 matsuda and kanda
//
// MODIFIED for EECS 351-1, Northwestern Univ. Jack Tumblin
//    Multiple light-sources: 'lamp0, lamp1, lamp2, etc
//       RENAME: ambientLight --> lamp0amb, lightColor --> lamp0diff,
//               lightPosition --> lamp0pos
//    Complete the Phong lighting model: add emissive and specular:
//    --Ke, Ka, Kd, Ks: K==Reflectance; emissive, ambient, diffuse, specular 
//    --    Ia, Id, Is: I==Illumination:          ambient, diffuse, specular.
//    -- Kshiny: specular exponent for 'shinyness'.
//    -- Implemented Blinn-Phong 'half-angle' specular term (from class)
//
// 
//    JT:  HOW would we compute the REFLECTED direction R? Which shader
//    JT:  HOW would we find the 'view' direction, to the eye? Which shader?
//

// Vertex shader program
var VSHADER_SOURCE = //
'attribute vec4 a_Position;\n' + //
'attribute vec4 a_Normal;\n' + //
'attribute vec2 a_TexCoord;\n' + //
'varying vec2 v_TexCoord;\n' + //
'attribute vec4 at_Position;\n' + //
'varying vec3 vt_Position;\n' + //
// Phong diffuse reflectance.
'uniform vec4 u_Ke;' + // Instead, we'll use this 'uniform'
'uniform vec4 u_Ka;' + //
'uniform vec4 u_Kd;' + // Instead, we'll use this 'uniform'
'uniform vec4 u_Ks;' + //
'uniform float u_Kshiny;' +
// value for the entire shape
'uniform mat4 u_MvpMatrix;\n' + //
'uniform mat4 u_ModelMatrix;\n' + // Model matrix
'uniform mat4 u_NormalMatrix;\n' + // Inverse Transpose of ModelMatrix;
// (doesn't distort normal directions)
'varying vec4 v_Ke; \n' + //
'varying vec4 v_Ka; \n' + //
'varying vec4 v_Kd; \n' + // Phong: diffuse reflectance
'varying vec4 v_Ks; \n' + //
'varying float v_Kshiny; \n' + //
'varying vec3 v_Normal;\n' + //
'varying vec3 v_Position;\n' + //
'void main() {\n' + //
'  gl_Position = u_MvpMatrix * a_Position;\n' + //
// Calculate the vertex position & normal in the world coordinate system
// and then save a 'varying', so that fragment shader will get per-pixel
// values (interpolated between vertices of our drawing prim. (triangle).
'  v_Position = vec3(u_ModelMatrix * a_Position);\n' + //
'  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' + //
'  v_Ke = u_Ke; \n' + // diffuse reflectance
'  v_Ka = u_Ka; \n' + // diffuse reflectance
'  v_Kd = u_Kd; \n' + // diffuse reflectance 
'  v_Ks = u_Ks; \n' + // diffuse reflectance
'  v_Kshiny = u_Kshiny; \n' + // diffuse reflectance
'  v_TexCoord = a_TexCoord;\n' + //
'}\n';

// Fragment shader program
var FSHADER_SOURCE = //
'#ifdef GL_ES\n' + //
'precision mediump float;\n' + //
'#endif\n' +
// first light source:
'uniform vec3 u_Lamp0Pos;\n' + // Phong Illum: position
'uniform vec3 u_Lamp0Amb;\n' + // Phong Illum: ambient
'uniform vec3 u_Lamp0Diff;\n' + // Phong Illum: diffuse
'uniform vec3 u_Lamp0Spec;\n' + // Phong Illum: specular
//second light source:
'uniform vec3 u_Lamp1Pos;\n' + // Phong Illum: position
'uniform vec3 u_Lamp1Amb;\n' + // Phong Illum: ambient
'uniform vec3 u_Lamp1Diff;\n' + // Phong Illum: diffuse
'uniform vec3 u_Lamp1Spec;\n' + // Phong Illum: specular

'uniform bool u_FixedLightFlg;\n' + //light flag
'uniform bool u_MoveLightFlg;\n' + //light flag

'varying vec3 v_Normal;\n' + // Find 3D surface normal at each pix
'varying vec3 v_Position;\n' + // and 3D position too -- in 'world' coords
'varying vec4 v_Ke;   \n' + // Find diffuse reflectance K_d per pix
'varying vec4 v_Ka;   \n' + //
'varying vec4 v_Kd; \n' + //
'varying vec4 v_Ks; \n' + //
'varying float v_Kshiny;\n' + //
// Ambient? Emissive? Specular? almost
// NEVER change per-vertex: I use'uniform'
'uniform sampler2D u_Sampler;\n' + //
'varying vec2 v_TexCoord;\n' + //
'varying vec3 vt_Position;\n' + // and 3D position too -- in 'world' coords
'uniform bool u_UseTextures;\n' + //
'void main() {\n' +
// Normalize the normal because it is interpolated and not 1.0 in length any more
'  vec3 normal = normalize(v_Normal);\n' +
// Calculate the light direction and make it 1.0 in length
'  vec3 lightDirection = normalize(u_Lamp0Pos - v_Position);\n' +
// The dot product of the light direction and the normal
'  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
// Calculate the final color from diffuse reflection and ambient reflection
'  vec3 emissive0 = vec3(v_Ke.rgb);' + //
'  vec3 ambient0 = u_Lamp0Amb * v_Ka.rgb;\n' + // 
'  vec3 diffuse0 = u_Lamp0Diff * v_Kd.rgb * nDotL;\n' + //
'  vec3 specular0 = vec3(0.0,0.0,0.0);\n' + //
'  if (nDotL > 0.0) {\n' + //
'    vec3 reflectVec = reflect(-lightDirection, normal);\n' + //
'    specular0 = u_Lamp0Spec * v_Ks.rgb * pow(max(dot(reflectVec, normalize(u_Lamp1Pos-v_Position)), 0.0),v_Kshiny);\n' + //
'  }\n' + //
//light in the head
'  vec3 lightDirection1 = normalize(u_Lamp1Pos - v_Position);\n' +
// The dot product of the light direction and the normal
'  float nDotL1 = max(dot(lightDirection1, normal), 0.0);\n' +

// Calculate the final color from diffuse reflection and ambient reflection
'  vec3 emissive1 = vec3(v_Ke.rgb);' + //
'  vec3 ambient1 = u_Lamp1Amb * v_Ka.rgb;\n' + //
'  vec3 diffuse1 = u_Lamp1Diff * v_Kd.rgb * nDotL1;\n' + //
'  vec3 specular1 = vec3(0.0,0.0,0.0);\n' + //
'  if (nDotL1 > 0.0) {\n' + //
'    vec3 reflectVec = reflect(-lightDirection1, normal);\n' + //
'    specular1 = u_Lamp1Spec * v_Ks.rgb * pow(max(dot(reflectVec, normalize(u_Lamp1Pos-v_Position)), 0.0),v_Kshiny);\n' + //
'  }\n' + //
'  if (!u_UseTextures) {\n' + //
'    gl_FragColor = vec4(emissive0 + ambient0 + diffuse0 + specular0 + emissive1 + ambient1 + diffuse1 + specular1, 1.0);\n' + //
'  } else {\n' + //
'  	 vec4 fragmentColor = texture2D(u_Sampler, vec2(v_TexCoord.s, v_TexCoord.t));\n' + //
'    gl_FragColor = vec4(fragmentColor.rgb * (emissive0 + emissive1), 1.0);\n' + //
'  }\n' + //
'}\n';

function declareGlobalVar() {
    canvas = document.getElementById('webgl'); // get current canvas, Global

    ANGLE_STEP_INIT = 45.0;
    ANGLE_STEP = ANGLE_STEP_INIT; // Rotation angle rate (degrees/second)
    floatsPerVertex = 7; // # of Float32Array elements used for each vertex

    // Global variables of perspective camera parameters
    // need cavans pre-defined
    persFov = 40, persAspect = canvas.width / canvas.height, persNear = 0.1, persFar = 20.0;

    // Global vars for Eye position. 
    // NOTE!  I moved eyepoint BACKWARDS from the forest: from g_EyeZ=0.25
    // a distance far enough away to see the whole 'forest' of trees within the
    // 30-degree field-of-view of our 'perspective' camera.  I ALSO increased
    // the 'keydown()' function's effect on g_EyeX position.
    g_EyeX = 8.0, g_EyeY = 0.0, g_EyeZ = 1.3;
    g_LookX = 0.0, g_LookY = 0.5, g_LookZ = 0.0;
    g_UpX = 0.0, g_UpY = 0.0, g_UpZ = 1.0;

    g_lookRadius = Math.sqrt((g_EyeX - g_LookX) * (g_EyeX - g_LookX) +
        (g_EyeY - g_LookY) * (g_EyeY - g_LookY) + (g_EyeZ - g_LookZ) * (g_EyeZ - g_LookZ));

    g_xylookRadius = Math.sqrt((g_EyeX - g_LookX) * (g_EyeX - g_LookX) +
        (g_EyeY - g_LookY) * (g_EyeY - g_LookY));
    // console.log(g_lookRadius);
    g_xyRotateAngle = (Math.asin((g_EyeX - g_LookX) / g_xylookRadius) / Math.PI * 180) % 360;
    // console.log(g_xyRotateAngle);
    g_zRotateAngle = (Math.asin((g_EyeZ - g_LookZ) / g_lookRadius) / Math.PI * 180) % 360;

    // toy parametes
    g_noseScale = 1.0;

    // lamp0
    g_Lamp0PosX = 5.0, g_Lamp0PosY = 10.0, g_Lamp0PosZ = 5.0;
    g_Lamp0AmbRInit = 0.5, g_Lamp0AmbGInit = 0.5, g_Lamp0AmbBInit = 0.5;
    g_Lamp0AmbR = g_Lamp0AmbRInit, g_Lamp0AmbG = g_Lamp0AmbGInit, g_Lamp0AmbB = g_Lamp0AmbBInit;
    g_Lamp0DiffRInit = 1.0, g_Lamp0DiffGInit = 1.0, g_Lamp0DiffBInit = 1.0;
    g_Lamp0DiffR = g_Lamp0DiffRInit, g_Lamp0DiffG = g_Lamp0DiffGInit, g_Lamp0DiffB = g_Lamp0DiffBInit;
    g_Lamp0SpecRInit = 0.8, g_Lamp0SpecGInit = 0.8, g_Lamp0SpecBInit = 0.8;
    g_Lamp0SpecR = g_Lamp0SpecRInit, g_Lamp0SpecG = g_Lamp0SpecGInit, g_Lamp0SpecB = g_Lamp0SpecBInit;

    // lamp1
    g_Lamp1AmbRInit = 0.5, g_Lamp1AmbGInit = 0.5, g_Lamp1AmbBInit = 0.5;
    g_Lamp1AmbR = g_Lamp1AmbRInit, g_Lamp1AmbG = g_Lamp1AmbGInit, g_Lamp1AmbB = g_Lamp1AmbBInit;
    g_Lamp1DiffRInit = 1.0, g_Lamp1DiffGInit = 1.0, g_Lamp1DiffBInit = 1.0;
    g_Lamp1DiffR = g_Lamp1DiffRInit, g_Lamp1DiffG = g_Lamp1DiffGInit, g_Lamp1DiffB = g_Lamp1DiffBInit;
    g_Lamp1SpecRInit = 0.3, g_Lamp1SpecGInit = 0.3, g_Lamp1SpecBInit = 0.360;
    g_Lamp1SpecR = g_Lamp1SpecRInit, g_Lamp1SpecG = g_Lamp1SpecGInit, g_Lamp1SpecB = g_Lamp1SpecBInit;

    modelMatrix = new Matrix4(); // Model matrix
    mvpMatrix = new Matrix4(); // Model view projection matrix
    normalMatrix = new Matrix4(); // Transformation matrix for normals

    g_autoShaderChange = [0, 1]; // first element is flag for +/-
    autoShaderChange = 0;
    g_last = Date.now();
}

function main() {
    declareGlobalVar();
    writeHelp2Html();
    winResize();
    gl = getWebGLContext(canvas); // and context:, Global
    writeLampPosHtml();

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the clear color and enable the depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    currentAngle = [45, 45];


    // Get the storage locations of uniform variables: for matrices
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix) {
        console.log('Failed to get matrix storage locations');
        return;
    }
    //  ... for Phong light source:
    u_Lamp0Pos = gl.getUniformLocation(gl.program, 'u_Lamp0Pos');
    u_Lamp0Amb = gl.getUniformLocation(gl.program, 'u_Lamp0Amb');
    u_Lamp0Diff = gl.getUniformLocation(gl.program, 'u_Lamp0Diff');
    u_Lamp0Spec = gl.getUniformLocation(gl.program, 'u_Lamp0Spec');
    if (!u_Lamp0Pos || !u_Lamp0Amb) { //|| !u_Lamp0Diff ) { // || !u_Lamp0Spec  ) {
        console.log('Failed to get the Lamp0 storage locations');
        return;
    }
    // ... for Phong material/reflectance:
    u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
    u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
    u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
    u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
    u_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');

    // if (!u_Ke || !u_Ka || !u_Kd || !u_Ks || !u_Kshiny) {
    //     console.log('Failed to get the Phong Reflectance storage locations');
    // }

    // Position the first light source in World coords: 
    gl.uniform3f(u_Lamp0Pos, g_Lamp0PosX, g_Lamp0PosY, g_Lamp0PosZ);
    // Set its light output:  
    gl.uniform3f(u_Lamp0Amb, g_Lamp0AmbR, g_Lamp0AmbG, g_Lamp0AmbB); // ambient
    gl.uniform3f(u_Lamp0Diff, g_Lamp0DiffR, g_Lamp0DiffG, g_Lamp0DiffB); // diffuse
    gl.uniform3f(u_Lamp0Spec, g_Lamp0SpecR, g_Lamp0SpecG, g_Lamp0SpecB); // Specular

    // sencond light source
    u_Lamp1Pos = gl.getUniformLocation(gl.program, 'u_Lamp1Pos');
    u_Lamp1Amb = gl.getUniformLocation(gl.program, 'u_Lamp1Amb');
    u_Lamp1Diff = gl.getUniformLocation(gl.program, 'u_Lamp1Diff');
    u_Lamp1Spec = gl.getUniformLocation(gl.program, 'u_Lamp1Spec');

    // Set its light output:  
    gl.uniform3f(u_Lamp1Pos, g_EyeX, g_EyeY, g_EyeZ);
    gl.uniform3f(u_Lamp1Amb, g_Lamp1AmbR, g_Lamp1AmbG, g_Lamp1AmbB); // ambient
    gl.uniform3f(u_Lamp1Diff, g_Lamp1DiffR, g_Lamp1DiffG, g_Lamp1DiffB); // diffuse
    gl.uniform3f(u_Lamp1Spec, g_Lamp1SpecR, g_Lamp1SpecG, g_Lamp1SpecB); // Specular


    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Start drawing: create 'tick' variable whose value is this function:
    var tick = function() {

        // Register the event handler to be called on key press
        document.onkeydown = function(ev) {
            keydown(ev, currentAngle);
        };
        winResize();

        currentAngle = animate(currentAngle); // Update the rotation angle
        draw(gl, currentAngle); // Draw shapes
        n = initVertexBuffers(gl);
        requestAnimationFrame(tick, canvas);
        // Request that the browser re-draw the webpage
    };
    tick(); // start (and continue) animation: draw current image
}

function initVertexBuffers(gl) {

    // autoShaderChange[1] in (0 ~ 0.99)
    if (ANGLE_STEP != 0) {
        if (g_autoShaderChange[0] == 0) {
            g_autoShaderChange[1]++;
        } else {
            g_autoShaderChange[1]--;
        }
        if (g_autoShaderChange[1] == 0 || g_autoShaderChange[1] == 99) {
            g_autoShaderChange[0] = 1 - g_autoShaderChange[0];
        }
        autoShaderChange = g_autoShaderChange[1] / 100;
    }

    makeGroundGrid();
    makeSphere();
    makeDistortSphere(); // sphere-stick
    makeBodyCubes();
    makeCylinder();
    makeHemisphere(); // nose and mouse
    makeTexCube();
    makeTwistCylinder(); // auto twist shader

    mySiz = gndVerts.length + sphVerts.length + disphVerts.length + cyldVerts.length;
    mySiz += ubCubeVerts.length + hsphVerts.length + texCubeVerts.length + twcyldVerts.length;

    // How many vertices total?
    var nn = mySiz / floatsPerVertex;
    // console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

    // Copy all shapes into one big Float32 array:
    var colorShapes = new Float32Array(mySiz);

    gndStart = 0;
    for (i = 0, j = 0; j < gndVerts.length; i++, j++) {
        colorShapes[i] = gndVerts[j];
    }
    sphStart = i;
    for (j = 0; j < sphVerts.length; i++, j++) {
        colorShapes[i] = sphVerts[j];
    }
    disphStart = i;
    for (j = 0; j < disphVerts.length; i++, j++) {
        colorShapes[i] = disphVerts[j];
    }
    ubCubeStart = i;
    for (j = 0; j < ubCubeVerts.length; i++, j++) {
        colorShapes[i] = ubCubeVerts[j];
    }
    cyldStart = i;
    for (j = 0; j < cyldVerts.length; i++, j++) {
        colorShapes[i] = cyldVerts[j];
    }
    hsphStart = i;
    for (j = 0; j < hsphVerts.length; i++, j++) {
        colorShapes[i] = hsphVerts[j];
    }
    texCubeStart = i;
    for (j = 0; j < texCubeVerts.length; i++, j++) {
        colorShapes[i] = texCubeVerts[j];
    }
    twcyldStart = i;
    for (j = 0; j < twcyldVerts.length; i++, j++) {
        colorShapes[i] = twcyldVerts[j];
    }

    // Write the vertex property to buffers (coordinates and normals)
    // Same data can be used for vertex and normal
    // In order to make it intelligible, another buffer is prepared separately
    if (!initArrayBuffer(gl, 'a_Position', colorShapes, gl.FLOAT, 0, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', colorShapes, gl.FLOAT, 4, 3)) return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // //↓↓=====================texture====================

    // var verticesTexCoords = new Float32Array([
    //     // Vertex coordinates, texture coordinate
    //     -0.5, 0.5, 0.0, 1.0, -0.5, -0.5, 0.0, 0.0,
    //     0.5, 0.5, 1.0, 1.0,
    //     0.5, -0.5, 1.0, 0.0,
    // ]);
    // var n = 4; // The number of vertices

    // // Create the buffer object
    // var vertexTexCoordBuffer = gl.createBuffer();
    // if (!vertexTexCoordBuffer) {
    //     console.log('Failed to create the buffer object');
    //     return -1;
    // }

    // // Bind the buffer object to target
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    // var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    // //Get the storage location of a_Position, assign and enable buffer
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) {
    //     console.log('Failed to get the storage location of a_Position');
    //     return -1;
    // }
    // gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    // gl.enableVertexAttribArray(a_Position); // Enable the assignment of the buffer object

    // // Get the storage location of a_TexCoord
    // var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    // if (a_TexCoord < 0) {
    //     console.log('Failed to get the storage location of a_TexCoord');
    //     return -1;
    // }
    // // Assign the buffer object to a_TexCoord variable
    // gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // gl.enableVertexAttribArray(a_TexCoord); // Enable the assignment of the buffer object
    //↑↑=====================texture====================

    // Unbind the buffer object
    return nn;
}

function initArrayBuffer(gl, attribute, data, type, start, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    var FSIZE = data.BYTES_PER_ELEMENT;
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, FSIZE * floatsPerVertex, FSIZE * start);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}


function initTextures(gl, n) {
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Get the storage location of u_Sampler
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }
    var image = new Image(); // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function() {
        loadTexture(gl, n, texture, u_Sampler, image);
    };
    // Tell the browser to load an image
    image.src = 'texture.jpg';

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, 0);
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}


function initMatrix(gl) {
    // Calculate the view projection matrix
    mvpMatrix.setPerspective(40, canvas.width / canvas.height, persNear, persFar);
    mvpMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
        g_LookX, g_LookY, g_LookZ, // look-at point 
        g_UpX, g_UpY, g_UpZ); // up.
    mvpMatrix.multiply(modelMatrix);
    // Calculate the matrix to transform the normal based on the model matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    // Pass the model matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
}

function draw(gl, currentAngle) {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


    // Reset lamp0
    gl.uniform3f(u_Lamp0Pos, g_Lamp0PosX + (currentAngle[0] - 75) / 10, g_Lamp0PosY, g_Lamp0PosZ);
    gl.uniform3f(u_Lamp0Amb, g_Lamp0AmbR, g_Lamp0AmbG, g_Lamp0AmbB); // ambient
    gl.uniform3f(u_Lamp0Diff, g_Lamp0DiffR, g_Lamp0DiffG, g_Lamp0DiffB); // diffuse
    gl.uniform3f(u_Lamp0Spec, g_Lamp0SpecR, g_Lamp0SpecG, g_Lamp0SpecB); // Specular
    // Reset lamp1
    gl.uniform3f(u_Lamp1Pos, g_EyeX, g_EyeY, g_EyeZ);
    gl.uniform3f(u_Lamp1Amb, g_Lamp1AmbR, g_Lamp1AmbG, g_Lamp1AmbB); // ambient
    gl.uniform3f(u_Lamp1Diff, g_Lamp1DiffR, g_Lamp1DiffG, g_Lamp1DiffB); // diffuse
    gl.uniform3f(u_Lamp1Spec, g_Lamp1SpecR, g_Lamp1SpecG, g_Lamp1SpecB); // Specular

    //=====================draw====================
    //  ground plane: 
    gl.uniform4f(u_Ke, 0.0, 0.0, 0.0, 1.0); // Ke emissive
    gl.uniform4f(u_Ka, 0.1, 0.1, 0.1, 1.0); // Ka ambient
    gl.uniform4f(u_Kd, 0.6, 0.0, 0.0, 1.0); // Kd diffuse
    gl.uniform4f(u_Ks, 0.6, 0.6, 0.6, 1.0); // Ks specular
    gl.uniform1f(u_Kshiny, 100.0); // Kshiny shinyness exponent

    modelMatrix.setRotate(90, 0, 0, 1);
    modelMatrix.scale(0.2, -0.2, 0.2); // right-hand cord
    initMatrix(gl);
    gl.drawArrays(gl.LINES, // use this drawing primitive, and
        gndStart / floatsPerVertex, // start at this vertex number, and
        gndVerts.length / floatsPerVertex); // draw this many vertices

    //=====================draw====================
    // Sphere-stick model
    gl.uniform4f(u_Ke, 0.0, 0.0, 0.0, 1.0); // Ke emissive
    gl.uniform4f(u_Ka, 0.24725, 0.2245, 0.0645, 1.0); // Ka ambient
    gl.uniform4f(u_Kd, 0.34615, 0.3143, 0.0903, 1.0); // Kd diffuse
    gl.uniform4f(u_Ks, 0.797357, 0.723991, 0.208006, 1.0); // Ks specular
    gl.uniform1f(u_Kshiny, 8.2); // Kshiny shinyness exponent

    pushMatrix(modelMatrix);
    modelMatrix.translate(-10, 10, 3);
    modelMatrix.scale(0.5, 0.5, 0.5);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        sphStart / floatsPerVertex, // start at this vertex number, and
        sphVerts.length / floatsPerVertex); // draw this many vertices.

    modelMatrix.rotate(currentAngle[1] * 5, 0, 1, 0);
    modelMatrix.scale(10, 10, 30);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex);
    modelMatrix.scale(0.1, 0.1, 0.033);

    modelMatrix.translate(0, 0, 7.5);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        disphStart / floatsPerVertex, // start at this vertex number, and
        disphVerts.length / floatsPerVertex); // draw this many vertices.

    modelMatrix = popMatrix();

    //=====================draw====================
    // draw texture cube
    // gl.uniform4f(u_Ke, 0.0, 0.0, 0.0, 1.0); // Ke emissive
    // gl.uniform4f(u_Ka, 0.05, 0.05, 0.05, 1.0); // Ka ambient
    // gl.uniform4f(u_Kd, 0.0, 0.2, 0.6, 1.0); // Kd diffuse
    // gl.uniform4f(u_Ks, 0.1, 0.2, 0.3, 1.0); // Ks specular
    // gl.uniform1f(u_Kshiny, 2.8); // Kshiny shinyness exponent

    // pushMatrix(modelMatrix);
    // modelMatrix.translate(-7, 3, 5);
    // modelMatrix.scale(1, 1.3, 1);
    // modelMatrix.rotate(currentAngle[1], 1, 0, 0);
    // initMatrix(gl);
    // gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
    //     ubCubeStart / floatsPerVertex, // start at this vertex number, and
    //     ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    // gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
    //     (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
    //     ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    // modelMatrix = popMatrix();

    //=====================draw====================
    // hollow cylinder
    gl.uniform4f(u_Ke, 0.0, 0.0, 0.0, 1.0); // Ke emissive
    gl.uniform4f(u_Ka, 0.2295, 0.08825, 0.0275, 1.0); // Ka ambient
    gl.uniform4f(u_Kd, 0.5508, 0.2118, 0.066, 1.0); // Kd diffuse
    gl.uniform4f(u_Ks, 0.580594, 0.223257, 0.0695701, 1.0); // Ks specular
    gl.uniform1f(u_Kshiny, 51.2); // Kshiny shinyness exponent

    pushMatrix(modelMatrix);
    var angleSlice = 400;
    modelMatrix.translate(-2, 12, 1);
    modelMatrix.rotate((45 - currentAngle[0]) / angleSlice, 1, 0, 0);
    modelMatrix.rotate((45 - currentAngle[0]) / angleSlice, 0, -1, 0);
    modelMatrix.scale(12, 12, 0.5);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex); // draw this many vertices
    for (var i = 0; i < 20; i++) {
        modelMatrix.translate(0, 0, 0.23);
        modelMatrix.rotate((45 - currentAngle[0]) / angleSlice, 1, 0, 0);
        modelMatrix.rotate((45 - currentAngle[0]) / angleSlice, 0, -1, 0);
        initMatrix(gl);
        gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
            cyldStart / floatsPerVertex, // start at this vertex number, and
            cyldVerts.length / floatsPerVertex); // draw this many vertices.
    }
    for (var i = 0; i < 50; i++) {
        modelMatrix.translate(0, 0, 0.23);
        modelMatrix.rotate((45 - currentAngle[0]) / angleSlice, -1, 0, 0);
        modelMatrix.rotate((45 - currentAngle[0]) / angleSlice, 0, 1, 0);
        initMatrix(gl);
        gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
            cyldStart / floatsPerVertex, // start at this vertex number, and
            cyldVerts.length / floatsPerVertex); // draw this many vertices.
    }
    modelMatrix = popMatrix();

    // pushMatrix(modelMatrix);
    // modelMatrix.translate(-2, 12, 1);
    // modelMatrix.scale(12, 12, 0.5);
    // initMatrix(gl);
    // gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
    //     twcyldStart / floatsPerVertex, // start at this vertex number, and
    //     twcyldVerts.length / 100 / floatsPerVertex); // draw this many vertices
    // for (var i = 0; i < 100; i++) {
    //     modelMatrix.translate(0, 0, 0.0001);
    //     initMatrix(gl);
    //     gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
    //         (twcyldStart + twcyldVerts.length * i) / 100 / floatsPerVertex, // start at this vertex number, and
    //         twcyldVerts.length / 100 / floatsPerVertex); // draw this many vertices.
    // }
    // modelMatrix = popMatrix();

    //=====================draw====================
    // toy upper body cube
    gl.uniform4f(u_Ke, 0.0, 0.0, 0.0, 1.0); // Ke emissive
    gl.uniform4f(u_Ka, 0.23125, 0.23125, 0.23125, 1.0); // Ka ambient
    gl.uniform4f(u_Kd, 0.2775, 0.2775, 0.2775, 1.0); // Kd diffuse
    gl.uniform4f(u_Ks, 0.773911, 0.773911, 0.773911, 1.0); // Ks specular
    gl.uniform1f(u_Kshiny, 90.6); // Kshiny shinyness exponent
    modelMatrix.translate(0, 10, 1);


    pushMatrix(modelMatrix);
    modelMatrix.translate(7, 3, 1.8);
    // modelMatrix.scale(1, 0.7, 1.2);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
        ubCubeStart / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
        (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    // gl.drawArrays(gl.TRIANGLES, // use this drawing primitive, and
    //     ubCubeStart / floatsPerVertex, // start at this vertex number, and
    //     ubCubeVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();

    //----------------------------------------------
    // left arm cylinder
    pushMatrix(modelMatrix);

    modelMatrix.translate(5.9, 3, 2);
    modelMatrix.rotate(currentAngle[0], 0, 1, 0);
    modelMatrix.rotate(180, 1, 0, 0);
    modelMatrix.rotate(-180, 0, 0, 1);
    modelMatrix.scale(4, 4, 4);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex);

    modelMatrix.translate(0, 0, 0.25);
    modelMatrix.rotate((currentAngle[0] - 45) * 2, 1, 0, 0);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex);

    modelMatrix.translate(0, 0.02, 0.25);
    modelMatrix.rotate((currentAngle[0] - 75), 1, 0, 0); // spin around y axis.
    modelMatrix.scale(0.05, 0.05, 0.02);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
        ubCubeStart / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
        (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.

    modelMatrix = popMatrix();

    //----------------------------------------------
    // right arm cylinder
    pushMatrix(modelMatrix);

    modelMatrix.translate(8, 3, 2);
    modelMatrix.rotate(-currentAngle[0], 0, 1, 0);
    modelMatrix.rotate(180, 1, 0, 0);
    modelMatrix.rotate(-180, 0, 0, 1);
    modelMatrix.scale(4, 4, 4);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex);

    modelMatrix.translate(0, 0, 0.25);
    modelMatrix.rotate(-(currentAngle[0] - 45) * 2, 1, 0, 0);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex);

    modelMatrix.translate(0, 0.02, 0.25);
    modelMatrix.rotate(-(currentAngle[0] - 75), 1, 0, 0); // spin around y axis.
    modelMatrix.scale(0.05, 0.05, 0.02);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
        ubCubeStart / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    gl.drawArrays(gl.TRIANGLE_FAN, // use this drawing primitive, and
        (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.

    modelMatrix = popMatrix();

    //----------------------------------------------
    // left leg cylinder
    pushMatrix(modelMatrix);
    modelMatrix.translate(6.5, 2.7, 0.7);
    modelMatrix.rotate((currentAngle[0] - 45), 1, 0, 0);
    modelMatrix.scale(5, 5, -5);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();

    //----------------------------------------------
    // right leg cylinder
    pushMatrix(modelMatrix);
    modelMatrix.translate(7.6, 2.7, 0.7);
    modelMatrix.rotate(-(currentAngle[0] - 45), 1, 0, 0);
    modelMatrix.scale(5, 5, -5);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        cyldStart / floatsPerVertex, // start at this vertex number, and
        cyldVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();

    //----------------------------------------------
    // left eyeball hemisphere
    pushMatrix(modelMatrix);
    modelMatrix.translate(6.6, 3.7, 2.2);
    modelMatrix.rotate(75, 1, 0, 0);
    modelMatrix.rotate(180, 1, 0, 0);
    modelMatrix.scale(0.2, 0.2, 0.2);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        hsphStart / floatsPerVertex, // start at this vertex number, and
        hsphVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();

    //----------------------------------------------
    // right eyeball hemisphere
    pushMatrix(modelMatrix);
    modelMatrix.translate(7.4, 3.7, 2.2);
    modelMatrix.rotate(75, 1, 0, 0);
    modelMatrix.rotate(180, 1, 0, 0);
    modelMatrix.scale(0.2, 0.2, 0.2);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        hsphStart / floatsPerVertex, // start at this vertex number, and
        hsphVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();

    //----------------------------------------------
    // nose hemisphere
    pushMatrix(modelMatrix);
    modelMatrix.translate(7, 4, 1.8);
    modelMatrix.rotate(90 + currentAngle[0] / 5, 1, 0, 0); // spin around y axis.
    modelMatrix.scale(0.15, 0.15, -g_noseScale / 2);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        hsphStart / floatsPerVertex, // start at this vertex number, and
        hsphVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();

    //----------------------------------------------
    // mouse hemisphere
    pushMatrix(modelMatrix);
    modelMatrix.translate(7, 4, 1.5);
    modelMatrix.rotate(180, 1, 0, 0);
    modelMatrix.scale(0.3, 0.2, 0.2);
    initMatrix(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, // use this drawing primitive, and
        hsphStart / floatsPerVertex, // start at this vertex number, and
        hsphVerts.length / floatsPerVertex); // draw this many vertices.
    modelMatrix = popMatrix();
}

function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    if (angle[0] > 75.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if (angle[0] < 15.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

    var newAngle = new Array();
    newAngle[0] = (angle[0] + (ANGLE_STEP * elapsed) / 1000.0) % 360;
    newAngle[1] = (angle[1] + (Math.abs(ANGLE_STEP) * elapsed) / 1000.0) % 360;

    return newAngle;
}

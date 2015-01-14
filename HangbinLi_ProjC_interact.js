function keydown(ev, currentAngle) {
    //HTML calls this'Event handler' or 'callback function' when we press a key:
    if (!ev.metaKey) { // Exclude "Option" key on OS X, or "Win" key on Windows, since I have to debug using keyboard shortcuts

        var e = ev.keyCode;

        if (e == 112 || e == 27) { // F1 Esc Help
            writeHelp2Html();
        }
        if (e == 191) {
            toggleProjection();
        }

        if (e == 219) { // [ - toy nose length decrease
            g_noseScale -= 0.05;
            if (g_noseScale < 0) {
                g_noseScale = 0;
            }
        }
        if (e == 221) { // ] - toy nose length increase
            g_noseScale += 0.05;
        }

        var angleSlice = 1;
        // arrow keys - viewing angle
        if (e == 39) { // The right arrow key was pressed
            g_xyRotateAngle -= angleSlice;
            g_xyRotateAngle %= 360;
            // console.log(g_xyRotateAngle);
            var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
            // console.log(xyLookRadius);
            g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
            g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
            // console.log(g_LookX, g_LookY, g_LookZ);
        }
        if (e == 37) { // The left arrow key was pressed
            g_xyRotateAngle += angleSlice;
            g_xyRotateAngle %= 360;
            // console.log(g_xyRotateAngle);
            var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
            // console.log(xyLookRadius);
            g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
            g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
            // console.log(g_LookX, g_LookY, g_LookZ);
        }
        if (e == 40) { // The down arrow key was pressed
            g_zRotateAngle += angleSlice;
            g_zRotateAngle %= 360;
            var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
            var zLookRadius = g_lookRadius * Math.sin(g_zRotateAngle / 180 * Math.PI);
            g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
            g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
            g_LookZ = g_EyeZ - zLookRadius;
        }
        if (e == 38) { // The up arrow key was pressed
            g_zRotateAngle -= angleSlice;
            g_zRotateAngle %= 360;
            var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
            var zLookRadius = g_lookRadius * Math.sin(g_zRotateAngle / 180 * Math.PI);
            g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
            g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
            g_LookZ = g_EyeZ - zLookRadius;
        }

        var moveSlice = 10;
        // ASDW FR, eye point position move
        if (e == 68) { // D
            g_EyeX += Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookX += Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_EyeZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
            // g_LookZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
        }
        if (e == 65) { // A
            g_EyeX -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookX -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_EyeZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
            // g_LookZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
        }
        if (e == 83) { // S
            g_EyeX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeY -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookY -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
        }
        if (e == 87) { // W
            g_EyeX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeY += Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookY += Math.cos(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / moveSlice;
        }
        if (e == 70) { // F
            // g_EyeX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_LookX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_EyeY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_LookY += Math.sin(g_xyRotateAngle / 180 * Math.PI) /moveSlice;
            g_EyeZ -= Math.cos(g_zRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookZ -= Math.cos(g_zRotateAngle / 180 * Math.PI) / moveSlice;
        }
        if (e == 82) { // R
            // g_EyeX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_LookX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_EyeY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            // g_LookY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / moveSlice;
            g_EyeZ += Math.cos(g_zRotateAngle / 180 * Math.PI) / moveSlice;
            g_LookZ += Math.cos(g_zRotateAngle / 180 * Math.PI) / moveSlice;
        }

        // user-adjustable lamp0
        if (e == 72) { // H, lamp0 move left
            g_Lamp0PosX -= 1;
            writeLampPosHtml();
        }
        if (e == 75) { // K, lamp0 right left
            g_Lamp0PosX += 1;
            writeLampPosHtml();
        }
        if (e == 85) { // U, lamp0 move forward
            g_Lamp0PosY += 1;
            writeLampPosHtml();
        }
        if (e == 74) { //J, lamp0 move back
            g_Lamp0PosY -= 1;
            writeLampPosHtml();
        }
        if (e == 79) { // O, lamp0 move up
            g_Lamp0PosZ += 1;
            writeLampPosHtml();
        }
        if (e == 76) { // L, lamp0 move down
            g_Lamp0PosZ -= 1;
            writeLampPosHtml();
        }

        draw(gl, currentAngle);
    }
}

function toggleLamp(lampNum) {
    if (lampNum == 0) {
        if (g_Lamp0DiffR != 0) {
            g_Lamp0DiffR = 0, g_Lamp0DiffG = 0, g_Lamp0DiffB = 0;
            g_Lamp0SpecR = 0, g_Lamp0SpecG = 0, g_Lamp0SpecB = 0;
            document.getElementById("lamp0_toggle_btn").value = " Turn On User Adjustable Light ";
            document.getElementById("lamp0_pos_div").innerHTML = "";
        } else {
            g_Lamp0DiffR = g_Lamp0DiffRInit, g_Lamp0DiffG = g_Lamp0DiffGInit, g_Lamp0DiffB = g_Lamp0DiffBInit;
            g_Lamp0SpecR = g_Lamp0SpecRInit, g_Lamp0SpecG = g_Lamp0SpecGInit, g_Lamp0SpecB = g_Lamp0SpecBInit;
            document.getElementById("lamp0_toggle_btn").value = " Turn Off User Adjustable Light ";
            writeLampPosHtml();
        }
    }
    if (lampNum == 1) {
        if (g_Lamp1DiffR != 0) {
            g_Lamp1DiffR = 0, g_Lamp1DiffG = 0, g_Lamp1DiffB = 0;
            g_Lamp1SpecR = 0, g_Lamp1SpecG = 0, g_Lamp1SpecB = 0;
            document.getElementById("lamp1_toggle_btn").value = " Turn On Eye/Camera Light ";
        } else {
            g_Lamp1DiffR = g_Lamp1DiffRInit, g_Lamp1DiffG = g_Lamp1DiffGInit, g_Lamp1DiffB = g_Lamp1DiffBInit;
            g_Lamp1SpecR = g_Lamp1SpecRInit, g_Lamp1SpecG = g_Lamp1SpecGInit, g_Lamp1SpecB = g_Lamp1SpecBInit;
            document.getElementById("lamp1_toggle_btn").value = " Turn Off Eye/Camera Light ";
        }
    }
    if (lampNum == 2) {
        if (g_Lamp0AmbR != 0) { // toggle ambient light
            g_Lamp0AmbR = 0, g_Lamp0AmbG = 0, g_Lamp0AmbB = 0;
            g_Lamp1AmbR = 0, g_Lamp1AmbG = 0, g_Lamp1AmbB = 0;
            document.getElementById("ambient_toggle_btn").value = " Turn On Ambient Light ";
        } else {
            g_Lamp0AmbR = g_Lamp0AmbRInit, g_Lamp0AmbG = g_Lamp0AmbGInit, g_Lamp0AmbB = g_Lamp0AmbBInit;
            g_Lamp1AmbR = g_Lamp1AmbRInit, g_Lamp1AmbG = g_Lamp1AmbGInit, g_Lamp1AmbB = g_Lamp1AmbBInit;
            document.getElementById("ambient_toggle_btn").value = " Turn Off Ambient Light ";
        }
    }
}

function toggleEyePos() {
    if (document.getElementById("toggle_eye_position").value == " Pos 2 Shortcut ") {
        g_EyeX = -2, g_EyeY = -1, g_EyeZ = 5;
        g_LookX = 1, g_LookY = 2, g_LookZ = 0.0;
        g_UpX = 0.0, g_UpY = 0.0, g_UpZ = 1.0;
        document.getElementById("toggle_eye_position").value = " Pos 1 Shortcut ";
    } else {
        g_EyeX = 8.0, g_EyeY = 0.0, g_EyeZ = 1.3;
        g_LookX = 0.0, g_LookY = 0.5, g_LookZ = 0.0;
        g_UpX = 0.0, g_UpY = 0.0, g_UpZ = 1.0;
        document.getElementById("toggle_eye_position").value = " Pos 2 Shortcut ";
    }
}

function toggleAnimation() {
    if (ANGLE_STEP != 0) {
        ANGLE_STEP = 0;
        document.getElementById("toggle_animation").value = " Resume Animation ";
    } else {
        ANGLE_STEP = ANGLE_STEP_INIT;
        document.getElementById("toggle_animation").value = " Pause Animation ";
    }
}

function writeLampPosHtml() {
    try {
        var lampPosContent;
        lampPosContent = "adjustable light coordinates: (" + g_Lamp0PosX + ", " + g_Lamp0PosY + ", " + g_Lamp0PosZ + ")<br>";
        document.getElementById("lamp0_pos_div").innerHTML = lampPosContent;
    } catch (err) {}
}

function writeHelp2Html() {
    var helpContent;
    try {
        if (document.getElementById("help_control_div").innerHTML == "") {
            helpContent =
                "F1 / Esc: show / hide help. <br><br>" +
                "A / S / D / W: move camera in xy-plain. <br>" +
                "F / R: move camera in z-height. <br>" +
                "↑ / ↓ / ← / → : move view angles. <br><br>" +
                "H / J / K / U: move light in xy-plain. <br>" +
                "L / O: move light in z-height. <br><br>" +
                "[ / ]: adjust toy's nose length. <br>";

            document.getElementById("help_control_div").innerHTML = helpContent;
            document.getElementById("help_btn").value = " Hide Help (F1/Esc) ";
        } else {
            document.getElementById("help_control_div").innerHTML = "";
            document.getElementById("help_btn").value = " Show Help (F1/Esc) ";
        }
    } catch (err) {}
    try {
        if (document.getElementById("help_animation_div").innerHTML == "") {
            helpContent =
                "<p>Key Point and Extra: <br>" +
                "1. sphere-stick - extra 2 shader distort <br>" +
                "2. cylinder - extra 3 shader twist<br>" +
                "3-1. joint arms+hands swing<br>" +
                "3-2. legs swings<br>" +
                "3-2. nose stretches";

            document.getElementById("help_animation_div").innerHTML = helpContent;
            document.getElementById("help_btn").value = " Hide Help (F1/Esc) ";
        } else {
            document.getElementById("help_animation_div").innerHTML = "";
            document.getElementById("help_btn").value = " Show Help (F1/Esc) ";
        }
    } catch (err) {}
}

function winResize() {
    //Make canvas fill the top 3/4 of our browser window:
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

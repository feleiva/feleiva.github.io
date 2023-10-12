

var __clickDetected = false;
var __gamepadButtonEvent = false;
var __gamepadButtonPressed = false;
var __gamepadConnected = false;
var __connectedGamepads = [];
//var __counter = 0;

/// Even Handling
function inputOnClick() {
    __clickDetected = true;
}

function inputOnGamePadConnected(event) {
    if (__connectedGamepads.includes(event.gamepad.id))
        return;

    __connectedGamepads.push(event.gamepad.id)
    __gamepadConnected = true;

    console.log("INPUT>> Connected gamepad " + event.gamepad.id + " Total Gamepads: " + __connectedGamepads.length)
}

function inputOnGamePadDisConnected(event) {
    let index = __connectedGamepads.indexOf(event.gamepad.id);
    if (index < 0)
        return;

    __connectedGamepads.splice(index, 1);
    if (__connectedGamepads.length == 0)
        __gamepadConnected = true;

    console.log("INPUT>> Disconnected gamepad " + event.gamepad.id + " Total Gamepads: " + __connectedGamepads.length)
}

function inputInit() {
    window.addEventListener(
        "mousedown", // Mouse down is more acurate than click, which triggers on mouse up
        inputOnClick,
        true
    )

    window.addEventListener('gamepadconnected', inputOnGamePadConnected);
    window.addEventListener('gamepaddisconnected', inputOnGamePadDisConnected);
}

function inputStep() {
    for (const gamepad of navigator.getGamepads()) {
        if (!gamepad) continue;
        for (const [index, button] of gamepad.buttons.entries()) {
            if (button.pressed) {
                __gamepadButtonEvent = !__gamepadButtonPressed;
                __gamepadButtonPressed = true;
                //__counter ++;
                //console.log("INPUT>> (" + __counter + ") Gamepad Button: " + __gamepadButtonEvent)
                return;
            }
        }
    }
    __gamepadButtonPressed = false;
}

// By default we take gamepad, only use mouse if no gamepad is available
function inputClickDetected() {
    if (__gamepadConnected)
        return __gamepadButtonEvent;
    return __clickDetected;
}

function inputClearClick() {
    __clickDetected         = false;
    __gamepadButtonEvent = false;
}


var __clickDetected = false;
var __keysDetected = []; // This is used to control keys which are hold, keys enter with the keyDown event and leave with the keyUp
var __keysPressed = []; // This is used to control keys which are pressed, keys enter with the keyPress event
var __gamepadButtonEvent = false;
var __gamepadButtonPressed = false;
var __gamepadConnected = false;
var __connectedGamepads = [];
//var __counter = 0;

/// Even Handling
function inputOnClick() {
    __clickDetected = true;
}

function inputOnKeyDown(event) {
    //console.log("INPUT>> Event Key Down: " + event.key + " Code: " + event.keyCode);
    let index = __keysDetected.indexOf(event.key);
    if (index >= 0) {
        // Key already registered
        return;
    }
    __keysDetected.push(event.key);
}

function inputOnKeyUp(event) {
    //console.log("INPUT>> Event Key Down: " + event.key + " Code: " + event.keyCode);
    __keysPressed.push(event.key);
    let index = __keysDetected.indexOf(event.key);
    if (index >= 0) {
        __keysDetected.splice(index, 1);
        return;
    }
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
    // Mouse Touch Events
    window.addEventListener(
        "mousedown", // Mouse down is more acurate than click, which triggers on mouse up
        inputOnClick,
        true
    )

    window.addEventListener(
        "touchstart", // Need this to get the event detected on Apple mobile devices
        inputOnClick,
        true
    )

    // Keyboard
    window.addEventListener(
        "keydown", // Need this to get the event detected on Apple mobile devices
        inputOnKeyDown,
        true
    )

    window.addEventListener(
        "keyup", // Need this to get the event detected on Apple mobile devices
        inputOnKeyUp,
        true
    )

    // GamePads
    window.addEventListener(
            "gamepadconnected", 
            inputOnGamePadConnected
    );

    window.addEventListener(
        "gamepaddisconnected",
        inputOnGamePadDisConnected
    );
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

function inputKeyDetected(key) {
    return (__keysDetected.indexOf(key) >= 0);
}

function inputKeyPressed(key) {
    return (__keysPressed.indexOf(key) >= 0);
}

function inputClearClick() {
    __clickDetected         = false;
    __gamepadButtonEvent    = false;
    __keysPressed           = []
}
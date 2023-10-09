// TODO
// . Add code to stop music

// Constants
var mainCanvasName = "mainCamvas";
var targetPosition = {
    x: 700,
    y: 450
};
var lastFrameTime;
var main2dContext;
var clickDetected = false;
var aimPointSettup = {
    rotationAngularSpeed: 1,            // 1 rotation every 2*PI seconds
    maxAmplitude: 50,           // Max distance to target
    amplitudePhase: 3.0           // 1 full cycle every 2*PI seconds
};

const commonColors = {
    red: { r: 255, g: 0, b: 0, a: 255, str: "rgba(255,0,0,1)" },
    green: { r: 0, g: 255, b: 0, a: 255, str: "rgba(0,255,0,1)" },
    blue: { r: 0, g: 0, b: 255, a: 255, str: "rgba(0,0,255,1)" },
    white: { r: 255, g: 255, b: 255, a: 255, str: "rgba(255,255,255,1)" },
    black: { r: 0, g: 0, b: 0, a: 255, str: "rgba(0,0,0,1)" },
}


var inGameSetup = {
    targetSize: 30,
    lives: 10
};

var startupSetup = {
    preload: {
        label: "Click To Start",
        pos: { x: 500, y: 360 },
        size: 60,
        color: { r: 0, g: 255, b: 0, a: 255 },
        align: "center"
    },
    loading: {
        label: "Loading",
        pos: { x: 500, y: 360 },
        size: 60,
        color: { r: 0, g: 255, b: 0, a: 255 },
        align: "center"
    },
}


var homeScreenSetup = {
    background: {
        image: "outgame-background-720"
    },
    title: {
        label: "Click To Start",
        pos: { x: 500, y: 360 },
        size: 60,
        color: { r: 0, g: 255, b: 0, a: 255 },
        align: "center"
    }
}

var hudSetup = {
    score: {
        pos: { x: 1050, y: 50 },
        size: 30,
        color: commonColors.black,
        align: "end",
        digits: 5
    },
    record: {
        pos: { x: 0, y: 50 },
        size: 30,
        color: commonColors.red,
        align: "start",
        digits: 5
    },
    lives: {
        pos: { x: 1050, y: 80 },
        size: 20,
        color: commonColors.blue,
        align: "start",
        label: "Lives: ",
        digits: "2"
    }
}


// Game Objects
const GAMEOBJECTTYPE = Object.freeze({
    GOT_TARGET: 1,
    GOT_AIMPOINT: 2,
    GOT_IMAGE: 3,
    GOT_TEXT: 4,
    GOT_GIF: 5
});

var gameObjects = {
    target: {},
    aimPoint: {},
    score: 0,
    lives: 10,
    record: 0,
    // Add other generic items here
    objects: []
};

const GAMESTATES = Object.freeze({
    GS_WAIT_FOR_INPUT: 0,   // Empty screen, you need user interaction to start the audio
    GS_PRE_LOADING: 1,      // Set up the loading queue and set transit to loading state immediatelly
    GS_LOADING: 2,          // Process the loading queue, once done move to Home Screen
    GS_HOME_SCREEN: 3,      // First screen with real assets, ask the user to play
    GS_PRE_GAME:4,          // Set variables needed for the game, then kick the match
    GS_IN_GAME: 5,      // In Game 
    GS_FINISHED: 6          // Game Over, waits for input to move to Home Screen Again
});
var gameState = GAMESTATES.GS_WAIT_FOR_INPUT;

const RENDERACTIONTYPE = Object.freeze({
    RAT_CLEAR: 0,
    RAT_CLEAR_COLOR: 1,
    RAT_CLEAR_NONE: 2,
    RAT_IMAGE_AT: 3,
    RAT_POINT_AT: 4,
    RAT_TEXT_AT: 5
});

var renderActions = {
    clearAction: {},
    actions: []
};

var images = {
    "outgame-background-720": {
        image: null,
        path: "img/outgame-background.png",
        size: {x: 1280, y: 720},
        //loaded: false
    },
    "ingame-background-720": {
        image: null,
        path: "img/ingame-background.png",
        size: {x: 1280, y: 720},
        //loaded: false
    },
    "tail": {
        image: null,
        path: "img/tail.png",
        size: {x: 146, y: 159},
        //loaded: false
    },
    "hitReaction": {
        image: null,
        path: "img/hitReaction.gif",
        size: {x: 200, y: 200},
        //loaded: false
    },
}

var sounds = {
    "hitSuccess": {
        filePath: "sound/HitSuccess.ogg",
        loop: false,
        volume: 1.0,
        buffer: null
    },
    "hitFail": {
        filePath: "sound/HitFail.ogg",
        loop: false,
        volume: 1.0,
        buffer: null
    },
    "outGameMusic": {
        filePath: "sound/IAmOnMyWay.ogg",
        loop: true,
        volume: 0.1,
        buffer: null
    },
    "inGameMusic": {
        filePath: "sound/ImABeleiver.ogg",
        loop: true,
        volume: 0.1,
        buffer: null
    }
}


/// Utilitary functinos
function colorToRGBA(color) {
    // TODO: Needs validations!!!
    if (!("str" in color) || color.str == "")
        color.str = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")"
    return color.str;
}

/// Utilitary functinos
function colorToAlpha01(color) {
    // TODO: Needs validations!!!
    return  color.a / 255;
}

/// Even Handling
function onClick() {
    clickDetected = true;
}


// Step for different object types
function stepTarget(dt) {

    renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR_NONE } // We use a full screen image. No need to clear
    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_IMAGE_AT, pos: { x: 0, y: 0 }, id: "ingame-background-720" })
    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: gameObjects.target.color, size: gameObjects.target.size })
}

function stepAimPoint(dt) {
    scoreFactor = 1 + (0.05) * gameObjects.score;

    gameObjects.aimPoint.angle += aimPointSettup.rotationAngularSpeed * dt * scoreFactor;
    gameObjects.aimPoint.amplitudPhase += aimPointSettup.amplitudePhase * dt * scoreFactor;

    currentAmplitude = aimPointSettup.maxAmplitude * Math.sin(gameObjects.aimPoint.amplitudPhase);
    //currentAmplitude = gameObjects.target.size/2 +1

    gameObjects.aimPoint.pos.x = gameObjects.target.pos.x - currentAmplitude * Math.sin(gameObjects.aimPoint.angle);
    gameObjects.aimPoint.pos.y = gameObjects.target.pos.y + currentAmplitude * Math.cos(gameObjects.aimPoint.angle);

    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_IMAGE_AT, pos: {x: gameObjects.aimPoint.pos.x - 20, y: gameObjects.aimPoint.pos.y - 15}, id: "tail" })

    if (Math.abs(currentAmplitude) <= gameObjects.target.size / 2) {
        renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.aimPoint.pos, color: commonColors.blue, size: gameObjects.aimPoint.size })
        if (clickDetected) {
            //console.log("Goal!!")
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: "Great!!",
                    pos: { x: 730, y: 360 },
                    color: structuredClone(commonColors.green),
                    size: 50,
                    align: "start",
                    behaviorQueue: [
                        { type: BEHAVIORTTYPES.BT_MOVETO, to: { x: 550, y: 360 }, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 0.2 },
                        { type: BEHAVIORTTYPES.BT_BLOCK },
                        { type: BEHAVIORTTYPES.BT_MOVE_ACCEL, accel: { x: 0, y: -200 }, time: 1.0 },
                        { type: BEHAVIORTTYPES.BT_FADE, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 1.0 },
                        { type: BEHAVIORTTYPES.BT_BLOCK },
                        { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
                    ]
                }
            );
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_GIF,
                    id: "hitReaction",
                    pos: { x: -200, y: 100 },
                    color: structuredClone(commonColors.black),
                    size: 1, // factor 1
                    behaviorQueue: [ // this gif last 2.5 seconds
                        { type: BEHAVIORTTYPES.BT_MOVETO, to: { x: 110, y: 100 }, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 0.2 },
                        { type: BEHAVIORTTYPES.BT_WAIT, time: 2.0 },
                        { type: BEHAVIORTTYPES.BT_FADE, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 0.5 },
                        { type: BEHAVIORTTYPES.BT_BLOCK },
                        { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
                    ]
                }
            );
            resouceSoundPlay(sounds['hitSuccess']);
            gameObjects.score++;
            if (gameObjects.score > gameObjects.record) {
                gameObjects.record = gameObjects.score;
                localStorage.setItem('record', String(gameObjects.record))
            }
        }
    }
    else {
        renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.aimPoint.pos, color: gameObjects.aimPoint.color, size: gameObjects.aimPoint.size })
        if (clickDetected) {
            renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR_COLOR, color: commonColors.red }
            //console.log("Fail " + Math.abs(currentAmplitude))
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: "Miss!",
                    pos: { x: 730, y: 360 },
                    color: structuredClone(commonColors.red),
                    size: 50,
                    align: "start",
                    behaviorQueue: [
                        { type: BEHAVIORTTYPES.BT_MOVETO, to: { x: 550, y: 360 }, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 0.2 },
                        { type: BEHAVIORTTYPES.BT_BLOCK },
                        { type: BEHAVIORTTYPES.BT_MOVE_ACCEL, accel: { x: 0, y: 150 }, time: 1.0 },
                        { type: BEHAVIORTTYPES.BT_FADE, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 1.0 },
                        { type: BEHAVIORTTYPES.BT_BLOCK },
                        { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
                    ]
                }
            );
            gameObjects.lives--;
            resouceSoundPlay(sounds['hitFail']);
            if (gameObjects.lives <= 0) {
                gameState = GAMESTATES.GS_FINISHED;
            }

        }
    }
}

function stepHud(dt) {
    renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: ("0000000000000" + String(gameObjects.score)).slice(-hudSetup.score.digits),
            pos: hudSetup.score.pos,
            color: hudSetup.score.color,
            size: hudSetup.score.size,
            align: hudSetup.score.align
        });
    renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: ("0000000000000" + String(gameObjects.record)).slice(-hudSetup.record.digits),
            pos: hudSetup.record.pos,
            color: hudSetup.record.color,
            size: hudSetup.record.size,
            align: hudSetup.record.align
        });
    renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: hudSetup.lives.label + ("00000" + String(gameObjects.lives)).slice(-hudSetup.lives.digits),
            pos: hudSetup.lives.pos,
            color: hudSetup.lives.color,
            size: hudSetup.lives.size,
            align: hudSetup.lives.align
        });
}

function stepObjects(dt) {
    for (let i = 0; i < gameObjects.objects.length;) {
        theObject = gameObjects.objects[i];
        shouldPop = stepBehaviors(theObject, dt);
        if (shouldPop) {
            switch (theObject.type) {
                case GAMEOBJECTTYPE.GOT_GIF:
                    theObject.imgDiv.remove();
                    break;
                default:
                    break;
            }
            gameObjects.objects.splice(i, 1);
            continue;
        }
        else
            i++;

        switch (theObject.type) {
            case GAMEOBJECTTYPE.GOT_TEXT:
                renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_TEXT_AT,
                        text: theObject.label,
                        pos: theObject.pos,
                        color: theObject.color,
                        size: theObject.size,
                        align: theObject.align
                    });
                break;
            case GAMEOBJECTTYPE.GOT_IMAGE:
                renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_IMAGE_AT,
                        pos: theObject.pos,
                        id: theObject.id
                    });
                break;
            case GAMEOBJECTTYPE.GOT_GIF:
                if (!("imgDiv" in theObject))
                {
                    theObject.imgDiv = document.createElement('div');
                    theObject.imgDiv.style.cssText = "position:absolute;top:" + theObject.pos.y + "px;left:" + theObject.pos.x + "px;width:" + images[theObject.id].size.x + "px;height:" + images[theObject.id].size.y + "px;opacity:" + colorToAlpha01(theObject.color) + ";z-index:100;background:#000";
                    document.body.appendChild(theObject.imgDiv);
                    theObject.imgDiv.appendChild(images[theObject.id].image)
                }
                else
                {
                    theObject.imgDiv.style.cssText = "position:absolute;top:" + theObject.pos.y + "px;left:"  + theObject.pos.x + "px;width:" + images[theObject.id].size.x + "px;height:" + images[theObject.id].size.y + "px;opacity:" + colorToAlpha01(theObject.color) + ";z-index:100;background:#000";
                }
                break;
        }
    }
}

function renderClear(clearObject) {
    switch (clearObject.type) {
        case RENDERACTIONTYPE.RAT_CLEAR:
            main2dContext.context.clearRect(0, 0, main2dContext.width, main2dContext.height);
            break;
        case RENDERACTIONTYPE.RAT_CLEAR_COLOR:
            main2dContext.context.fillStyle = colorToRGBA(clearObject.color)
            main2dContext.context.rect(0, 0, main2dContext.width, main2dContext.height);
            main2dContext.context.fill();
            break;
        case RENDERACTIONTYPE.RAT_CLEAR_NONE:
            break;
    }
}

function renderAction(renderAction) {
    switch (renderAction.type) {
        case RENDERACTIONTYPE.RAT_POINT_AT:
            // Reference for optimal draw many pixels (particles) https://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas
            main2dContext.context.fillStyle = colorToRGBA(renderAction.color)
            main2dContext.context.beginPath();
            main2dContext.context.arc(renderAction.pos.x, renderAction.pos.y, renderAction.size / 2, 0, 2 * Math.PI, true);
            main2dContext.context.closePath();
            main2dContext.context.fill();
            break;
        case RENDERACTIONTYPE.RAT_TEXT_AT: // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
            main2dContext.context.font = renderAction.size + "px Orbitron";
            main2dContext.context.textAlight = renderAction.align;
            main2dContext.context.strokeStyle = 'black';
            main2dContext.context.lineWidth = 1;
            main2dContext.context.strokeText(renderAction.text, renderAction.pos.x, renderAction.pos.y);
            main2dContext.context.fillStyle = colorToRGBA(renderAction.color)
            main2dContext.context.fillText(renderAction.text, renderAction.pos.x, renderAction.pos.y);
            break;
        case RENDERACTIONTYPE.RAT_IMAGE_AT: // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
            main2dContext.context.drawImage(images[renderAction.id].image, renderAction.pos.x, renderAction.pos.y);
            break;
    }
}


/// Main Game loop
function step(curentTime) {
    if (!lastFrameTime) lastFrameTime = curentTime;
    var dt = (curentTime - lastFrameTime) / 1000; // current time is in miliseconds
    lastFrameTime = curentTime;

    //// Run game logic 
    switch (gameState) {
        case GAMESTATES.GS_WAIT_FOR_INPUT:
            if (clickDetected) {
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
                gameState = GAMESTATES.GS_PRE_LOADING;
            }
            else {
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
                renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_TEXT_AT,
                        text: startupSetup.preload.label,
                        pos: startupSetup.preload.pos,
                        color: startupSetup.preload.color,
                        size: startupSetup.preload.size,
                        align: startupSetup.preload.align
                    });
            }
            break;
        case GAMESTATES.GS_PRE_LOADING:
            // Init Audio system, can only do this once the user has interacted
            resourceSoundInit();
            renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }

            for (const imageId in images) {
                //images[imageId].image = document.getElementById(imageId)
                ///images[imageId].loaded = false;
                ///images[imageId].image.addEventListener("load", function () {
                ///    images[imageId].loaded = true;
                ///  });
                images[imageId].image = new Image();
                //images[imageId].image.onload = function(){
                //    images[imageId].loaded = true;
                //};
                images[imageId].image.src = images[imageId].path;
            }
            for (const soundId in sounds) {
                resouceSoundLoad(sounds[soundId]);
            }

            gameState = GAMESTATES.GS_LOADING;
            break;
        case GAMESTATES.GS_LOADING:
            countTotal = 0;
            countReady = 0;

            for (const imageId in images) {
                countTotal++;
                if (images[imageId].image.complete)
                    countReady++
            }

            for (const soundId in sounds) {
                countTotal++;
                if (sounds[soundId].buffer)
                    countReady++
            }

            if (countTotal == countReady) {
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }

                // Start outGame Music
                resouceSoundPlay(sounds['outGameMusic']);
                gameState = GAMESTATES.GS_HOME_SCREEN;
            }
            else {
                greyLevel = Math.trunc((255 / countTotal) * countReady)
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR_COLOR, color: { r: greyLevel, g: greyLevel, b: greyLevel, a: 255 } }
            }

            renderActions.actions.push(
                {
                    type: RENDERACTIONTYPE.RAT_TEXT_AT,
                    text: startupSetup.loading.label,
                    pos: startupSetup.loading.pos,
                    color: startupSetup.loading.color,
                    size: startupSetup.loading.size,
                    align: startupSetup.loading.align
                });

            break;
        case GAMESTATES.GS_HOME_SCREEN:
            if (clickDetected) {
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
                gameState = GAMESTATES.GS_PRE_GAME;
            }
            else {
                renderActions.actions.push(
                    { 
                        type: RENDERACTIONTYPE.RAT_IMAGE_AT,
                        pos: { x: 0, y: 0 }, id: homeScreenSetup.background.image,
                    },
                    {
                        type: RENDERACTIONTYPE.RAT_TEXT_AT,
                        text: homeScreenSetup.title.label,
                        pos: homeScreenSetup.title.pos,
                        color: homeScreenSetup.title.color,
                        size: homeScreenSetup.title.size,
                        align: homeScreenSetup.title.align
                    });
            }
            break;
        case GAMESTATES.GS_PRE_GAME:
            gameObjects.target = { type: GAMEOBJECTTYPE.GOT_TARGET, pos: { x: targetPosition.x, y: targetPosition.y }, color: { r: 200, g: 0, b: 0, a: 255 }, size: inGameSetup.targetSize };
            gameObjects.aimPoint = { type: GAMEOBJECTTYPE.GOT_AIMPOINT, pos: { x: targetPosition.x + 50, y: targetPosition.y + 50 }, color: { r: 0, g: 200, b: 0, a: 255 }, size: 10, angle: 0, amplitudPhase: 0 }
            gameObjects.score = 0;
            gameObjects.record = localStorage.getItem('record') ? parseInt(localStorage.getItem('record')) : 0;
            gameObjects.lives = inGameSetup.lives;

            // Start Ingame Music
            resouceSoundPlay(sounds['inGameMusic']);
            gameState = GAMESTATES.GS_IN_GAME;
            break;
        case GAMESTATES.GS_IN_GAME:
            stepTarget(dt);
            stepAimPoint(dt);
            stepHud(dt);
            stepObjects(dt);
            break;
        case GAMESTATES.GS_FINISHED:
            stepTarget(dt);
            stepHud(dt);
            if (clickDetected) {
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
                gameState = GAMESTATES.GS_HOME_SCREEN;
            }
            else {
                renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
                gameObjects.objects.push(
                    {
                        type: GAMEOBJECTTYPE.GOT_TEXT,
                        label: "FAIL",
                        pos: { x: 500, y: 360 },
                        color: structuredClone(commonColors.red),
                        size: 100,
                        align: "center",
                        behaviorQueue: [
                        ]
                    }
                );
                gameObjects.objects.push(
                    {
                        type: GAMEOBJECTTYPE.GOT_TEXT,
                        label: "Click to Continue",
                        pos: { x: 490, y: 420 },
                        color: structuredClone(commonColors.red),
                        size: 30,
                        align: "center",
                        behaviorQueue: [
                        ]
                    }
                );
            }
            stepObjects(dt);
            break;
    }

    // Clear the click flag 
    clickDetected = false

    //// Render
    renderClear(renderActions.clearAction)
    for (ra of renderActions.actions) {
        renderAction(ra)
    }
    renderActions.clearAction = {};
    renderActions.actions = [];

    // Schedule running this function again
    window.requestAnimationFrame(step);
}

function main() {
    // Detect the main canvas properties and run some validations
    const canvasElement = document.getElementById(mainCanvasName);

    if (!canvasElement) {
        alert("The game requieres a canvas named " + mainCanvasName);
        return;
    }

    main2dContext = {
        context: canvasElement.getContext("2d"),
        width: canvasElement.width,
        height: canvasElement.height
    }

    // Eveything is ok, prepare to run the game then register the input detection and trigger the game loop
    gameState = GAMESTATES.GS_WAIT_FOR_INPUT;

    /*
    window.mobileCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|android|ipad|playbook|silk|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      };

    if (window.mobileCheck()) {
        window.addEventListener(
            "ontouchstart", // This is more acurate than mouse down on mobile devices
            onClick,
            true
        )
    }
    else
    */
    {
        window.addEventListener(
            "mousedown", // Mouse down is more acurate than click, which triggers on mouse up
            onClick,
            true
        )
    }

    window.requestAnimationFrame(step);
}


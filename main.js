// Constants
var mainCanvasName = "mainCamvas";
var targetPosition = {
    x: 700,
    y: 450
};
var lastFrameTime;
var main2dContext;
var aimPointSettup = {
    rotationAngularSpeed: 0.5,      // 1 rotation every 2*PI seconds, the bigger the harder
    maxAmplitude: 50,               // Max distance to target
    amplitudePhase: 3.0,            // 1 full cycle every 2*PI seconds
    dificultiFactor: 0.03,          // How much harder it becomes with every new point
};

var inGameSetup = {
    targetSize: 30,
    lives: 10,
    controlIgnoreTime:.3, // How much we wait before allowing another input
};

var startupSetup = {
    preload: {
        label: "Tap To Start",
        pos: { x: 640, y: 360 },
        size: 60,
        color: { r: 0, g: 255, b: 0, a: 255 },
        align: "center",
        rotation: 0
    },
    loading: {
        label: "Loading",
        pos: { x: 640, y: 360 },
        size: 60,
        color: { r: 0, g: 255, b: 0, a: 255 },
        align: "center",
        rotation: 0
    },
}


var homeScreenSetup = {
    background: {
        image: "outgame-background-720"
    },
    /*
    title: {
        label: "E-DONKEY",
        pos: { x: 640, y: 260 },
        size: 150,
        color: { r: 255, g: 255, b: 255, a: 255 },
        align: "center",
        rotation: 0
    },
    */
    logo: {
        id: "logo",
        pos: { x: 140, y: 0 },
        rotation: 0
    },
    subTitle: {
        label: "Tap To Play",
        pos: { x: 640, y: 560 },
        size: 60,
        color: { r: 0, g: 255, b: 0, a: 255 },
        align: "center",
        rotation: 0
    }
}

var hudSetup = {
    score: {
        pos: { x: 1230, y: 50 },
        label: "Score: ",
        size: 30,
        color: commonColors.black,
        align: "right",
        digits: 5,
        rotation: 0
    },
    record: {
        pos: { x: 50, y: 50 },
        label: "Record: ",
        size: 30,
        color: commonColors.red,
        align: "left",
        digits: 5,
        rotation: 0
    },
    lives: {
        pos: { x: 1230, y: 80 },
        size: 20,
        color: commonColors.blue,
        align: "right",
        label: "Lives: ",
        digits: "2",
        rotation: 0
    }
}

var darkVeilSetup= {
    color:  { r: 128, g: 128, b: 128, a: 128},
    fadeTime: 0.3,
}

var leaderboardSetup = {
    title: {
        pos: { x: 640, y: 50 },
        label: "Best Players!",
        size: 50,
        color: commonColors.black,
        align: "center",
        rotation: 0
    },
    rows: {
        startAt: { x: 50, y: 100 },
        separation: { x: 0, y: 50},
        size: 30,
        color: commonColors.black,
        rotation: 0
    },
    position: {
        align: "right",
        relativePos: { x: 0, y: 0},
    },
    names: {
        align: "left",
        relativePos: { x: 80, y: 0},
    },
    scores: {
        align: "right",
        relativePos: { x: 1180, y: 0},
    },
}


// Game Objects
const GAMEOBJECTTYPE = Object.freeze({
    GOT_TARGET: 1,
    GOT_AIMPOINT: 2,
    GOT_IMAGE: 3,
    GOT_TEXT: 4,
    GOT_GIF: 5,
    GOT_RECTANGLE: 6,
});

var gameObjects = {
    target: {},
    aimPoint: {},
    score: 0,
    lives: 10,
    record: 0,
    deadControlTime: 0,
    // Add other generic items here
    objects: []
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
    "logo": {
        image: null,
        path: "img/logo3.png",
        size: {x: 1000, y: 300},
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
        filePath: "sound/HitSuccess.mp3",
        loop: false,
        singleInstance: false,
        volume: 1.0,
        buffer: null,
        soundNode: null
    },
    "hitFail": {
        filePath: "sound/HitFail.mp3",
        loop: false,
        singleInstance: false,
        volume: 1.0,
        buffer: null,
        soundNode: null
    },
    "outGameMusic": {
        filePath: "sound/IAmOnMyWay.mp3",
        loop: true,
        singleInstance: true,
        volume: 0.1,
        buffer: null,
        soundNode: null
    },
    "inGameMusic": {
        filePath: "sound/ImABeleiver.mp3",
        loop: true,
        singleInstance: true,
        volume: 0.1,
        buffer: null,
        soundNode: null
    }
};

function setDarkVeil(fade) {
    if (fade) {
        gameObjects.objects.push(
            {
                type: GAMEOBJECTTYPE.GOT_RECTANGLE,
                pos: {x: 0, y: 0},
                color: {r: darkVeilSetup.color.r, g: darkVeilSetup.color.g, b: darkVeilSetup.color.b, a: 0},
                scale: {x: main2dContext.width, y: main2dContext.height},
                behaviorQueue: [
                    { type: BEHAVIORTTYPES.BT_FADE, to: darkVeilSetup.color.a, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: darkVeilSetup.fadeTime },
                ]
            }
        );
    }
    else
    {
        gameObjects.objects.push(
            {
                type: GAMEOBJECTTYPE.GOT_RECTANGLE,
                pos: {x: 0, y: 0},
                color: darkVeilSetup.color,
                scale: {x: main2dContext.width, y: main2dContext.height},
                behaviorQueue: [
                ]
            }
        );
    }
}

/// Main FSM States and code
const GAMESTATES = Object.freeze({
    GS_WAIT_FOR_INPUT: 0,   // Empty screen, you need user interaction to start the audio
    GS_LOADING: 1,          // Process the loading queue, once done move to Home Screen
    GS_HOME_SCREEN: 2,      // First screen with real assets, ask the user to play
    GS_IN_GAME: 3,          // In Game 
    GS_FINISHED: 4,         // Game Over, waits for input to move to Home Screen Again
    GS_LEADERBOARD: 5       // Show the Leaderboard
});

FSMRegisterState(GAMESTATES.GS_WAIT_FOR_INPUT, 
    null, // OnEnter
    (dt) => { 
        if (inputClickDetected()) {
            renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
            FSMTransitToState(GAMESTATES.GS_LOADING)
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
                    align: startupSetup.preload.align,
                    rotation: startupSetup.preload.rotation,
                });
        }
    }, // OnStep
    null, //OnExit
)

FSMRegisterState(GAMESTATES.GS_LOADING, 
    () => { 
         // Init Audio system, can only do this once the user has interacted
         resourceSoundInit();
         renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }

         for (const imageId in images) {
             images[imageId].image = new Image();
             images[imageId].image.src = images[imageId].path;
         }
         if (resourceSoundIsAvailable()) {
            for (const soundId in sounds) {
                resouceSoundLoad(sounds[soundId]);
            }
         }
    }, //OnEnter
    (dt) => { 
        countTotal = 0;
        countReady = 0;

        for (const imageId in images) {
            countTotal++;
            if (images[imageId].image.complete)
                countReady++
        }

        if (resourceSoundIsAvailable()) {
            for (const soundId in sounds) {
                countTotal++;
                if (sounds[soundId].buffer)
                    countReady++
            }
        }

        if (countTotal == countReady) {
            renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
            FSMTransitToState(GAMESTATES.GS_HOME_SCREEN)
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
                align: startupSetup.loading.align,
                rotation: startupSetup.loading.rotation
            });

    }, //OnStep
    null, //OnExit
)


FSMRegisterState(GAMESTATES.GS_HOME_SCREEN, 
    () => {
        // Start outGame Music
        resouceSoundPlay(sounds['outGameMusic']);
        gameObjects.objects.push(
            {
                type: GAMEOBJECTTYPE.GOT_IMAGE,
                pos: { x: 0, y: 0 },
                id: homeScreenSetup.background.image,
                rotation: 0,
                behaviorQueue: [
                ]
            },
            /*
            {
                type: GAMEOBJECTTYPE.GOT_TEXT,
                label: homeScreenSetup.title.label,
                pos: homeScreenSetup.title.pos,
                color: homeScreenSetup.title.color,
                size: homeScreenSetup.title.size,
                align: homeScreenSetup.title.align,
                rotation: homeScreenSetup.title.rotation,
                behaviorQueue: [
                    { type: BEHAVIORTTYPES.BT_ROTATE, from: 0, to: Math.PI / 24, interpolationType: INTERPOLATIONTYPE.IT_SINCURVE, time: 20 },
                    { type: BEHAVIORTTYPES.BT_BLOCK },
                    { type: BEHAVIORTTYPES.BT_LOOP },
                ]
            },
            */
            {
                type: GAMEOBJECTTYPE.GOT_IMAGE,
                pos: homeScreenSetup.logo.pos,
                id: homeScreenSetup.logo.id,
                rotation: homeScreenSetup.logo.rotation,
                behaviorQueue: [
                    { type: BEHAVIORTTYPES.BT_ROTATE, from: 0, to: Math.PI / 24, interpolationType: INTERPOLATIONTYPE.IT_SINCURVE, time: 20 },
                    { type: BEHAVIORTTYPES.BT_BLOCK },
                    { type: BEHAVIORTTYPES.BT_LOOP },
                ]
            },
            {
                type: GAMEOBJECTTYPE.GOT_TEXT,
                label: homeScreenSetup.subTitle.label,
                pos: homeScreenSetup.subTitle.pos,
                color: homeScreenSetup.subTitle.color,
                size: homeScreenSetup.subTitle.size,
                align: homeScreenSetup.subTitle.align,
                rotation: homeScreenSetup.subTitle.rotation,
                behaviorQueue: [
                    { type: BEHAVIORTTYPES.BT_FADE, from: 255, to: 255, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 0.01 }, /// HACK SINCE THE LOOP ENDS WITH 0 OPACITY
                    { type: BEHAVIORTTYPES.BT_SCALE, from: homeScreenSetup.subTitle.size, to: homeScreenSetup.subTitle.size * 1.05, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 2.0 },
                    { type: BEHAVIORTTYPES.BT_WAIT, time: 1.0 },
                    { type: BEHAVIORTTYPES.BT_FADE, from: 255, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 1.0 },
                    { type: BEHAVIORTTYPES.BT_BLOCK },
                    { type: BEHAVIORTTYPES.BT_WAIT, time: 0.1 },
                    { type: BEHAVIORTTYPES.BT_LOOP },
                ]
            }
        );
    }, // OnEnter
    (dt) => {
        if (inputClickDetected()) {
            renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
            clearGameObjects();
            FSMTransitToState(GAMESTATES.GS_IN_GAME);
        }
    }, // OnStep
    () => {
        resouceSoundStop(sounds['outGameMusic']);
    } //OnExit
)

FSMRegisterState(GAMESTATES.GS_IN_GAME, 
    () => {
        gameObjects.target = { type: GAMEOBJECTTYPE.GOT_TARGET, pos: { x: targetPosition.x, y: targetPosition.y }, color: commonColors.black, size: inGameSetup.targetSize };
        gameObjects.aimPoint = { type: GAMEOBJECTTYPE.GOT_AIMPOINT, pos: { x: targetPosition.x + 50, y: targetPosition.y + 50 }, color: commonColors.red, size: 10, angle: 0, amplitudPhase: 0 }
        gameObjects.score = 0;
        gameObjects.record = localStorage.getItem('record') ? parseInt(localStorage.getItem('record')) : 0;
        gameObjects.lives = inGameSetup.lives;

        // Start Ingame Music
        resouceSoundPlay(sounds['inGameMusic']);
    }, // OnEnter
    (dt) => { 
        stepTarget(dt);
        stepAimPoint(dt);
        stepHud(dt);
    }, // OnStep
    () => { }, //OnExit
)

FSMRegisterState(GAMESTATES.GS_FINISHED, 
    () => {
        setDarkVeil(true);
        gameObjects.objects.push(
            {
                type: GAMEOBJECTTYPE.GOT_TEXT,
                label: "GAME OVER",
                pos: { x: 640, y: 360 },
                color: structuredClone(commonColors.red),
                size: 100,
                align: "center",
                rotation: 0,
                behaviorQueue: [
                ]
            },
            {
                type: GAMEOBJECTTYPE.GOT_TEXT,
                label: "Tap to Continue",
                pos: { x: 640, y: 420 },
                color: structuredClone(commonColors.red),
                size: 30,
                align: "center",
                rotation: 0,
                behaviorQueue: [
                ]
            }
        );
    }, // OnEnter
    (dt) => {
        stepTarget(dt);
        stepHud(dt);
        if (inputClickDetected()) {            
            FSMTransitToState(GAMESTATES.GS_LEADERBOARD)
        }
    }, // OnStep
    () => {
        clearGameObjects();
        //resouceSoundStop(sounds['inGameMusic']);
    }, //OnExit
)

FSMRegisterState(GAMESTATES.GS_LEADERBOARD, 
    () => {
        setDarkVeil(false);
        gameObjects.objects.push(
            {
                type: GAMEOBJECTTYPE.GOT_TEXT,
                label: leaderboardSetup.title.label,
                pos: leaderboardSetup.title.pos,
                color: leaderboardSetup.title.color,
                size: leaderboardSetup.title.size,
                align: leaderboardSetup.title.align,
                rotation: leaderboardSetup.title.rotation,
                behaviorQueue: [
                ]
            }
        );

        let rowPosition = leaderboardSetup.rows.startAt;
        for (let i = 0; i < __leaderBoardData.entries.length; i++)
        {
            let entry = __leaderBoardData.entries[i];
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: "" + (i+1),
                    pos: v2Add(rowPosition, leaderboardSetup.position.relativePos),
                    color: structuredClone(leaderboardSetup.rows.color),
                    size: leaderboardSetup.rows.size,
                    align: leaderboardSetup.position.align,
                    rotation: leaderboardSetup.rows.rotation,
                    behaviorQueue: [
                    ]
                },
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: entry.name,
                    pos: v2Add(rowPosition, leaderboardSetup.names.relativePos),
                    color: structuredClone(leaderboardSetup.rows.color),
                    size: leaderboardSetup.rows.size,
                    align: leaderboardSetup.names.align,
                    rotation: leaderboardSetup.rows.rotation,
                    behaviorQueue: [
                    ]
                },
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: entry.score,
                    pos: v2Add(rowPosition, leaderboardSetup.scores.relativePos),
                    color: structuredClone(leaderboardSetup.rows.color),
                    size: leaderboardSetup.rows.size,
                    align: leaderboardSetup.scores.align,
                    rotation: leaderboardSetup.rows.rotation,
                    behaviorQueue: [
                    ]
                }
            );
            rowPosition = v2Add(rowPosition, leaderboardSetup.rows.separation);
        }
    }, // OnEnter
    (dt) => {
        stepTarget(dt);
        if (inputClickDetected()) {            
            FSMTransitToState(GAMESTATES.GS_HOME_SCREEN)
        }
    }, // OnStep
    () => {
        clearGameObjects();
        resouceSoundStop(sounds['inGameMusic']);
    }, //OnExit
)

/*
FSMRegisterState(GAMESTATES.GS_WAIT_FOR_INPUT, 
    () => { }, // OnEnter
    (dt) => { }, // OnStep
    () => { }, //OnExit
)*/

/*
FSMTransitToState(1);
FSMStep(0.33);
FSMTransitToState(2);
FSMStep(0.15);
*/

// Step for different object types
function stepTarget(dt) {

    renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR_NONE } // We use a full screen image. No need to clear
    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_IMAGE_AT, pos: { x: 0, y: 0 }, rotation: 0, id: "ingame-background-720" })
    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: gameObjects.target.color, size: gameObjects.target.size * 3 })
    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: commonColors.white, size: gameObjects.target.size* 2 })
    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: gameObjects.target.color, size: gameObjects.target.size })
}

function stepAimPoint(dt) {
    scoreFactor = 1 + (aimPointSettup.dificultiFactor) * gameObjects.score;

    gameObjects.aimPoint.angle += aimPointSettup.rotationAngularSpeed * dt * scoreFactor;
    gameObjects.aimPoint.amplitudPhase += aimPointSettup.amplitudePhase * dt * scoreFactor;

    currentAmplitude = aimPointSettup.maxAmplitude * Math.sin(gameObjects.aimPoint.amplitudPhase);
    //currentAmplitude = gameObjects.target.size/2 +1

    gameObjects.aimPoint.pos.x = gameObjects.target.pos.x - currentAmplitude * Math.sin(gameObjects.aimPoint.angle);
    gameObjects.aimPoint.pos.y = gameObjects.target.pos.y + currentAmplitude * Math.cos(gameObjects.aimPoint.angle);

    renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_IMAGE_AT, pos: {x: gameObjects.aimPoint.pos.x - 20, y: gameObjects.aimPoint.pos.y - 15}, rotation: 0, id: "tail" })

    gameObjects.deadControlTime -= dt;
    if (gameObjects.deadControlTime > 0)
        return;

    if (Math.abs(currentAmplitude) <= gameObjects.target.size / 2) {
        renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.aimPoint.pos, color: commonColors.green, size: gameObjects.aimPoint.size })
        if (inputClickDetected()) {
            //console.log("Goal!!")
            gameObjects.deadControlTime = inGameSetup.controlIgnoreTime;
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: "Great!!",
                    pos: { x: 730, y: 360 },
                    color: structuredClone(commonColors.green),
                    size: 50,
                    align: "left",
                    rotation: 0,
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
        if (inputClickDetected()) {
            gameObjects.deadControlTime = inGameSetup.controlIgnoreTime;
            //console.log("Fail " + Math.abs(currentAmplitude))
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: "Miss!",
                    pos: { x: 730, y: 360 },
                    color: structuredClone(commonColors.red),
                    size: 50,
                    align: "left",
                    rotation: 0,
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
                FSMTransitToState(gameState = GAMESTATES.GS_FINISHED);
            }
        }
    }
}

function stepHud(dt) {
    renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: hudSetup.score.label +  ("0000000000000" + String(gameObjects.score)).slice(-hudSetup.score.digits),
            pos: hudSetup.score.pos,
            color: hudSetup.score.color,
            size: hudSetup.score.size,
            align: hudSetup.score.align,
            rotation: hudSetup.score.rotation
        });
    renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: hudSetup.record.label + ("0000000000000" + String(gameObjects.record)).slice(-hudSetup.record.digits),
            pos: hudSetup.record.pos,
            color: hudSetup.record.color,
            size: hudSetup.record.size,
            align: hudSetup.record.align,
            rotation: hudSetup.record.rotation
        });
    renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: hudSetup.lives.label + ("00000" + String(gameObjects.lives)).slice(-hudSetup.lives.digits),
            pos: hudSetup.lives.pos,
            color: hudSetup.lives.color,
            size: hudSetup.lives.size,
            align: hudSetup.lives.align,
            rotation: hudSetup.record.rotation
        });
}

function clearGameObjects()
{
    // Make sure all game objects are erased on the next step
    for (gameObject of gameObjects.objects)
    {
        gameObject.behaviorQueue = [
            { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
        ];
    }
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
                        align: theObject.align,
                        rotation: theObject.rotation
                    });
                break;
            case GAMEOBJECTTYPE.GOT_IMAGE:
                renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_IMAGE_AT,
                        pos: theObject.pos,
                        id: theObject.id,
                        rotation: theObject.rotation,
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
            case GAMEOBJECTTYPE.GOT_RECTANGLE:
                renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_RECTANGLE_AT,
                        color: theObject.color, 
                        pos: theObject.pos,
                        scale: theObject.scale
                    });
                break;
        }
    }
}




/// Main Game loop
function step(curentTime) {
    if (!lastFrameTime) lastFrameTime = curentTime;
    var dt = (curentTime - lastFrameTime) / 1000; // current time is in miliseconds
    lastFrameTime = curentTime;

    // Capture Input
    inputStep();

    FSMStep(dt); // Step the game logic
    stepObjects(dt);

    // Clear the click flag 
    inputClearClick();

    //// Render
    render();
    renderFlush();
    
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

    inputInit();
    leaderboardInit();

    ///  Test code
    leaderboardReset();
    testArray = [10, 10, 10, 20, 5, 6, 7, 8, 4, 3, 2, 1, 1, 1, 1, 1, 6, 7, 8, 9, 10, 20, 20, 30 , 40 , 50, 70, 100, 10, 30, 30, 40, 50, 5, 6, 7, 8, 9, 10, 1, 1, 1, 100 ]
    for (let i= 0; i< testArray.length; i++)
        leaderboardTryAddEntry("Name_"+ i, testArray[i]);

    // Eveything is ok, prepare to run the game then register the input detection and trigger the game loop
    FSMTransitToState(GAMESTATES.GS_WAIT_FOR_INPUT);
    
    window.requestAnimationFrame(step);
}


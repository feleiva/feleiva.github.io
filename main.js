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

var emittersTemplates = {
    fire: new EmitterTemplate(
        [-5, 5],    // birthX range from game object origin 
        [-2, 2],     // birthy range from game object origin 
        [-15, 15],  // velX range at birth  
        [-350, -400],  // velY range at birth 
        [2, 3],     // radious Range
        0.3,         // Emit Time
        800,         // emit Rate
        [3, 4],   // Particle life Range
        {r: 255, g: 95, b: 31, a: 255}, // Birth Color
        {r: 255, g: 241, b: 18, a: 128} // Death Color
    ), 
}


var scoreTextsSetup = {
    hitTexts: {
        pos: { x: 730, y: 360 },
        color: commonColors.green,
        size: 50,
        align: "left",
        rotation: 0,
        labels: [
            ["Good!", "Score!", "Bravo!", "Well Done!"], // First hit
            ["Great!" ,"Nice Job!", "Double Hit!", "You got this"], // 2 hits in a row
            ["Impresive!", "Triple Combo", "Keep the flow!"], // 3 hits in a row
            ["Outstanding!", "That shoudl hurt!", "Wow 4 in a row"], // 4 hits in a row 
            ["Aboslutelly Awesome!", "Unstoppable!", "You are rocking!", "Keep on keeping on!", "Hats off to you!", "This is your day!  "] // 5 hits in a row or more
        ],
        behaviorQueue: [
            { type: BEHAVIORTTYPES.BT_MOVETO, to: { x: 550, y: 360 }, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_BLOCK },
            { type: BEHAVIORTTYPES.BT_MOVE_ACCEL, accel: { x: 0, y: -200 }, time: 1.0 },
            { type: BEHAVIORTTYPES.BT_FADE, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 1.0 },
            { type: BEHAVIORTTYPES.BT_BLOCK },
            { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
        ]
    },
    missTexts: {
        pos: { x: 730, y: 360 },
        color: commonColors.red,
        size: 50,
        align: "left",
        rotation: 0,
        labels: [ // A random one is chosen on every failure
            "Keep Trying!",
            "You can do it!",
            "Don't give up!",
            "Sooo close!!",
            "Failure is success in progress."
        ],
        behaviorQueue: [
            { type: BEHAVIORTTYPES.BT_MOVETO, to: { x: 550, y: 360 }, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_BLOCK },
            { type: BEHAVIORTTYPES.BT_MOVE_ACCEL, accel: { x: 0, y: 200 }, time: 1.0 },
            { type: BEHAVIORTTYPES.BT_FADE, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 1.0 },
            { type: BEHAVIORTTYPES.BT_BLOCK },
            { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
        ]
    },
    newRecord: {
        pos: { x: 640, y: 150 },
        color: commonColors.white,
        size: 80,
        align: "center",
        rotation: 0,
        label: "New Record",
        behaviorQueue: [
            { type: BEHAVIORTTYPES.BT_SCALE, from: 150, to: 80, interpolationType: INTERPOLATIONTYPE.IT_EASIIN, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_WAIT, time: 1.8 },
            { type: BEHAVIORTTYPES.BT_FADE, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_BLOCK },
            { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
        ]
    },
    timeLimit: {
        pos: { x: 570, y: 460 },
        color: commonColors.red,
        size: 150,
        align: "center",
        rotation: 0,
        behaviorQueue: [
            { type: BEHAVIORTTYPES.BT_SCALE, to: 80, interpolationType: INTERPOLATIONTYPE.IT_EASIOUT, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_FADE, from: 0, to: 255, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_WAIT, time: 0.6 },
            { type: BEHAVIORTTYPES.BT_FADE, from: 255, to: 0, interpolationType: INTERPOLATIONTYPE.IT_LINEAL, time: 0.2 },
            { type: BEHAVIORTTYPES.BT_BLOCK },
            { type: BEHAVIORTTYPES.BT_KILL, time: 0.0 }
        ]
    }
}

var inGameSetup = {
    targetSize: 30,
    lives: 10,
    controlIgnoreTime:.3,           // How much we wait before allowing another input
    controlEventTimeout: 15,        // How long we wait for input before Game Over
    controlEventLabelStartAt: 5,    // How much time remaining before showing the timer on screen
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
    GOT_PARTICLE_EMITTER: 7,
});

var gameObjects = {
    target: {},
    aimPoint: {},
    score: 0,
    hitsInARow: 0,
    lives: 10,
    record: 0,
    deadControlTime: 0,
    controlTimmeout: 0,
    playerName: "",
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

function askPlayerName() {
    inputText = document.getElementById("fname");
    if (inputText) {
        document.getElementById("playerName").style.display = 'block';
        inputText.value = "";
        inputText.focus();    
    }
}

function setPlayerName(playerName) {
    if (playerName != "") {
        gameObjects.playerName = playerName;
        document.getElementById("playerName").style.display = 'none';
    }
}  

function getRndInteger(min, max) { // Max is included
    max = max + 1;
    return Math.floor(Math.random() * (max - min) ) + min;
}

function getRandomSuccessText(hitsInARow) {
    let numSlots = scoreTextsSetup.hitTexts.labels.length;
    let selectedSlot = hitsInARow;
    if (selectedSlot > numSlots)
        selectedSlot = numSlots;

    let numTexts = scoreTextsSetup.hitTexts.labels[selectedSlot-1].length;
    return scoreTextsSetup.hitTexts.labels[selectedSlot-1][getRndInteger(0, numTexts-1)]
}

function getRandomFailText() {
    let numTexts = scoreTextsSetup.missTexts.labels.length;
    return scoreTextsSetup.missTexts.labels[getRndInteger(0, numTexts-1)]
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
        if (inputTapDetected()) {
            __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
            FSMTransitToState(GAMESTATES.GS_LOADING)
        }
        else {
            __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
            __renderActions.actions.push(
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
         __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }

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
            __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
            FSMTransitToState(GAMESTATES.GS_HOME_SCREEN)
        }
        else {
            greyLevel = Math.trunc((255 / countTotal) * countReady)
            __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR_COLOR, color: { r: greyLevel, g: greyLevel, b: greyLevel, a: 255 } }
        }

        __renderActions.actions.push(
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
        if (inputTapDetected()) {
            __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR }
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
        gameObjects.hitsInARow = 0;
        gameObjects.lives = inGameSetup.lives;
        gameObjects.playerName = "";
        gameObjects.deadControlTime = 0;
        gameObjects.controlTimmeout = inGameSetup.controlEventTimeout;

        // Make sure a fresh install have a record set of 5
        if (localStorage.getItem('record')) {
            gameObjects.record = parseInt(localStorage.getItem('record'))
        }
        else {
            gameObjects.record = 5;
            leaderboardTryAddEntry("FLC", 5);
            localStorage.setItem('record', gameObjects.record);
        }

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
        askPlayerName();
        gameObjects.lives = 0;
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
                label: "Write your name and press Enter to Continue",
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
        if(inputKeyPressed("Enter")) {
            document.getElementById("nameButton").click();
        }
        if (gameObjects.playerName != "") {   
            leaderboardTryAddEntry(gameObjects.playerName, gameObjects.score);         
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
            },
            {
                type: GAMEOBJECTTYPE.GOT_TEXT,
                label: "Press Enter to Continue",
                pos: { x: 640, y: 690 },
                color: structuredClone(commonColors.black),
                size: 30,
                align: "center",
                rotation: 0,
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
        if (inputKeyPressed("Enter") 
            || inputTouchDetected() ) {            
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

    __renderActions.clearAction = { type: RENDERACTIONTYPE.RAT_CLEAR_NONE } // We use a full screen image. No need to clear
    __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_IMAGE_AT, pos: { x: 0, y: 0 }, rotation: 0, id: "ingame-background-720" })
    __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: gameObjects.target.color, size: gameObjects.target.size * 3 })
    __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: commonColors.white, size: gameObjects.target.size* 2 })
    __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.target.pos, color: gameObjects.target.color, size: gameObjects.target.size })
}

function stepAimPoint(dt) {
    scoreFactor = 1 + (aimPointSettup.dificultiFactor) * gameObjects.score;

    gameObjects.aimPoint.angle += aimPointSettup.rotationAngularSpeed * dt * scoreFactor;
    gameObjects.aimPoint.amplitudPhase += aimPointSettup.amplitudePhase * dt * scoreFactor;

    currentAmplitude = aimPointSettup.maxAmplitude * Math.sin(gameObjects.aimPoint.amplitudPhase);
    //currentAmplitude = gameObjects.target.size/2 +1

    gameObjects.aimPoint.pos.x = gameObjects.target.pos.x - currentAmplitude * Math.sin(gameObjects.aimPoint.angle);
    gameObjects.aimPoint.pos.y = gameObjects.target.pos.y + currentAmplitude * Math.cos(gameObjects.aimPoint.angle);

    __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_IMAGE_AT, pos: {x: gameObjects.aimPoint.pos.x - 20, y: gameObjects.aimPoint.pos.y - 15}, rotation: 0, id: "tail" })

    let prevControlTimeout = gameObjects.controlTimmeout;
    gameObjects.controlTimmeout -= dt;
    if (gameObjects.controlTimmeout < inGameSetup.controlEventLabelStartAt
        && gameObjects.controlTimmeout >= 0
        && Math.floor(gameObjects.controlTimmeout) != Math.floor(prevControlTimeout))
        {
            console.log("Timeout: " + Math.floor(prevControlTimeout));
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: "" + Math.floor(prevControlTimeout),
                    pos: structuredClone(scoreTextsSetup.timeLimit.pos),
                    color: structuredClone(scoreTextsSetup.timeLimit.color),
                    size: scoreTextsSetup.timeLimit.size,
                    align: scoreTextsSetup.timeLimit.align,
                    rotation: scoreTextsSetup.timeLimit.rotation,
                    behaviorQueue: structuredClone(scoreTextsSetup.timeLimit.behaviorQueue)
                }
            );
        }
    if (gameObjects.controlTimmeout <= 0) {
        FSMTransitToState(gameState = GAMESTATES.GS_FINISHED);
        return;
    }

    gameObjects.deadControlTime -= dt;
    if (gameObjects.deadControlTime > 0)
        return;

    if (Math.abs(currentAmplitude) <= gameObjects.target.size / 2) {
        __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.aimPoint.pos, color: commonColors.green, size: gameObjects.aimPoint.size })
        if (inputTapDetected()) {
            //console.log("Goal!!")
            gameObjects.score++;
            gameObjects.hitsInARow++;
            gameObjects.deadControlTime = inGameSetup.controlIgnoreTime;
            gameObjects.controlTimmeout = inGameSetup.controlEventTimeout;
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: getRandomSuccessText(gameObjects.hitsInARow),
                    pos: structuredClone(scoreTextsSetup.hitTexts.pos),
                    color: structuredClone(scoreTextsSetup.hitTexts.color),
                    size: scoreTextsSetup.hitTexts.size,
                    align: scoreTextsSetup.hitTexts.align,
                    rotation: scoreTextsSetup.hitTexts.rotation,
                    behaviorQueue: structuredClone(scoreTextsSetup.hitTexts.behaviorQueue)
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
            if (gameObjects.score > gameObjects.record) {
                gameObjects.record = gameObjects.score;
                localStorage.setItem('record', String(gameObjects.record))
                gameObjects.objects.push(
                    {
                        type: GAMEOBJECTTYPE.GOT_TEXT,
                        label: scoreTextsSetup.newRecord.label,
                        pos: structuredClone(scoreTextsSetup.newRecord.pos),
                        color: structuredClone(scoreTextsSetup.newRecord.color),
                        size: structuredClone(scoreTextsSetup.newRecord.size),
                        align: scoreTextsSetup.newRecord.align,
                        rotation: scoreTextsSetup.newRecord.rotation,
                        behaviorQueue: structuredClone(scoreTextsSetup.newRecord.behaviorQueue)
                    },
                    {
                        type: GAMEOBJECTTYPE.GOT_PARTICLE_EMITTER,
                        pos: {x: 300, y: 720},
                        emitterTemplate: emittersTemplates.fire,
                        behaviorQueue: [
                            { type: BEHAVIORTTYPES.BT_KILL, time: 4.5 }
                        ]
                    },
                    {
                        type: GAMEOBJECTTYPE.GOT_PARTICLE_EMITTER,
                        pos: {x: 980, y: 720},
                        emitterTemplate: emittersTemplates.fire,
                        behaviorQueue: [
                            { type: BEHAVIORTTYPES.BT_KILL, time: 4.5 }
                        ]
                    }
                );
            }
        }
    }
    else {
        __renderActions.actions.push({ type: RENDERACTIONTYPE.RAT_POINT_AT, pos: gameObjects.aimPoint.pos, color: gameObjects.aimPoint.color, size: gameObjects.aimPoint.size })
        if (inputTapDetected()) {
            gameObjects.hitsInARow = 0;
            gameObjects.deadControlTime = inGameSetup.controlIgnoreTime;
            gameObjects.controlTimmeout = inGameSetup.controlEventTimeout;
            //console.log("Fail " + Math.abs(currentAmplitude))
            gameObjects.objects.push(
                {
                    type: GAMEOBJECTTYPE.GOT_TEXT,
                    label: getRandomFailText(),
                    pos: structuredClone(scoreTextsSetup.missTexts.pos),
                    color: structuredClone(scoreTextsSetup.missTexts.color),
                    size: scoreTextsSetup.missTexts.size,
                    align: scoreTextsSetup.missTexts.align,
                    rotation: scoreTextsSetup.missTexts.rotation,
                    behaviorQueue: structuredClone(scoreTextsSetup.missTexts.behaviorQueue)
                }
            );
            gameObjects.lives--;
            resouceSoundPlay(sounds['hitFail']);
            if (gameObjects.lives <= 0) {
                FSMTransitToState(gameState = GAMESTATES.GS_FINISHED);
                return;
            }
        }
    }
}

function stepHud(dt) {
    __renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: hudSetup.score.label +  ("0000000000000" + String(gameObjects.score)).slice(-hudSetup.score.digits),
            pos: hudSetup.score.pos,
            color: hudSetup.score.color,
            size: hudSetup.score.size,
            align: hudSetup.score.align,
            rotation: hudSetup.score.rotation
        });
    __renderActions.actions.push(
        {
            type: RENDERACTIONTYPE.RAT_TEXT_AT,
            text: hudSetup.record.label + ("0000000000000" + String(gameObjects.record)).slice(-hudSetup.record.digits),
            pos: hudSetup.record.pos,
            color: hudSetup.record.color,
            size: hudSetup.record.size,
            align: hudSetup.record.align,
            rotation: hudSetup.record.rotation
        });
    __renderActions.actions.push(
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
                __renderActions.actions.push(
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
                __renderActions.actions.push(
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
                __renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_RECTANGLE_AT,
                        color: theObject.color, 
                        pos: theObject.pos,
                        scale: theObject.scale
                    });
                break;
            case GAMEOBJECTTYPE.GOT_PARTICLE_EMITTER:
                if (!("emiterData" in theObject)) {
                    theObject.emiterData = {
                        particles: [],
                        timeEmitting: 0,
                        nextEmissionTimer: 0
                    }
                }
                
                particlesStep(dt, theObject.emitterTemplate, theObject.emiterData);
                __renderActions.actions.push(
                    {
                        type: RENDERACTIONTYPE.RAT_PARTICLES_AT,
                        pos: theObject.pos,
                        particles: theObject.emiterData.particles // this is a reference, right?
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
    debugToolsStep(dt);

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
    //leaderboardReset();
    //testArray = [10, 10, 10, 20, 5, 6, 7, 8, 4, 3, 2, 1, 1, 1, 1, 1, 6, 7, 8, 9, 10, 20, 20, 30 , 40 , 50, 70, 100, 10, 30, 30, 40, 50, 5, 6, 7, 8, 9, 10, 1, 1, 1, 100 ]
    //for (let i= 0; i< testArray.length; i++)
    //    leaderboardTryAddEntry("Name_"+ i, testArray[i]);

    // Eveything is ok, prepare to run the game then register the input detection and trigger the game loop
    FSMTransitToState(GAMESTATES.GS_WAIT_FOR_INPUT);
    
    window.requestAnimationFrame(step);
}


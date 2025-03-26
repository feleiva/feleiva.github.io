
const __debugKeyThreashold = 2;

var __debugToolsState = {
    holdKeyTime: {},
    showFPSToggleTime: 0,
    showFPS: false,
    resetLeaderboardsTime: 0,
    editLBTime: 0
}

var __keysToFollow = {
    'f': {
        waitTime: __debugKeyThreashold,
        execute: debugToggleFPS,
        timmer: 0,
    },
    'r': {
        waitTime: 5 * __debugKeyThreashold,
        execute: debugResetLeaderboard,
        timmer: 0,
    },
    'c': {
        waitTime: __debugKeyThreashold,
        execute: debugEditLeaderboard,
        timmer: 0,
    },
    'l': {
        waitTime:  __debugKeyThreashold,
        execute: debugShowLeaderboard,
        timmer: 0,
    },
}


function debugToggleFPS() {
    console.log("DEBUGTOOLS>> Toggle FPS");
    __debugToolsState.showFPS = !__debugToolsState.showFPS;
}

function debugResetLeaderboard() {
    console.log("DEBUGTOOLS>> Reset Leaderboards and Record")
    leaderboardReset();
    leaderboardTryAddEntry("FLC", 5);
    gameObjects.record = 5;
    localStorage.setItem('record', gameObjects.record);
}

function debugEditLeaderboard() {
    console.log("DEBUGTOOLS>> Edit Leaderboards");
    askLBEdit();
}

function debugShowLeaderboard() {
    console.log("DEBUGTOOLS>> Try Show Leaderboards");
    tryShowLeaderboard();
}

function debugToolsStep(dt) {

    for (const key in __keysToFollow) {
        if (inputKeyDetected(key)) {
            __keysToFollow[key].timmer += dt;
        }
        else {
            __keysToFollow[key].timmer = 0;
        }

        if (__keysToFollow[key].timmer >= __keysToFollow[key].waitTime) {
            __keysToFollow[key].execute();
            __keysToFollow[key].timmer = 0;
        }
    }

    if (__debugToolsState.showFPS) {
        __renderActions.actions.push(
            {
                type: RENDERACTIONTYPE.RAT_TEXT_AT,
                text: "FPS: " + Math.round(1.0/dt),
                pos: {x: 20, y: 700},
                color: commonColors.red,
                size: 10,
                align: "left",
                rotation: 0,
            });
    }
}
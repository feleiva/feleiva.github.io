
const __debugKeyThreashold = 5;

var __debugToolsState = {
    showFPSToggleTime: 0,
    showFPS: false,
    resetLeaderboardsTime: 0,
}

function debugToolsStep(dt) {

    // Set the counters
    if (inputKeyDetected("f")) {
        __debugToolsState.showFPSToggleTime += dt;
    }
    else
    {
        __debugToolsState.showFPSToggleTime = 0;
    }

    if (inputKeyDetected("r")) {
        __debugToolsState.resetLeaderboardsTime += dt;
    }
    else
    {
        __debugToolsState.resetLeaderboardsTime = 0;
    }

    // Check the time on the countes and act accordingly.
    if (__debugToolsState.showFPSToggleTime > __debugKeyThreashold) {
        console.log("DEBUGTOOLS>> Toggle FPS");
        __debugToolsState.showFPS = !__debugToolsState.showFPS;
        __debugToolsState.showFPSToggleTime = 0;
    }

    if (__debugToolsState.resetLeaderboardsTime > 2 *__debugKeyThreashold) {
        console.log("DEBUGTOOLS>> Reset Leaderboards")
        leaderboardReset();
        __debugToolsState.resetLeaderboardsTime = 0;
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
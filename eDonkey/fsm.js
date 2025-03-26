// TODO: 
// . Add state transitino validation, define a list of states which are valid transitions from each one
// . Add default states and do not allow transitions to null states

// Holder for the State List, each state will have a onOnter, OnStep and OnExit callback at least
__FMSStates         = {};
__FSMCurrentState   = null;

function FSMRegisterState(stateKey, onEnterCallback, onStepCallback, onExitCallback)
{
    if (stateKey in __FMSStates) {
        console.warn("FSM>> State: " + stateKey + " already exist, skipping");
        return;
    }
    
    console.log("FSM>> Registering State:" + stateKey);

    __FMSStates[stateKey] = {
        onEnter:    onEnterCallback,
        onStep:     onStepCallback,
        onExit:     onExitCallback
    }
}

function FSMTransitToState(stateKey)
{
    console.log("FSM>> Transitioning from State:" + __FSMCurrentState + " to State: " + stateKey);

    if (!(stateKey in __FMSStates)) {
        console.error("FSM>> State " + stateKey + " is not registered. Can't transition to it.");
        return;
    }

    if (__FSMCurrentState != null && __FMSStates[__FSMCurrentState].onExit)
        __FMSStates[__FSMCurrentState].onExit();

    __FSMCurrentState = stateKey;

    if (__FSMCurrentState != null && __FMSStates[__FSMCurrentState].onEnter)
        __FMSStates[__FSMCurrentState].onEnter();
}

function FSMStep(dt)
{
    if (__FSMCurrentState != null && __FMSStates[__FSMCurrentState].onStep)
        __FMSStates[__FSMCurrentState].onStep(dt);
}
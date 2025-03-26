
// For behaviors that interpolate an attribute over time, what kind of interpolation they do
const INTERPOLATIONTYPE = Object.freeze({
    IT_LINEAL: 0,   // Lineal interpolation
    IT_EASIIN: 1,   // Start slow, finish fast
    IT_EASIOUT: 2,  // Start fast, finish slow
    IT_SINCURVE: 3,  // Mimics a sinousoidal curve. Only works with 1d parameters (for now??). From is base level, to is the amplitude
});   

function interpolate2d(from, to, type, interpolator) {
    switch (type) {
        case INTERPOLATIONTYPE.IT_LINEAL:
            return { 
                x: from.x + (to.x - from.x) * interpolator,
                y: from.y + (to.y - from.y) * interpolator,
            };
            break;
        case INTERPOLATIONTYPE.IT_EASIIN:
            factor = -(Math.cos(Math.PI * interpolator) - 1) / 2;
            return { 
                x: from.x + (to.x - from.x) * factor,
                y: from.y + (to.y - from.y) * factor,
            };
            break;
        case INTERPOLATIONTYPE.IT_EASIOUT:
            factor = Math.sin((interpolator * Math.PI) / 2);
            return { 
                x: from.x + (to.x - from.x) * factor,
                y: from.y + (to.y - from.y) * factor,
            };
            break;
        default:
            throw new Error('Invalid Interpolation type');
            break;
    }
}

function interpolate1d(from, to, type, interpolator) {
    switch (type) {
        case INTERPOLATIONTYPE.IT_LINEAL:
            return from + (to - from) * interpolator;
            break;
        case INTERPOLATIONTYPE.IT_EASIIN:
            factor = -(Math.cos(Math.PI * interpolator) - 1) / 2;
            return from + (to - from) * factor;
            break;
        case INTERPOLATIONTYPE.IT_EASIOUT:
            factor = Math.sin((interpolator * Math.PI) / 2);
            return from + (to - from) * factor;
            break;
        case INTERPOLATIONTYPE.IT_SINCURVE:
            factor = Math.sin((interpolator * 2 * Math.PI));
            return from + to * factor;
            break;
        default:
            throw new Error('Invalid Interpolation type');
            break;
    }
}

// Resource Behavior types
const BEHAVIORTTYPES = Object.freeze({ 
    BT_NONE: 0,     // NOP, get removed from queue right away... Do we need this??? 
    BT_SCALE: 1,    // Scale the object, between from and to, during time parameters, then is removed from the queue 
    BT_FADE: 2,     // Fade the object, between from and to, during time, then is removed from the queue 
    BT_MOVE_ACCEL: 3,     // Move the object, Apply Acceleration, during time, then is removed from the queue 
    BT_MOVETO: 4,     // Move the object, between from and to, during time, then is removed from the queue
    BT_ROTATE: 5,     // Rotate the object, between from and to, during time, then is removed from the queue
    BT_KILL: 6,     // Report the object must be killed after time
    // These are special type of behaviors, which are used to control the flow on a behavior list
    BT_WAIT: 7,     // Wait time before continue processing the effect list
    BT_BLOCK: 8,    // Block processing the effect list until all previous behaviors finish executing
    BT_LOOP: 9,    // Replay the behavior list
    
  });


function stepBehaviors(behaviorObject, dt) {
    // This object does not have a bhvr queue, just skip it
    if (!("behaviorQueue" in behaviorObject))
        return false;

    // Keep a pristine copy, in case we need to loop
    if (!("_behaviorQueueBackup" in behaviorObject))
        behaviorObject._behaviorQueueBackup = structuredClone(behaviorObject.behaviorQueue);

    for (let i = 0; i < behaviorObject.behaviorQueue.length;) {
        shouldPop = false;
        behaviorInstance = behaviorObject.behaviorQueue[i];
        switch (behaviorInstance.type) {
            case BEHAVIORTTYPES.BT_NONE:
                shouldPop = true;
                break;
            case BEHAVIORTTYPES.BT_SCALE:
                if (! ("_elapseTime" in behaviorInstance)) {
                    behaviorInstance._elapseTime = 0;
                    if (! ("from" in behaviorInstance))
                        behaviorInstance.from = behaviorObject.size;
                }
                else
                    behaviorInstance._elapseTime += dt;
                if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                    shouldPop = true;
                    behaviorInstance._elapseTime = behaviorInstance.time;
                }
                behaviorObject.size = interpolate1d(behaviorInstance.from, behaviorInstance.to, behaviorInstance.interpolationType, behaviorInstance._elapseTime/behaviorInstance.time)
                break;
            case BEHAVIORTTYPES.BT_FADE:
                if (! ("_elapseTime" in behaviorInstance)) {
                    behaviorInstance._elapseTime = 0;
                    if (! ("from" in behaviorInstance))
                        behaviorInstance.from = behaviorObject.color.a;
                }
                else
                    behaviorInstance._elapseTime += dt;
                if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                    shouldPop = true;
                    behaviorInstance._elapseTime = behaviorInstance.time;
                }
                behaviorObject.color.a      = interpolate1d(behaviorInstance.from, behaviorInstance.to, behaviorInstance.interpolationType, behaviorInstance._elapseTime/behaviorInstance.time)
                behaviorObject.color.str    = "";
                break;
            case BEHAVIORTTYPES.BT_ROTATE:
                    if (! ("_elapseTime" in behaviorInstance)) {
                        behaviorInstance._elapseTime = 0;
                        if (! ("from" in behaviorInstance))
                            behaviorInstance.from = behaviorObject.rotation;
                    }
                    else
                        behaviorInstance._elapseTime += dt;
                    if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                        shouldPop = true;
                        behaviorInstance._elapseTime = behaviorInstance.time;
                    }
                    behaviorObject.rotation      = interpolate1d(behaviorInstance.from, behaviorInstance.to, behaviorInstance.interpolationType, behaviorInstance._elapseTime/behaviorInstance.time)
                    break;
            case BEHAVIORTTYPES.BT_MOVE_ACCEL:
                if (! ("_elapseTime" in behaviorInstance)) {
                    behaviorInstance._elapseTime = 0;
                    if (! ("vel" in behaviorInstance))
                        behaviorInstance.vel= {x: 0, y: 0}
                }
                else
                    behaviorInstance._elapseTime += dt;
                if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                    shouldPop = true;
                    behaviorInstance._elapseTime = behaviorInstance.time;
                }
                behaviorInstance.vel.x += behaviorInstance.accel.x * dt;
                behaviorInstance.vel.y += behaviorInstance.accel.y * dt;
                behaviorObject.pos.x += behaviorInstance.vel.x * dt;
                behaviorObject.pos.y += behaviorInstance.vel.y * dt;
                break;
            case BEHAVIORTTYPES.BT_MOVETO:
                if (! ("_elapseTime" in behaviorInstance)) {
                    behaviorInstance._elapseTime = 0;
                    if (! ("from" in behaviorInstance))
                        behaviorInstance.from = behaviorObject.pos;
                }
                else
                    behaviorInstance._elapseTime += dt;
                if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                    shouldPop = true;
                    behaviorInstance._elapseTime = behaviorInstance.time;
                }
                behaviorObject.pos = interpolate2d(behaviorInstance.from, behaviorInstance.to, behaviorInstance.interpolationType, behaviorInstance._elapseTime/behaviorInstance.time)                
                break;
            case BEHAVIORTTYPES.BT_KILL:
                if (! ("_elapseTime" in behaviorInstance))
                    behaviorInstance._elapseTime = 0;
                else
                    behaviorInstance._elapseTime += dt;
                if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                    shouldPop = true;
                    return true;
                }
                else
                    return false;
                break;
            case BEHAVIORTTYPES.BT_WAIT:
                if (! ("_elapseTime" in behaviorInstance))
                    behaviorInstance._elapseTime = 0;
                else
                    behaviorInstance._elapseTime += dt;
                if (behaviorInstance._elapseTime >= behaviorInstance.time) {
                    shouldPop = true;
                }
                else
                    return false;
                break;
            case BEHAVIORTTYPES.BT_BLOCK:
                if (i > 0)
                    return false;
                shouldPop = true;
                break;
            case BEHAVIORTTYPES.BT_LOOP:
                behaviorObject.behaviorQueue = structuredClone(behaviorObject._behaviorQueueBackup);
                return false;
                break;
        }
        if (shouldPop)
            behaviorObject.behaviorQueue.splice(i, 1);
        else
            i++;
    }
    return false;
}

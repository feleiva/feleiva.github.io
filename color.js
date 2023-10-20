const commonColors = {
    red: { r: 255, g: 0, b: 0, a: 255, str: "rgba(255,0,0,1)" },
    //red: { r: 237, g: 125, b: 49, a: 255, str: "rgba(237,125,49,1)" },
    green: { r: 0, g: 255, b: 0, a: 255, str: "rgba(0,255,0,1)" },
    //green: { r: 108, g: 95, b: 91, a: 255, str: "rgba(108,95,91,1)" },
    blue: { r: 0, g: 0, b: 255, a: 255, str: "rgba(0,0,255,1)" },
    yellow: { r: 255, g: 255, b: 20, a: 255, str: "rgba(255,255,20,1)" },
    white: { r: 255, g: 255, b: 255, a: 255, str: "rgba(255,255,255,1)" },
    //white: { r: 246, g: 241, b: 238, a: 255, str: "rgba(246,241,238,1)" },
    black: { r: 0, g: 0, b: 0, a: 255, str: "rgba(0,0,0,1)" },
    //black: { r: 79, g: 74, b: 69, a: 255, str: "rgba(79,74,69,1)" },
}

/// Utilitary functions
function colorToRGBA(color) {
    // TODO: Needs validations!!!
    if (!("str" in color) || color.str == "")
        color.str = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")"
    return color.str;
}

function colorToAlpha01(color) {
    // TODO: Needs validations!!!
    return  color.a / 255;
}

function colorToStroke(color) {
    // TODO: Needs validations!!!
    return "rgba(" + color.r/2 + "," + color.g/2 + "," + color.b/2 + "," + color.a / 255 + ")"
}
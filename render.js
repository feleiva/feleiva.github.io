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

function render() {
    renderClear(renderActions.clearAction)
    for (ra of renderActions.actions) {
        renderAction(ra)
    }
}

function renderFlush() {
    renderActions.clearAction = {};
    renderActions.actions = [];
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
            main2dContext.context.textAlign = renderAction.align;            
            main2dContext.context.save();
            main2dContext.context.translate(renderAction.pos.x, renderAction.pos.y);
            main2dContext.context.rotate(renderAction.rotation);
            main2dContext.context.strokeStyle = colorToStroke(renderAction.color);
            main2dContext.context.lineWidth = 1;
            main2dContext.context.strokeText(renderAction.text, 0, 0);
            main2dContext.context.fillStyle = colorToRGBA(renderAction.color)
            main2dContext.context.fillText(renderAction.text, 0, 0);
            main2dContext.context.restore();
            break;
        case RENDERACTIONTYPE.RAT_IMAGE_AT: // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
            main2dContext.context.drawImage(images[renderAction.id].image, renderAction.pos.x, renderAction.pos.y);
            break;
    }
}
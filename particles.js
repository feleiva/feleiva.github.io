
function particlesInterpolate(factor, from, to) { 
    if (from > to) {
        return from - (factor * (from - to));
    }
    else {
        return (factor * (to - from)) + from;
    }
}

function particlesRandomFromRange(range) { // range is [min, max]
    if (range[0] > range[1]) {
        min = range[1];
        max = range[0];
    }
    else {
        min = range[0];
        max = range[1];
    }
    return (Math.random() * (max - min)) + min;
}

function EmitterTemplate(posXRange, posYRange, velXRange, velYRange, radiusRange, rate, lifeRange, colorFrom, colorTo) {
    this.posXRange      = posXRange;
    this.posYRange      = posYRange;
    this.velXRange      = velXRange;
    this.velYRange      = velYRange;
    this.radiusRange    = radiusRange;
    this.rate           = rate;
    this.lifeRange      = lifeRange;
    this.colorFrom      = colorFrom;
    this.colorTo        = colorTo;
}

this.__particles  = [];

function Particle(template) {
    this.template       = template
    this.pos            = {x: particlesRandomFromRange(template.posXRange), y: particlesRandomFromRange(template.posYRange)},
    this.vel            = {x: particlesRandomFromRange(template.velXRange), y: particlesRandomFromRange(template.velYRange)},
    this.radius         = particlesRandomFromRange(template.radiusRange)
    this.lifeRemaining  = particlesRandomFromRange(template.lifeRange)
    this.lifeTotal      = this.lifeRemaining
    this.color          = template.colorFrom
}

var emmiters = [
    new EmitterTemplate([490, 510], [0,20],     [-10, 10],    [-10, 10],        [2, 3],     15,     [10, 12], [255, 0, 0, 1],     {r: 255, g: 255, b: 0, a: 25}), 
    new EmitterTemplate([0, 5],     [994,999],  [450, 550],   [-550, -450],     [8, 10],    5.0,    [10, 15], [0, 128, 128, 1.0], [0, 255, 0, 0]),
    new EmitterTemplate([994, 999], [994,999],  [-180, -120],  [-180, -120],     [4, 6],     10.0,  [5, 8],   [0, 30, 255, 1.0],  [0, 30, 128, 0])
];

function update() {
    for (em of emmiters) {
        // Need a new particle?
        dice = particlesRandomFromRange([0, 1])
        if (dice < (dt * em.rate)) {
            __particles.push(new Particle(em))
        }
        
    }
    for (ptIndex = __particles.length - 1; ptIndex >= 0; ptIndex--) {
        // Update lifetime and kill expired ones
        __particles[ptIndex].lifeRemaining -= dt;
        if (__particles[ptIndex].lifeRemaining < 0) {
            __particles.splice(ptIndex, 1);
            continue;
        }

        // Update Position
        acelerationX = 0
        acelerationY = 98
        __particles[ptIndex].velX = __particles[ptIndex].velX + acelerationX * dt;
        __particles[ptIndex].velY = __particles[ptIndex].velY + acelerationY * dt;
        __particles[ptIndex].posX = __particles[ptIndex].posX + __particles[ptIndex].velX * dt;
        __particles[ptIndex].posY = __particles[ptIndex].posY + __particles[ptIndex].velY * dt;

        // Update color
        lifeFraction = 1.0 - __particles[ptIndex].lifeRemaining/__particles[ptIndex].lifeTotal;
        __particles[ptIndex].color = {
            r: particlesInterpolate(lifeFraction, __particles[ptIndex].template.colorFrom.r,  __particles[ptIndex].template.colorTo.r),
            g: particlesInterpolate(lifeFraction, __particles[ptIndex].template.colorFrom.g,  __particles[ptIndex].template.colorTo.g),
            b: particlesInterpolate(lifeFraction, __particles[ptIndex].template.colorFrom.b,  __particles[ptIndex].template.colorTo.b),
            a: particlesInterpolate(lifeFraction, __particles[ptIndex].template.colorFrom.a,  __particles[ptIndex].template.colorTo.a)
        }
    }
}

function draw() {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, boxSize, boxSize);

            for (pt of __particles) {

            ctx.beginPath();
            //ctx.rect(pt.posX-__particles[ptIndex].radius, pt.posY-__particles[ptIndex].radius, __particlesize, __particlesize);
            ctx.arc(pt.posX, pt.posY, pt.radius, 0, 2*Math.PI)
            ctx.fillStyle = pt.color;
            ctx.fill();
        }
    }
}

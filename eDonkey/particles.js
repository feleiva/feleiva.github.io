const PARTICLESHAPE = Object.freeze({
    PS_RECTANGLE: 0,    // Lineal interpolation
    PS_POINT: 1,        // Start slow, finish fast
});   

const PARTICLERANGEDISTRIBUTION = Object.freeze({
    PRD_UNIRFORM: 0,        // Uniform Distribution
    PRD_NORMAL: 1,          // Normal Distribution
});

function particlesInterpolate(factor, from, to) { 
    return from + (factor * (to - from));
}

function particlesRandomFromRange(range) { // range is [min, max]
    switch(range[0]) {
        case PARTICLERANGEDISTRIBUTION.PRD_UNIRFORM:
            return (Math.random() * (range[2] - range[1])) + range[1];
            break;
        case PARTICLERANGEDISTRIBUTION.PRD_NORMAL:
            let probAcum = 0
            for (let i=0; i< 12; i++)
                probAcum += Math.random()
            probAcum -= 6;

            // If we trust the internet, probAcum is now a random number on the standard normal distribution (means average is 0 and std is 1)
            let expectedMean    = (range[1] + range[2])/2; // center of the range
            let expectedStd     = ((range[2] - range[1])/(2*3)); // Half of the range. the x3 is my attempt to keep most of the values within the range. 

            let output = (probAcum * expectedStd) + expectedMean; // Correct the value to the right std and mean

            // This is only made to avoid issues, with things like the radius. It's normal that a few values land outside of the range
            if (output < range[1])
                output = range[1];
            else if (output > range[2])
                output = range[2]

            return output;
            break
    }
    return range[1];
}

function fixRange(range) {
    if (range[2] == range[1]) {
        alert("Error on Range definition, values must be different")
        return;
    }

    if (range[2] < range[1]) {
        let tmp = range[1];
        range[1] = range[2];
        range[2] = tmp;
    }
}

function EmitterTemplate(shape, posXRange, posYRange, velXRange, velYRange, sizeRange, emitTime, rate, lifeRange, colorFrom, colorTo, rotationSpeedRange) {
    this.shape          = shape;
    this.posXRange      = posXRange;
    this.posYRange      = posYRange;
    this.velXRange      = velXRange;
    this.velYRange      = velYRange;
    this.sizeRange      = sizeRange;
    this.emitTime       = emitTime;
    this.rate           = rate;
    this.emitTimeSpan   = 1/rate;
    this.lifeRange      = lifeRange;
    this.colorFrom      = colorFrom;
    this.colorTo        = colorTo;
    this.rotSpeedRange  = rotationSpeedRange;

    fixRange(this.posXRange);
    fixRange(this.posYRange);
    fixRange(this.velXRange);
    fixRange(this.velYRange);
    fixRange(this.sizeRange);
    fixRange(this.lifeRange);
    if (this.rotSpeedRange) {
        fixRange(this.rotSpeedRange);
    }

}

function Particle(template) {
    this.template       = template
    this.pos            = {x: particlesRandomFromRange(template.posXRange), y: particlesRandomFromRange(template.posYRange)},
    this.vel            = {x: particlesRandomFromRange(template.velXRange), y: particlesRandomFromRange(template.velYRange)},
    this.lifeRemaining  = particlesRandomFromRange(template.lifeRange)
    this.lifeTotal      = this.lifeRemaining
    this.color          = template.colorFrom
    this.rotation       = 0;

    if (template.shape == PARTICLESHAPE.PS_POINT) {
        this.radius         = particlesRandomFromRange(template.sizeRange)
        this.rotSpeed       = 0;
    }
    else {
        this.size         = {x: particlesRandomFromRange(template.sizeRange), y: particlesRandomFromRange(template.sizeRange)}
        if (template.rotSpeedRange) {
            this.rotation = Math.random() * 2 * Math.PI;
            this.rotSpeed = particlesRandomFromRange(template.rotSpeedRange)
        }
        else {
            this.rotSpeed = 0
        }
    }
}

function particlesStep(dt, emiterTemplate, emiterData) {
    // Negative emitTime on the template means permanent emission.
    emiterData.timeEmitting += dt;
    if (emiterTemplate.emitTime < 0 || emiterData.timeEmitting <= emiterTemplate.emitTime) {
        emiterData.nextEmissionTimer += dt;
        while(emiterData.nextEmissionTimer > emiterTemplate.emitTimeSpan) {
            emiterData.nextEmissionTimer -= emiterTemplate.emitTimeSpan;
            emiterData.particles.push(new Particle(emiterTemplate))
        }
    } 

    for (ptIndex = emiterData.particles.length - 1; ptIndex >= 0; ptIndex--) {
        // Update lifetime and kill expired ones
        let particle = emiterData.particles[ptIndex];
        particle.lifeRemaining -= dt;
        if (particle.lifeRemaining < 0) {
            emiterData.particles.splice(ptIndex, 1);
            continue;
        }

        // Update Position
        aceleration         = {x: 0, y: 98}
        particle.vel        = {x: particle.vel.x + aceleration.x * dt, y: particle.vel.y + aceleration.y * dt} ;
        particle.pos        = {x: particle.pos.x + particle.vel.x * dt, y: particle.pos.y + particle.vel.y * dt}
        particle.rotation   += particle.rotSpeed * dt;

        // Update color
        lifeFraction = 1.0 - particle.lifeRemaining/particle.lifeTotal;
        particle.color = {
            r: particlesInterpolate(lifeFraction, emiterTemplate.colorFrom.r,  emiterTemplate.colorTo.r),
            g: particlesInterpolate(lifeFraction, emiterTemplate.colorFrom.g,  emiterTemplate.colorTo.g),
            b: particlesInterpolate(lifeFraction, emiterTemplate.colorFrom.b,  emiterTemplate.colorTo.b),
            a: particlesInterpolate(lifeFraction, emiterTemplate.colorFrom.a,  emiterTemplate.colorTo.a)
        }
    }
}

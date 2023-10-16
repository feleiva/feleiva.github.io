function particlesInterpolate(factor, from, to) { 
    return from + (factor * (to - from));
}

function particlesRandomFromRange(range) { // range is [min, max]
    return (Math.random() * (range[1] - range[0])) + range[0];
}

function particlesNormalRandomFromRange(range) { // range is [min, max]
    let probAcum = 0
    for (let i=0; i< 12; i++)
        probAcum += Math.random()
    probAcum -= 6;

    // If we trust the internet, probAcum is now a random number on the standard normal distribution (means average is 0 and std is 1)
    let expectedMean    = (range[0] + range[1])/2; // center of the range
    let expectedStd     = ((range[1] - range[0])/(2*3)); // Half of the range. the x3 is my attempt to keep most of the values within the range. 

    let output = (probAcum * expectedStd) + expectedMean; // Correct the value to the right std and mean

    // This is only made to avoid issues, with things like the radius. It's normal that a few values land outside of the range
    if (output < range[0])
        output = range[0];
    else if (output > range[1])
        output = range[1]

    return output;
}

function fixRange(range) {
    if (range[1] == range[0]) {
        alert("Error on Range definition, values must be different")
        return;
    }

    if (range[1] < range[0]) {
        let tmp = range[0];
        range[0] = range[1];
        range[1] = tmp;
    }
}

function EmitterTemplate(posXRange, posYRange, velXRange, velYRange, radiusRange, emitTime, rate, lifeRange, colorFrom, colorTo) {
    this.posXRange      = posXRange;
    this.posYRange      = posYRange;
    this.velXRange      = velXRange;
    this.velYRange      = velYRange;
    this.radiusRange    = radiusRange;
    this.emitTime       = emitTime;
    this.rate           = rate;
    this.emitTimeSpan   = 1/rate;
    this.lifeRange      = lifeRange;
    this.colorFrom      = colorFrom;
    this.colorTo        = colorTo;

    fixRange(this.posXRange);
    fixRange(this.posYRange);
    fixRange(this.velXRange);
    fixRange(this.velYRange);
    fixRange(this.radiusRange);
    fixRange(this.lifeRange);
}

function Particle(template) {
    this.template       = template
    this.pos            = {x: particlesNormalRandomFromRange(template.posXRange), y: particlesNormalRandomFromRange(template.posYRange)},
    this.vel            = {x: particlesNormalRandomFromRange(template.velXRange), y: particlesNormalRandomFromRange(template.velYRange)},
    this.radius         = particlesNormalRandomFromRange(template.radiusRange)
    this.lifeRemaining  = particlesNormalRandomFromRange(template.lifeRange)
    this.lifeTotal      = this.lifeRemaining
    this.color          = template.colorFrom
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
        aceleration = {x: 0, y: 98}
        particle.vel = {x: particle.vel.x + aceleration.x * dt, y: particle.vel.y + aceleration.y * dt} ;
        particle.pos = {x: particle.pos.x + particle.vel.x * dt, y: particle.pos.y + particle.vel.y * dt}
        
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

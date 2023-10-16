function particlesInterpolate(factor, from, to) { 
    return from + (factor * (to - from));
}

function particlesRandomFromRange(range) { // range is [min, max]
    return (Math.random() * (range[1] - range[0])) + range[0];
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
}

function Particle(template) {
    this.template       = template
    this.pos            = {x: particlesRandomFromRange(template.posXRange), y: particlesRandomFromRange(template.posYRange)},
    this.vel            = {x: particlesRandomFromRange(template.velXRange), y: particlesRandomFromRange(template.velYRange)},
    this.radius         = particlesRandomFromRange(template.radiusRange)
    this.lifeRemaining  = particlesRandomFromRange(template.lifeRange)
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

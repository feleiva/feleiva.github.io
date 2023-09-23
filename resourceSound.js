var soundContext = null;

function resourceSoundInit() {
    try {
        soundContext = new AudioContext();
    }
    catch(e) {
        console.log('ResourceSound: Web Audio API is not supported in this browser');
    }
}


function resouceSoundLoad(soundInfo) {
    if (!soundContext)
        console.log('ResourceSound: No audio context when loading audio file: ' + soundInfo.filePath);

    var request = new XMLHttpRequest();
    request.open('GET', soundInfo.filePath, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
        soundContext.decodeAudioData(request.response, 
            function(buffer) { // Success decode lambda
                soundInfo.buffer = buffer;
            },
            function() {  // failed decode lambda
                console.log('ResourceSound: Failed to decode audio file: ' + soundInfo.filePath);
            },
        );
    }
    request.send();
}

function resouceSoundPlay(soundInfo) {
    if (!soundContext)
        console.log('ResourceSound: No audio context when playing audio file: ' + soundInfo.filePath);

    if (!soundInfo.buffer)
        console.log('ResourceSound: Audio not loaded when playing audio file: ' + soundInfo.filePath);


    var source      = soundContext.createBufferSource();     // creates a sound source
    source.buffer   = soundInfo.buffer;                   // tell the source which sound to play
    source.loop     = soundInfo.loop;

    var gainNode    = soundContext.createGain()
    gainNode.gain.value = soundInfo.volume
    gainNode.connect(soundContext.destination)

    source.connect(gainNode);                // connect the source to the context's destination (the speakers)
    source.start();                                   // play the source now
}
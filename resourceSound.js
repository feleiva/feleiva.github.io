var soundContext = null;

function resourceSoundInit() {
    try {
        soundContext = new AudioContext();
    }
    catch(e) {
        console.log('ResourceSound: Web Audio API is not supported in this browser');
    }
}

function resourceSoundIsAvailable() {
    return soundContext != null;
}

function resouceSoundLoad(soundInfo) {
    if (!soundContext) {
        console.log('ResourceSound: No audio context when loading audio file: ' + soundInfo.filePath);
        return;
    }
        

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

function resouceSoundStop(soundInfo) {
    if (!soundContext) {
        console.log('ResourceSound: No audio context when playing audio file: ' + soundInfo.filePath);
        return;
    }

    if (soundInfo.soundNode)
    {
        soundInfo.soundNode.stop();  
        soundInfo.soundNode = null;
    }
    else
        console.log('ResourceSound: Audio not playing when stopping audio file: ' + soundInfo.filePath);
}

function resouceSoundPlay(soundInfo) {
    if (!soundContext) {
        console.log('ResourceSound: No audio context when playing audio file: ' + soundInfo.filePath);
        return;
    }
       
    if (!soundInfo.buffer)
        console.log('ResourceSound: Audio not loaded when playing audio file: ' + soundInfo.filePath);

    if (soundInfo.singleInstance && soundInfo.soundNode)
    {
        console.log('ResourceSound: Single Instance Audio already playing audio file: ' + soundInfo.filePath);
        return;
    }

    var soundNode           = soundContext.createBufferSource();     // creates a sound source
    soundNode.buffer        = soundInfo.buffer;                   // tell the source which sound to play
    soundNode.loop          = soundInfo.loop;

    var gainNode            = soundContext.createGain()
    gainNode.gain.value     = soundInfo.volume
    gainNode.connect(soundContext.destination)

    soundNode.connect(gainNode);
    soundNode.start();    

    if (soundInfo.singleInstance)
    {
        soundInfo.soundNode = soundNode;
    }
}
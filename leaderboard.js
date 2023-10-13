
const _kLeaderboardStorageKey = "e-donkey_leaderboard"
const _kMaxLeaderboardEntries = 30;

var __leaderBoardData = {
    minScore: 10000,
    entries:  [] // each entry is an objects with {score: integer, name: string}
};

// Load the stored info, if any
function leaderboardInit() {
    console.log("LEADEROARD>> Starting up")
    if (localStorage.getItem(_kLeaderboardStorageKey)) {
        console.log("LEADEROARD>> Loading data from local storage")
        __leaderBoardData = JSON.parse(localStorage.getItem(_kLeaderboardStorageKey));
    }
}

function leaderboardTryAddEntry(name, score) {
    console.log("LEADEROARD>> Attempt to insert name: " + name + ", score: " + score)
    if (score < __leaderBoardData.minScore && __leaderBoardData.entries.length >= _kMaxLeaderboardEntries)
    {
        console.log("LEADEROARD>> Attempt failed, score is lower than min and theres no space");
        return;
    }

    // TODO, cambiar para que insersion sea ordenado por tiempo, el mas nuevo arriba. keep min and max!!!
    for (let i=0; i < __leaderBoardData.entries.length; i++) {
        if (score > __leaderBoardData.entries[i].score) {
            // Insert this new object
            console.log("LEADEROARD>> Inserting at slot " + i);
            
            __leaderBoardData.entries.splice(i, 0, {score: score, name: name});
            
            // Make sure we keep the array max size
            while (__leaderBoardData.entries.length > _kMaxLeaderboardEntries)
                __leaderBoardData.entries.pop();

            if (__leaderBoardData.entries[__leaderBoardData.entries.length-1].score > __leaderBoardData.minScore) {
                __leaderBoardData.minScore = __leaderBoardData.entries[__leaderBoardData.entries.length-1].score;
            }

            _leaderboardDump(); // Dump Post
            _leaderboardStore();
            return;
        }
    }

    if (__leaderBoardData.entries.length < _kMaxLeaderboardEntries) {
        console.log("LEADEROARD>> Appending at slot " + __leaderBoardData.entries.length);
        __leaderBoardData.entries.push({score: score, name: name});

        if (score < __leaderBoardData.minScore) {
            __leaderBoardData.minScore = score;
        }
        _leaderboardDump(); // Dump Post
        _leaderboardStore();
        return;
    }

}


function leaderboardReset() {
    console.log("LEADEROARD>> Reseting")
    __leaderBoardData.minScore = 10000;
    __leaderBoardData.entries = [];
    _leaderboardStore();
}

function _leaderboardStore() {
    console.log("LEADEROARD>> Storing on local starate")
    localStorage.setItem(_kLeaderboardStorageKey, JSON.stringify(__leaderBoardData));
}

function _leaderboardDump() {
    console.log("LEADEROARD>> Dump")
    console.log("LEADEROARD>>   MinScore: " + __leaderBoardData.minScore);
    for (let i=0; i < __leaderBoardData.entries.length; i++) { 
        console.log("LEADEROARD>>   [" + i + "]: {score: " + __leaderBoardData.entries[i].score + ", name: '" + __leaderBoardData.entries[i].name + "'}");
    }
}
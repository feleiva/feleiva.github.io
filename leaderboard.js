
const _kLeaderboardStorageKey = "e-donkey_leaderboard"
const _kMaxLeaderboardEntries = 30;

var __leaderBoardData = {
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

    // No data, or the score to add is lower than the last item
    if (__leaderBoardData.entries.length == 0 || __leaderBoardData.entries[__leaderBoardData.entries.length-1].score > score) {
        console.log("LEADEROARD>> Pushing at the end");
        __leaderBoardData.entries.push({score: score, name: name});
    }
    // New score is bigger or equal the top score
    else if ( __leaderBoardData.entries[0].score <= score)
    {
        console.log("LEADEROARD>> Inserting at slot 0");
        __leaderBoardData.entries.splice(0, 0, {score: score, name: name});   
    }
    // The new value will be pushed in between
    else 
    {
        for (let i = __leaderBoardData.entries.length-1; i >= 0; i--) {
            if (score < __leaderBoardData.entries[i].score) {
                // Insert this new object
                console.log("LEADEROARD>> Inserting at slot " + (i + 1));
                __leaderBoardData.entries.splice(i+1, 0, {score: score, name: name});
                break;
            }
        }
    }
    
    // Make sure we keep the array max size
    while (__leaderBoardData.entries.length > _kMaxLeaderboardEntries)
        __leaderBoardData.entries.pop();

    _leaderboardDump(); // Dump Post
    _leaderboardStore();
}


function leaderboardReset() {
    console.log("LEADEROARD>> Reseting")
    __leaderBoardData.entries = [];
    _leaderboardStore();
}

function _leaderboardStore() {
    console.log("LEADEROARD>> Storing on local starate")
    localStorage.setItem(_kLeaderboardStorageKey, JSON.stringify(__leaderBoardData));
}

function _leaderboardDump() {
    console.log("LEADEROARD>> Dump")
    for (let i=0; i < __leaderBoardData.entries.length; i++) { 
        console.log("LEADEROARD>>   [" + i + "]: {score: " + __leaderBoardData.entries[i].score + ", name: '" + __leaderBoardData.entries[i].name + "'}");
    }
}
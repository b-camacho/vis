function getBars (allWorks) {
    var currentYear = allWorks[0];
    var currentWorks = 0;
    allWorks.sort();
    var bars = [];
    for(var i=0; i<(allWorks[allWorks.length - 1] - allWorks[0] + 1); i++) {
        bars.push({
            year: allWorks[0] - (-i),
            amount: countYearOccurences(allWorks[0] - (-i), allWorks)
        })
    }


    console.log(bars);
    return bars;
}

function countYearOccurences (year, arr) {
    var result = 0;
    arr.forEach(function (el) {
        if(el == year) result++;
    });
    return result;
}
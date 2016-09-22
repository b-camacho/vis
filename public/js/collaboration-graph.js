/**
 * Created by nopony on 17/09/2016.
 */
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
        }

        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}


function getNodes (allWorks) { //allWorks: [ ["Collaborator1", "Collaborator2"], ["Collaborator3"] ];

    var CollaboratorList = getCompleteCollaboratorList(allWorks);

    var ringValues = getRingValues(CollaboratorList[0].collaborations);

   // console.log(ringValues);

    var circlePositions = [];
    var separationDistance = 360/ringValues[0].people.length;
    for(var angle = 0; angle < 360; angle += separationDistance) circlePositions.push(angle);

    ringValues.forEach(function (el, index) {
        if(index == 0) {
            el.arcs = circlePositions;
            return
        }
        circlePositions = getPositions(circlePositions, el.people.length);
        el.arcs = circlePositions
    });

    var nodes = [];
    var rings = [];

    ringValues.forEach(function (ring, index) {
        if(index == ringValues.length - 1) return;
        rings.push(ring.worksAmount);
        ring.people.forEach(function (person, index) {
            nodes.push({
                name: person,
                angle: ring.arcs[index],
                amount: ring.worksAmount
            })
        })
    });
    var simNodes = [];
    simNodes.push({id: ringValues[ringValues.length - 1].people[0], strengthValue: ringValues[ringValues.length - 1].worksAmount});
    nodes.forEach(function (el, index) {
        simNodes.push({id: el.name, strengthValue: el.amount});
    });

    var simLinks = [];
    nodes.forEach(function (el) {
        simLinks.push({source: simNodes[0].id, target: el.name, value: el.amount})
    });


    return {
        nodes: nodes,
        rings: rings,
        simNodes: simNodes,
        simLinks: simLinks
    };
}

function PolarToCartesian(angle, length) {
    angle = toRad(angle);
    return {
        x: Math.cos(angle) * length,
        y: Math.sin(angle) * length
    }
}
function toRad(deg) {
    return deg*Math.PI/180;
}
function getPositions (previousPositions, currentAmount) {
    var range = 360 / currentAmount;
   // if(range == 360) range = 180;
    var currentPositions = [];
    for(var angle = 0; angle < 360; angle += range) {
        currentPositions.push(angle);
    }

    var positionDifferences = [];
    var minimalPositionDifference = 0, currentBestOffset = 0;
    for(var offset=0; offset<range; offset += (range/20) ) {

        positionDifferences = currentPositions.map(function (position) {
            var distancesFromSinglePoint = [];
            previousPositions.forEach(function (previousPosition) {
                distancesFromSinglePoint.push(Math.abs(previousPosition - position - offset) % 180);
            });
            //console.log(Math.min.apply(null, distancesFromSinglePoint));
            return Math.min.apply(null, distancesFromSinglePoint);
        });

        if(Math.min.apply(null, positionDifferences) > minimalPositionDifference) {
            minimalPositionDifference = Math.min.apply(null, positionDifferences);
            currentBestOffset = offset
        }

    }

    return currentPositions.map(function (position) {
        return position + currentBestOffset;
    })
}

function getRingValues(singleCollaborationList) {

    singleCollaborationList = singleCollaborationList.sort(compareCollaboratorsByAmount);

    var ringValues = [{
        worksAmount: 1,
        people: []
    }];
    for(var i = 1; i<singleCollaborationList.length; i++) {
        if(singleCollaborationList[i-1].amount != singleCollaborationList[i].amount) {
            ringValues.push( {
                worksAmount: singleCollaborationList[i].amount,
                people: [singleCollaborationList[i].name]
            } )
        }
        else {
            ringValues[ ringValues.length - 1 ].people.push(singleCollaborationList[i].name);
        }
    }
    return ringValues;
}

function incrementCollaboration (arr, name) {
        for(var i=0; i<arr.length; i++) {
            if(arr[i].name == name) {
                arr[i].amount++;
                return
            }
        }
}

function getCompleteCollaboratorList ( allWorks ) {

    var allCollaborators = [];
    var allCollaboratorsWithAmounts = [];
    var collaborationAmountArray = [];
    allWorks.forEach(function (work) {
        work.forEach(function (person) {
            if(!allCollaborators.includes(person)) {
                allCollaborators.push(person);
                collaborationAmountArray.push(
                    {
                        name: person,
                        amount: 0
                    })
            }

        })
    });

    allCollaborators.forEach(function (person) {
        allCollaboratorsWithAmounts.push(
            {
                name: person,
                collaborations: JSON.parse(JSON.stringify(collaborationAmountArray))
            })
    });


    allCollaboratorsWithAmounts.forEach(function (collaborator, index, arr) {
        for(var i=0; i<allWorks.length; i++) {
            if(allWorks[i].includes(collaborator.name)) {
                allWorks[i].forEach(function (person) {
                    incrementCollaboration(collaborator.collaborations, person);
                });
            }
        }
    });

    return allCollaboratorsWithAmounts;
}

function compareCollaboratorsByAmount (a, b) {
    if (a.amount < b.amount) {
        return -1;
    }
    if (a.amount > b.amount) {
        return 1;
    }
    return 0;
}

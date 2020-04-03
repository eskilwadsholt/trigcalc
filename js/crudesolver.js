const toRadians = Math.PI / 180;
const toDegrees = 180 / Math.PI;
const debugging = false;

function findMissingSides(pairs) {
    var solvedPairs = [{}, {}, {}]
    solvedPairs[0].side = pairs[0].side;
    solvedPairs[1].side = pairs[1].side;
    solvedPairs[2].side = pairs[2].side;
    solvedPairs[0].angle = pairs[0].angle;
    solvedPairs[1].angle = pairs[1].angle;
    solvedPairs[2].angle = pairs[2].angle;
    tryAnglesum(solvedPairs);
    trySinRels(solvedPairs);
    tryCosRels(solvedPairs);
    return solvedPairs;
}

function tryCosRels(pairs) {
    var [pair1, pair2, pair3] = pairs;
    if (debugging) {
        console.log("Before trying cos-rels");
        printSides(pairs);
    }
    // Try all cos-rels
    tryCosRel([pair1, pair2, pair3]);
    tryCosRel([pair2, pair1, pair3]);
    tryCosRel([pair3, pair1, pair2]);
    if (debugging) {
        console.log("After trying cos-rels");
        printSides(pairs);
    }
}

function tryCosRel(pairs) {
    var [pair1, pair2, pair3] = pairs;
    if (!hasSide(pair1) && hasAngle(pair1)) {
        if (hasSide(pair2) && hasSide(pair3)) {
            if (debugging) console.log("Using cos-rel to find side ...");
            var b = pair2.side;
            var c = pair3.side;
            var A = pair1.angle;
            var square = b * b + c * c - 2 * b * c * Cos(A);
            pair1.side = Math.sqrt(square);
        }
    } else if (!hasSide(pair1) && knownPair(pair2) + knownPair(pair3) == 1) {
        var known = knownPair(pair2) ? pair2 : pair3;
        var other = knownPair(pair2) ? pair3 : pair2;
        // known^2 = x^2 + other^2 - 2 * other * x * cos(known)
        // find x ...
        // Note a=1
        const b = - 2 * other.side * Cos(known.angle);
        const c = other.side * other.side - known.side * known.side;
        const d = b * b - 4 * c;
        if (d >= 0) {
            if (debugging) {
                console.log("Using cos-rel to find two values for side ...");
            }
            var newSide1 = ( - b - Math.sqrt(d)) / 2;
            var newSide2 = ( - b + Math.sqrt(d)) / 2;
            if (debugging) {
                console.log("d: " + d);
                console.log("side1: " + newSide1);
                console.log("side2: " + newSide2);
            }
            if (newSide1 > 0) pair1.side = [newSide1, newSide2];
            else pair1.side = newSide2;
        }
    }
}

function trySinRels(pairs) {
    var [pair1, pair2, pair3] = pairs;
    if (debugging) {
        console.log("Before trying sin-rels");
        printSides(pairs);
    }
    // Try all sin-rels
    trySinRel([pair1, pair2, pair3]);
    trySinRel([pair2, pair1, pair3]);
    trySinRel([pair3, pair1, pair2]);
    if (debugging) {
        console.log("After trying sin-rels");
        printSides(pairs);
    }
}


function trySinRel(pairs) {
    var [pair1, pair2, pair3] = pairs;
    if (!hasSide(pair1) && hasAngle(pair1)) {
        if (knownPair(pair2) || knownPair(pair3)) {
            if (debugging) console.log("Using sin-rel to find side ...");
            var known = knownPair(pair2) ? pair2 : pair3;
            pair1.side = known.side / Sin(known.angle) * Sin(pair1.angle);
        }
    }
}

function knownPair(pair) {
    return hasSide(pair) && hasAngle(pair);
}

function tryAnglesum(pairs) {
    var [pair1, pair2, pair3] = pairs;
    if (debugging) {
        console.log("Before anglesum: ");
        printAngles(pairs);
    }
    if (hasAngle(pair1) + hasAngle(pair2) + hasAngle(pair3) == 2) {
        if (debugging) console.log("Using anglesum to find angle ...");
        if (!hasAngle(pair1)) {
            pair1.angle = 180 - pair2.angle - pair3.angle;
        } else if (!hasAngle(pair2)) {
            pair2.angle = 180 - pair1.angle - pair3.angle;
        } else {
            pair3.angle = 180 - pair1.angle - pair2.angle;
        }
    }
    if (debugging) {
        console.log("After anglesum: ");
        printAngles(pairs);
    }
}

function printAngles(pairs) {
    var [pair1, pair2, pair3] = pairs;
    console.log("angle1: " + pair1.angle);
    console.log("angle2: " + pair2.angle);
    console.log("angle3: " + pair3.angle);
}

function printSides(pairs) {
    var [pair1, pair2, pair3] = pairs;
    console.log("side1: " + pair1.side);
    console.log("side2: " + pair2.side);
    console.log("side3: " + pair3.side);
}

function hasAngle(pair) {
    return (pair.angle == null) ? 0 : 1;
}

function hasSide(pair) {
    return (pair.side == null) ? 0 : 1;
}


function Sin(angle) {
    return Math.sin(angle * toRadians);
}

function Cos(angle) {
    return Math.cos(angle * toRadians);
}
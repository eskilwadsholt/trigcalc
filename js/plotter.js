 
var data = [150, 230, 180, 90];

var chart = document.getElementById("chart");
var dimensions = Math.min(chart.clientWidth, chart.clientHeight);
    
var svg = d3.select(chart)
            .append("svg");

svg
    .attr("width", dimensions)
    .attr("height", dimensions);

svg.append("rect")
    .attr("width", dimensions)
    .attr("height", dimensions)
    .style("fill", "rgba(0, 0, 0, 0.1)");

// Append empty containers for axes
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(${0.1 * dimensions}, ${0.9 * dimensions})`);
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${0.1 * dimensions}, ${0.1 * dimensions})`);


var svgTriangle2 = svg.append("polygon")
    .attr("id", "backgroundTriangle");;

var svgTriangle = svg.append("polygon")
    .attr("id", "frontTriangle");

var solvedPairs = findMissingSides(pairs);
plotTriangles(pairs, names, solvedPairs);

function plotTriangles(pairs, names, solvedPairs) {
    var [pair1, pair2, pair3] = solvedPairs;
    var s1, s2, s3, s4, s5, s6;
    var hasTwoLengths = 0;
    if (Array.isArray(pair1.side)) {
        s1 = pair1.side[1];
        s4 = pair1.side[0];
        hasTwoLengths = 1;
    } else {
        s1 = pair1.side;
        s4 = pair1.side;
    }
    if (Array.isArray(pair2.side)) {
        s2 = pair2.side[1];
        s5 = pair2.side[0];
        hasTwoLengths = 2
    } else {
        s2 = pair2.side;
        s5 = pair2.side;
    }
    if (Array.isArray(pair3.side)) {
        s3 = pair3.side[1];
        s6 = pair3.side[0];
        hasTwoLengths = 3;
    } else {
        s3 = pair3.side;
        s6 = pair3.side;
    }

    // Compute points in background triangle
    var P1 = [0, 0];
    var P2 = [s1, 0];
    var x1 = (s1 * s1 + s3 * s3 - s2 * s2) / (2 * s1);
    var y1 = Math.sqrt(s3 * s3 - x1 * x1);
    var P3 = [x1, y1];

    // Compute points in front triangle
    var P4 = P1;
    var P5 = P2;
    var P6 = P3;

    function rescale(A, B, factor) {
        var x = A[0] + factor * (B[0] - A[0]);
        var y = A[1] + factor * (B[1] - A[1]);
        return [ x, y];
    }

    // Find out which vector between points should be resized
    var rescaleFactor = 1;
    if (hasTwoLengths == 1) {
        rescaleFactor = s4 / s1;
        if (s3 > s2) {
            // Resized P1-P2
            P5 = rescale(P1, P2, rescaleFactor);
        } else {
            // Resized P2-P1
            P4 = rescale(P2, P1, rescaleFactor);
        }
    } else if (hasTwoLengths == 2) {
        rescaleFactor = s5 / s2;
        if (s1 > s3) {
            // Resized P2-P3
            P6 = rescale(P2, P3, rescaleFactor);
        } else {
            // Resized P3-P2
            P5 = rescale(P3, P2, rescaleFactor);
        }
    } else if (hasTwoLengths == 3) {
        rescaleFactor = s6 / s3;
        if (s2 > s1) {
            // Resized P3-P1
            P4 = rescale(P3, P1, rescaleFactor);
        } else {
            // Resized P1-P3
            P6 = rescale(P1, P3, rescaleFactor);
        }
    }    

    var xVals = [P1[0], P2[0], P3[0], P4[0], P5[0], P6[0]];
    var yVals = [P1[1], P2[1], P3[1], P4[1], P5[1], P6[1]];

    var xMin = d3.min(xVals);
    var xMax = d3.max(xVals);
    var xMid = (xMin + xMax) / 2;
    var yMin = d3.min(yVals);
    var yMax = d3.max(yVals);
    var yMid = (yMin + yMax) / 2;
    var scaleFactor = xMax - xMin;
    if (yMax - yMin > scaleFactor) scaleFactor = yMax - yMin;
    var scale = d3.scaleLinear()
        .range([0.2 * dimensions, 0.8 * dimensions]);

    scale.domain([-scaleFactor / 2, scaleFactor / 2]);
    var xScale = d3.scaleLinear()
        .range([0, 0.8 * dimensions]);
    xScale.domain([0, scaleFactor * 8 / 6]);
    var yScale = d3.scaleLinear()
        .range([0, 0.8 * dimensions]);
    yScale.domain([scaleFactor * 8 / 6, 0]);


    function pointToString(P) {
        return scale(P[0] - xMid) + "," + scale(yMid - P[1]) + " ";
    }

    var trianglePoints =
        pointToString(P1)
        + pointToString(P2) 
        + pointToString(P3);

    svgTriangle2
        .attr("points", trianglePoints);

    var trianglePoints =
        pointToString(P4)
        + pointToString(P5) 
        + pointToString(P6);

    svgTriangle
        .attr("points", trianglePoints);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    /*
    d3.select(".x.axis")
        .call(xAxis);
    
    d3.select(".y.axis")
        .call(yAxis);
    */

    function createAngleText(i) {
        var angleText = names[i]["angle"];
        angleText += (hasAngle(pairs[i]) ?  "=" + pairs[i].angle : "");
        return angleText;
    }

    var angleTexts = [
        { point: P1, text: createAngleText(1), displace: [-14, 8]},
        { point: P2, text: createAngleText(2), displace: [5, 8]},
        { point: P3, text: createAngleText(0), displace: [2, -3]},
        { point: P4, text: createAngleText(1), displace: [-14, 8]},
        { point: P5, text: createAngleText(2), displace: [5, 8]},
        { point: P6, text: createAngleText(0), displace: [2, -3]},
    ];

    var angles = svg.selectAll(".angles")
        .data(angleTexts)
        .enter()
        .append("text");
        
    angles
        .attr("x", function(d) { return scale(d.point[0] - xMid) + d.displace[0]; })
        .attr("y", function(d) { return scale(yMid - d.point[1]) + d.displace[1]; })
        .attr("id", "angle")
        .text(function(d) { return d.text; });

    function createSideText(i) {
        var sideText = names[i].side;
        sideText += (hasSide(pairs[i]) ? "=" + pairs[i].side : "");
        return sideText;
    }

    function midPoint(A, B) {
        return [(A[0] + B[0])/2, (A[1] + B[1])/2];
    }

    var sideTexts = [
        { point: midPoint(P1, P2), text: createSideText(0)},
        { point: midPoint(P2, P3), text: createSideText(1)},
        { point: midPoint(P3, P1), text: createSideText(2)},
        { point: midPoint(P4, P5), text: createSideText(0)},
        { point: midPoint(P5, P6), text: createSideText(1)},
        { point: midPoint(P6, P4), text: createSideText(2)},
    ];

    var sides = svg.selectAll(".sides")
        .data(sideTexts)
        .enter()
        .append("text");
        
    sides
        .attr("x", function(d) { return scale(d.point[0] - xMid); })
        .attr("y", function(d) { return scale(yMid - d.point[1]); })
        .attr("id", "side")
        .text(function(d) { return d.text; });


    if (debugging) {
        console.log("P1:\t" + P1);
        console.log("P2:\t" + P2);
        console.log("P3:\t" + P3);
        console.log("P4:\t" + P4);
        console.log("P5:\t" + P5);
        console.log("P6:\t" + P6);
    }

}

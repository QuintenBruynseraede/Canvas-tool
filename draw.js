var canvas;
var ctx;
var canvasOffset;
var offsetX;
var offsetY;
var storedEdges;
var storedNodes;
var startX;
var startY;
var tool = "node";
var selectedElem;
var firstNode = null;
var secondNode = null;
var movingElem = null;
var grid = 0;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.textAlign = "center"; 
    canvasOffset = $("#canvas").offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
    storedEdges = [];
    storedNodes = [];
    startX = 0;
    startY = 0;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    setTool(tool);

    $("#canvas").mouseup(function(e) {
      mouseUp(e);
    });
    $("#canvas").mouseout(function(e) {
      mouseOut(e);
    });
    $("#canvas").mousedown(function(e) {
        mousedown(e);
    });
    $("#canvas").mousemove(function(e) {
        mousemove(e);
    });
    
    
    window.addEventListener('keypress',this.keyPress,false);
    window.addEventListener('keydown',this.keyDown,false);

}


function mouseUp(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = parseInt(e.clientX - offsetX);
    var mouseY = parseInt(e.clientY - offsetY); 
    
    switch (tool) {
        case "node":
            storedNodes.push({
                x: snapToGrid(mouseX,mouseY)[0],
                y: snapToGrid(mouseX,mouseY)[1],
                label: "",
                color: 0,
                style: 0
            })
            console.log("Added node at "+mouseX+",",mouseY);
            break;
        case "edge":
            if (firstNode == null) {
                firstNode = getClosestNode(mouseX,mouseY,10).id;
            }
            else {
                secondNode = getClosestNode(mouseX,mouseY,10).id;
                addEdge({
                    node1: firstNode,
                    node2: secondNode,
                    label: "",
                    color: 0,
                    style: 0
                });
                firstNode = null;
                secondNode = null;
            }
            break;
        case "label":
            res1 = getClosestNode(mouseX,mouseY,10);
            res2 = getClosestEdge(mouseX,mouseY,10);
            if (res1.elem == null && res2.elem != null) {
                selectedElem = res2.elem;
                console.log("edge");
            }
            else if (res2.elem == null && res1.elem != null) {
                selectedElem = res1.elem;
                console.log("node");
            }
            else if (res1.elem == null && res2.elem == null) {
                selectedElem = null;
                console.log("null");
            }
            else {
                selectedElem = res1.elem;
            }


            break;
        case "move":
            movingElem = null;
    }

    draw();    

}

function mousedown(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = parseInt(e.clientX - offsetX);
    var mouseY = parseInt(e.clientY - offsetY); 

    if (tool == 'move') {
        movingElem = getClosestNode(mouseX,mouseY,10).elem;
        console.log(movingElem);
    }

}

function mousemove(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = parseInt(e.clientX - offsetX);
    var mouseY = parseInt(e.clientY - offsetY); 

    if (tool == 'move' && movingElem != null) {
        moveNode(movingElem,mouseX,mouseY);
    }

    draw();

}
    

function mouseOut(e) {
  e.preventDefault();
  e.stopPropagation();

  draw();
}

function keyPress(e) {
    e.preventDefault();
    e.stopPropagation();

    
    if (selectedElem != null) {
        selectedElem.label = selectedElem.label + String.fromCharCode(e.keyCode);
        draw();
    }
}

function keyDown(e) {
    const key = e.key;
    if (key === "Backspace" && selectedElem != null) {
        console.log(selectedElem.label.slice(0,-1));
        selectedElem.label = selectedElem.label.slice(0,-1);
        draw();
    }
}


function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var oldWidth = ctx.lineWidth;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;


    // redraw grid
    if (grid == 0) {
        // Free drawing: no grid
    }
    else if (grid == 1) {
        // 10x10 grid
        console.log("Drawing grid 1");

        for (var i=0;i<500;i+=10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }
    else if (grid == 2) {
        // 15x15 grid
        console.log("Drawing grid 2");
        for (var i=0;i<500;i+=15) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }

    else if (grid == 3) {
        // 25x25 grid
        console.log("Drawing grid 3");
        for (var i=0;i<500;i+=25) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }

    else if (grid == 4) {
        // 50x50 grid
        console.log("Drawing grid 3");
        for (var i=0;i<500;i+=50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }

    else if (grid == 5) {
        // Triangular grid

        console.log("Drawing grid 5");
    }

    ctx.globalAlpha = 1;        
    ctx.lineWidth = oldWidth;


    // redraw all edges
    for (var i = 0; i < storedEdges.length; i++) {
        var edge = storedEdges[i];
        if (edge == selectedElem) {
            ctx.strokeStyle = "red";
        }
        else {
            ctx.strokeStyle = "black";
        }
        ctx.beginPath();
        ctx.moveTo(storedNodes[edge.node1].x, storedNodes[edge.node1].y);
        ctx.lineTo(storedNodes[edge.node2].x, storedNodes[edge.node2].y);
        if (edge.label != "") {
            ctx.fillText(edge.label,(storedNodes[edge.node1].x+storedNodes[edge.node2].x)/2,(storedNodes[edge.node1].y+storedNodes[edge.node2].y)/2-15);
            // console.log(edge.label);
        }
        ctx.stroke();
        
    }  

    // redraw each stored node
    for (var i = 0; i < storedNodes.length; i++) {
        var node =  storedNodes[i];
        ctx.beginPath();
        if (node == selectedElem) {
            ctx.strokeStyle = "red";
            ctx.arc(node.x,node.y,3,0,2*Math.PI);
        }
        else if (node == firstNode) {
            ctx.strokeStyle = "red";
            ctx.arc(node.x,node.y,3,0,2*Math.PI);
        }
        else if (node == secondNode) {
            ctx.strokeStyle = "blue";
            ctx.arc(node.x,node.y,3,0,2*Math.PI);
        }
        else {
            ctx.strokeStyle = "black";
            ctx.arc(node.x,node.y,3,0,2*Math.PI);
        }
        if (node.label != "") {
            ctx.font = "15px Arial";
            ctx.fillText(node.label,node.x,node.y-15);
        }
        ctx.fill();
        ctx.stroke();
    }
    ctx.strokeStyle = "black";

}

function setTool(x) {
    if (x != "label") {
        selectedElem = null;
        selectedEdge = null;
    }
    
    if (x != "edge") {
        firstNode = null;
        secondNode = null;
    }
    tool = x;

    draw();

    txt = document.getElementById("current_tool");
    txt.innerHTML = x;
}

function getClosestNode(x,y,maxdist) {
    // Find closest node
    var minDist = 9999;
    var minElem;
    var id=null;

    for (var i = 0; i < storedNodes.length; i++) {
        if (Math.sqrt(Math.pow(x-storedNodes[i].x,2) + Math.pow(y-storedNodes[i].y,2)) < minDist) {
            minDist = Math.sqrt(Math.pow(x-storedNodes[i].x,2) + Math.pow(y-storedNodes[i].y,2));
            minElem = storedNodes[i];
            id = i;
        }
    }
    if (minDist > maxdist) {
        return {elem: null,dist:null,id:null}
    }
    return {elem: minElem,dist:minDist,id:id}
}

function getClosestEdge(x,y,maxdist) {
    var minDist = 9999;
    var dist;
    var minElem;
    var x1,x2,y1,y2,x0,y0;

    for (var i = 0; i < storedEdges.length; i++) {
        x1 = storedNodes[storedEdges[i].node1].x;
        x2 = storedNodes[storedEdges[i].node2].x;
        y1 = storedNodes[storedEdges[i].node1].y;
        y2 = storedNodes[storedEdges[i].node2].y;
        x0 = x;
        y0 = y;
        
        dist = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) / Math.sqrt((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
        if (dist < minDist) {
            minElem = storedEdges[i];
            minDist = dist;
        }
    }
    if (minDist > 10) {
        return {elem: null,dist:null};
    }
    return {elem: minElem,dist:minDist};
}

function addEdge(e) {
    // find identical edge (ignoring label)
    if (e.node1 == e.node2) {
        return;
    }

    for (var i = 0; i < storedEdges.length; i++) {
        e2 = storedEdges[i];
        if (e.node1 == e2.node1 && e.node2 == e2.node2) {
            console.log("Edge already exists!");
            return;
        }
    } 
    console.log("Added edge.");
    storedEdges.push(e);
}

function moveNode(node,toX,toY) {
    node.x = snapToGrid(toX,0)[0];
    node.y = snapToGrid(0,toY)[1];
}

function nextGrid() {
    // 0: no grid, 1: 10x10 square grid, 2: 5x5 square grid
    grid = (grid + 1) % 6;

    // Snap old nodes to new grid
    for (var i = 0; i < storedNodes.length; i++) {
        var node =  storedNodes[i];
        node.x = snapToGrid(node.x,0)[0];
        node.y = snapToGrid(0,node.y)[1];
    }

    draw();
}

function snapToGrid(x,y) {
    if (grid == 0) {
        return {0:x,1:y};
    }
    if (grid == 1) {
        return {0:10*Math.round(x/10),1:10*Math.round(y/10)};
    }
    if (grid == 2) {
        return {0:15*Math.round(x/15),1:15*Math.round(y/15)};
    }
    if (grid == 3) {
        return {0:25*Math.round(x/25),1:25*Math.round(y/25)};
    }
    if (grid == 4) {
        return {0:50*Math.round(x/50),1:50*Math.round(y/50)};
    }
    if (grid == 5) {
        return {0:x,1:y};
    }
}

function nextColor(col) {
    return (col+1) % 5;
}

function nextNodeStyle(style) {
    return (style+1) % 4;
}

function nextEdgeStyle(style) {
    return (style+1) % 6;
}
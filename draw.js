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
                x: mouseX,
                y: mouseY,
                label: "",
            })
            console.log("Added node at "+mouseX+",",mouseY);
            break;
        case "edge":
            if (firstNode == null) {
                firstNode = getClosestNode(mouseX,mouseY,10).elem;
            }
            else {
                secondNode = getClosestNode(mouseX,mouseY,10).elem;
                addEdge({
                    x1: firstNode.x,
                    y1: firstNode.y,
                    x2: secondNode.x,
                    y2: secondNode.y,
                    label: ""
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
                if (res1.dist > res2.dist) {
                    selectedElem = res2.elem;
                    console.log("edge");
                }
                else {
                    selectedElem = res1.elem;
                    console.log("node");
                }
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
        ctx.moveTo(edge.x1, edge.y1);
        ctx.lineTo(edge.x2, edge.y2);
        if (edge.label != "") {
            ctx.fillText(edge.label,(edge.x1+edge.x2)/2,(edge.y1+edge.y2)/2-15);
            console.log(edge.label);
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

    for (var i = 0; i < storedNodes.length; i++) {
        if (Math.sqrt(Math.pow(x-storedNodes[i].x,2) + Math.pow(y-storedNodes[i].y,2)) < minDist) {
            minDist = Math.sqrt(Math.pow(x-storedNodes[i].x,2) + Math.pow(y-storedNodes[i].y,2));
            minElem = storedNodes[i];
        }
    }
    if (minDist > maxdist) {
        return {elem: null,dist:null}
    }
    return {elem: minElem,dist:minDist}
}

function getClosestEdge(x,y,maxdist) {
    var minDist = 9999;
    var dist;
    var minElem;
    var x1,x2,y1,y2,x0,y0;

    for (var i = 0; i < storedEdges.length; i++) {
        x1 = storedEdges[i].x1;
        x2 = storedEdges[i].x2;
        y1 = storedEdges[i].y1;
        y2 = storedEdges[i].y2;
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
    for (var i = 0; i < storedEdges.length; i++) {
        e2 = storedEdges[i];
        if (e.x1 == e2.x1 && e.x2 == e2.x2 && e.y1 == e2.y1 && e.y2 == e2.y2 ||
            e.x2 == e2.x1 && e.x1 == e2.x2 && e.y2 == e2.y1 && e.y1 == e2.y2) {
            console.log("Edge already exists!");
            return;
        }
    } 
    console.log("Added edge.");
    storedEdges.push(e);
}

function moveNode(node,toX,toY) {

    for (var i = 0; i < storedEdges.length; i++) {
        e = storedEdges[i];
        if (e.x1 == node.x && e.y1 == node.y) {
            e.x1 = toX;
            e.y1 = toY;
        }
        else if (e.x2 == node.x && e.y2 == node.y) {
            e.x2 = toX;
            e.y2 = toY;
        }
    } 

    node.x = toX;
    node.y = toY;
}
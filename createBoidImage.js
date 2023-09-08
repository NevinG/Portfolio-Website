const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const outputText = document.getElementById("output");
const newLineButton = document.getElementById("new-line");

const image = new Image();
let width;
let height;
image.src = "mosalah.jfif";
image.onload = drawImageActualSize;
let points = [[]];

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

newLineButton.onclick = newLine;

function newLine(){
    points.push([]);
    updateOutput();
}

function addPoint(x,y){
    if(points[points.length - 1].length > 0){
        ctx.beginPath();
        ctx.moveTo(points[points.length - 1][points[points.length - 1].length - 1][0], points[points.length - 1][points[points.length - 1].length - 1][1]);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }
    else{
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    points[points.length - 1].push([x,y]);
    updateOutput();
}

function updateOutput(){
    //use width, height, and anchor
    let outputString = `
    aspectRatio: ${width/height},
    boidPosition:
      [\n`;
    for(let i = 0; i < points.length; i++){
        let array = "&nbsp&nbsp[\n"
        for(let j = 0; j < points[i].length; j++){
            array += `&nbsp&nbsp&nbsp&nbsp[anchor[0] + width * ${points[i][j][0] / width}, anchor[1] + height * ${points[i][j][1] / height}], \n`
        }
        array += '&nbsp&nbsp]';
        outputString += array + ", \n";
    }
    outputString += ']';
    outputString = outputString.replaceAll("\n", "<br />");
    outputText.innerHTML = outputString;
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    addPoint(x,y);
}

function drawImageActualSize() {
  let mult = 3;
  canvas.width = this.naturalWidth * mult;
  canvas.height = this.naturalHeight * mult;
  ctx.drawImage(this, 0, 0);
  canvas.style.width = this.width * mult;
  canvas.style.height = this.height * mult;
  width = this.width * mult;
  height = this.height * mult;
  ctx.drawImage(this, 0, 0, this.width * mult, this.height * mult);
}


  
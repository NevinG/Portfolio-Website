//used as reference for the boid movement
//https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html#Separation
const my_canvas = document.getElementById('banner_canvas');

const Application = PIXI.Application;

const app = new Application({
    view: my_canvas
});

app.renderer.background.color = 0x000000;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute';

const mousePosition = {x: 0, y: 0};

const Graphics = PIXI.Graphics;

const boidCount = 300;
const boids = [];
const boidAvoidVision = 20; //how much vision each boid has to avoid other boids
const boidAlignVision = 120;
const avoidFactor = .025; // how harsh boids move to avoid eachother
const matchingFactor = .1; // how much boids move to align with other boids veolocities
const centeringFactor = .0; //how much boids move towards the center of mass of other boids
const turnFactor = .1;
const obstacleFactor = 0.01;
const speedFactor = 2;

const obstacles = []; //list bounding boxes to steer away from. Only rectangles (so two points per obstacle)

//ADD TEXT
const Text = PIXI.Text;
Text.defaultResolution = 2;
Text.defaultAutoResolution = false;
const text = new Text('Nevin Gilday', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0x000000,
    fontWeight: 'bold',
});
text.anchor.set(.5);
text.position.set(app.view.width / 2, app.view.height / 2);

app.stage.addChild(text);
//add text to the obstacles

obstacles.push([[text.position.x - text.width / 2, text.position.y + text.height / 2],
                [text.position.x + text.width / 2, text.position.y - text.height / 2]])
//ADD THE BOIDS

for(let i = 0; i < boidCount; i++){
    //create the graphics for the boid
    const boidGraphic = new Graphics();
    boidGraphic.beginFill(0xFFFFFF);
    boidGraphic.drawCircle(0, 0, 2);
    boidGraphic.endFill();
    boidGraphic.position.set(Math.random() * app.view.width, Math.random() * app.view.height);
    const boid = {
        boidGraphic: boidGraphic,
        direction:{
            x: Math.random()*2 -1,
            y: Math.random()*2 -1,
        },
    }
    //normalize direction
    normalizeDirection(boid);

    app.stage.addChild(boid.boidGraphic);
    //add boid to the array of boids
    boids.push(boid);
}

//move the boids
app.ticker.add(delta => loop(delta));
function loop(delta){
    for(let i = 0; i < boidCount; i++){
        //steer away from very nearby boids
        //align velocity with kinda nearby boids
        //loop through every boid
        let xDist = 0;
        let yDist = 0
        let avgXDir = 0;
        let avgYDir = 0;
        let avgXPos = 0;
        let avgYPos = 0;
        let boidsInSight = 0;
        for(let j = 0; j < boidCount; j++){
            //skip over itself
            if(j == i)
                continue;
            //seperation
            const dist = distance(boids[i], boids[j]);
            if(dist < boidAvoidVision){
                xDist += boids[i].boidGraphic.position.x - boids[j].boidGraphic.position.x;
                yDist += boids[i].boidGraphic.position.y - boids[j].boidGraphic.position.y;
            }
            //alignment
            if(dist < boidAlignVision){
                avgXDir += boids[j].direction.x;
                avgYDir += boids[j].direction.y;
                avgXPos += boids[j].boidGraphic.position.x;
                avgYPos += boids[j].boidGraphic.position.y;
                boidsInSight++;
            }
        }
        //seperation
        boids[i].direction.x += xDist * avoidFactor;
        boids[i].direction.y += yDist * avoidFactor;
        normalizeDirection(boids[i])

        if(boidsInSight > 0){
            //alignment
            avgXDir /= boidsInSight;
            avgYDir /= boidsInSight;
            boids[i].direction.x += (avgXDir - boids[i].direction.x) * matchingFactor;
            boids[i].direction.y += (avgYDir - boids[i].direction.y) * matchingFactor;
            normalizeDirection(boids[i]);

            //cohesion
            avgXPos /= boidsInSight;
            avgYPos /= boidsInSight;
            boids[i].direction.x += (avgXPos - boids[i].boidGraphic.position.x) * centeringFactor;
            boids[i].direction.y += (avgYPos - boids[i].boidGraphic.position.y) * centeringFactor;
            normalizeDirection(boids[i]);

        }

        //if out of bounds move in bounds
        if(boids[i].boidGraphic.position.x > app.view.width)
            boids[i].direction.x -= turnFactor;
        if(boids[i].boidGraphic.position.x < 0)
            boids[i].direction.x += turnFactor;
        if(boids[i].boidGraphic.position.y > app.view.height)
            boids[i].direction.y -= turnFactor;
        if(boids[i].boidGraphic.position.y < 0)
            boids[i].direction.y += turnFactor;

        normalizeDirection(boids[i]);

        //if near obstacle move away
        for(let j = 0; j < obstacles.length; j++){
            let xDist = 0
            let yDist = 0;
            //check if position is inside obstacles
            if(boids[i].boidGraphic.position.x >= obstacles[j][0][0] 
            && boids[i].boidGraphic.position.x <= obstacles[j][1][0]
            && boids[i].boidGraphic.position.y <= obstacles[j][0][1]
            && boids[i].boidGraphic.position.y >= obstacles[j][1][1]){
                //move towards closest point on edge of obstacles
                let dist1 = obstacles[j][0][0] - boids[i].boidGraphic.position.x;
                let dist2 = obstacles[j][1][0] - boids[i].boidGraphic.position.x;
                let dist3 = obstacles[j][0][1] - boids[i].boidGraphic.position.y;
                let dist4 = obstacles[j][1][1] - boids[i].boidGraphic.position.y;
                if(Math.abs(dist1) <= Math.abs(dist2)){
                    xDist = dist1;
                }else{
                    xDist = dist2;
                }
                if(Math.abs(dist3) <= Math.abs(dist4)){
                    yDist = dist3;
                }else{
                    yDist = dist4;
                }
                boids[i].direction.x += xDist * obstacleFactor;
                boids[i].direction.y += yDist * obstacleFactor;
                normalizeDirection(boids[i]);
            }
            
        }
        //if near cursor move away
        if(Math.sqrt(Math.pow((boids[i].boidGraphic.position.x - mousePosition.x),2) + Math.pow((boids[i].boidGraphic.position.y - mousePosition.y),2)) < 40){
            //move away from cursor
            xDist = boids[i].boidGraphic.position.x - mousePosition.x;
            yDist = boids[i].boidGraphic.position.y - mousePosition.y;

            boids[i].direction.x += xDist * obstacleFactor * 5;
            boids[i].direction.y += yDist * obstacleFactor * 5;
            normalizeDirection(boids[i]);
        }

        //move according to direction
        let deltaX = boids[i].direction.x * delta * speedFactor;
        let deltaY = boids[i].direction.y * delta * speedFactor;
        boids[i].boidGraphic.position.x += deltaX;
        boids[i].boidGraphic.position.y += deltaY;
    }
}

 addEventListener("mousemove", function(e){
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
 });

function distance(boidA, boidB){
    return Math.sqrt(Math.pow((boidA.boidGraphic.position.x - boidB.boidGraphic.position.x),2) + Math.pow((boidA.boidGraphic.position.y - boidB.boidGraphic.position.y),2));
}

function normalizeDirection(boid){
    const magnitiude = Math.sqrt(boid.direction.x * boid.direction.x + boid.direction.y * boid.direction.y)
    boid.direction.x /= magnitiude;
    boid.direction.y /= magnitiude;
}

export default function MainPage(){
    return(
        <div>test</div>
    );
}
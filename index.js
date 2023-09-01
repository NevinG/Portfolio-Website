//used as reference for the boid movement

//https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html#Separation
const my_canvas = document.getElementById('my_canvas');

const Application = PIXI.Application;

const app = new Application({
    view: my_canvas
});

app.renderer.background.color = 0x000000;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute';

let introductionMoved = false;
let currentlyAnimating = false;
let boidTimeRemaining = 0;
let currentSection = '';
const mousePosition = {x: 0, y: 0};
let animationsQueuedAfterBoids = [];
let boidAnimationDivisions = [];

const introductionDiv = document.getElementById('introduction');
let introductionAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,

    boidTime1: 3,
    boidPosition1: [
        [
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),window.innerHeight / 2 + (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),window.innerHeight / 2 - (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 + (introductionDiv.clientWidth / 2),window.innerHeight / 2 - (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 + (introductionDiv.clientWidth / 2),window.innerHeight / 2 + (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),window.innerHeight / 2 + (introductionDiv.clientHeight / 2)]
        ],
    ],
    boidPosition2: [
        [
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),window.innerHeight / 4 + (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),window.innerHeight / 4 - (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 + (introductionDiv.clientWidth / 2),window.innerHeight / 4 - (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 + (introductionDiv.clientWidth / 2),window.innerHeight / 4 + (introductionDiv.clientHeight / 2)],
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),window.innerHeight / 4 + (introductionDiv.clientHeight / 2)]
        ],
    ],
}
let aboutEnterAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,
    boidTime1: 3,
};
let aboutLeaveAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,
};
let projectsEnterAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,
    boidTime1: 3,
};
let projectsLeaveAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,
};
let contactEnterAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,
    boidTime1: 3,
};
let contactLeaveAnimation = {
    start: false,
    duration: 3,
    durationElapsed: 0,
};

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

// obstacles.push([[text.position.x - text.width / 2, text.position.y + text.height / 2],
//                 [text.position.x + text.width / 2, text.position.y - text.height / 2]])
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
        animationPosition: {
            x: undefined,
            y: undefined, 
        }
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
    //timer for boid animations
    if(boidTimeRemaining > 0){
        boidTimeRemaining -= (delta / 60);
        if(boidTimeRemaining <= 0){
            //make sure boids are in final spot
            for(let i = 0; i < boidCount; i++){
                if(boids[i].animationPosition.x != undefined){
                    boids[i].boidGraphic.position.x = boids[i].animationPosition.x;
                    boids[i].boidGraphic.position.y = boids[i].animationPosition.y;
                }
            }

            //check for queued animations
            while(animationsQueuedAfterBoids.length > 0){
                switch(animationsQueuedAfterBoids.pop()){
                    case 'introductionAnimation':
                        introductionAnimation.start = true;
                        calculateBoidAnimationPosition(introductionAnimation.boidPosition2,0,boidAnimationDivisions[0]);
                        boidTimeRemaining = introductionAnimation.duration;
                        break;
                    case 'aboutEnterAnimation':
                        aboutEnterAnimation.start = true;
                        if(!introductionMoved){
                            calculateBoidAnimationPosition(aboutEnterAnimation.boidPosition2,boidAnimationDivisions[0],boidAnimationDivisions[1]);
                        }
                        else{
                            calculateBoidAnimationPosition(aboutEnterAnimation.boidPosition2,0,boidAnimationDivisions[0]);
                        }
                        boidTimeRemaining = aboutEnterAnimation.duration;
                        break;
                    case 'projectsEnterAnimation':
                        projectsEnterAnimation.start = true;
                        if(!introductionMoved){
                            calculateBoidAnimationPosition(projectsEnterAnimation.boidPosition2,boidAnimationDivisions[0],boidAnimationDivisions[1]);
                        }
                        else{
                            calculateBoidAnimationPosition(projectsEnterAnimation.boidPosition2,0,boidAnimationDivisions[0]);
                        }
                        boidTimeRemaining = projectsEnterAnimation.duration;
                        break;
                    case 'contactEnterAnimation':
                        contactEnterAnimation.start = true;
                        if(!introductionMoved){
                            calculateBoidAnimationPosition(contactEnterAnimation.boidPosition2,boidAnimationDivisions[0],boidAnimationDivisions[1]);
                        }
                        else{
                            calculateBoidAnimationPosition(contactEnterAnimation.boidPosition2,0,boidAnimationDivisions[0]);
                        }
                        boidTimeRemaining = contactEnterAnimation.duration;
                        break;
                    case 'aboutLeaveAnimation':
                        aboutLeaveAnimation.start = true;
                        calculateBoidAnimationPosition(aboutLeaveAnimation.boidPosition2,boidAnimationDivisions[0],boidAnimationDivisions[1]);
                        boidTimeRemaining = aboutLeaveAnimation.duration;
                        break;
                    case 'projectsLeaveAnimation':
                        projectsLeaveAnimation.start = true;
                        calculateBoidAnimationPosition(projectsLeaveAnimation.boidPosition2,boidAnimationDivisions[0],boidAnimationDivisions[1]);
                        boidTimeRemaining = projectsLeaveAnimation.duration;
                        break;
                    case 'contactLeaveAnimation':
                        contactLeaveAnimation.start = true;
                        calculateBoidAnimationPosition(contactLeaveAnimation.boidPosition2,boidAnimationDivisions[0],boidAnimationDivisions[1]);
                        boidTimeRemaining = contactLeaveAnimation.duration;
                        break;
                }
                
            }
        }
    }

    for(let i = 0; i < boidCount; i++){
        //move for animation
        if(boids[i].animationPosition.x != undefined && boidTimeRemaining > 0){
            //dir to move
            let dir = [boids[i].animationPosition.x - boids[i].boidGraphic.position.x, boids[i].animationPosition.y - boids[i].boidGraphic.position.y];
            //normalize dir
            let mag = Math.sqrt(Math.pow(dir[0],2) + Math.pow(dir[1],2));
            dir[0] /= mag;
            dir[1] /= mag;
            
            boids[i].boidGraphic.position.x += dir[0] * (mag / boidTimeRemaining) * (delta / 60);
            boids[i].boidGraphic.position.y += dir[1] * (mag / boidTimeRemaining) * (delta / 60);
            continue;
        }

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

    //animations
    currentlyAnimating = false;
    if(introductionAnimation.start){
        currentlyAnimating = true;
        introductionAnimation.durationElapsed += (delta/60);

        document.getElementById("introduction").style.top = String(50 - introductionAnimation.durationElapsed / introductionAnimation.duration * 50) + "%";
        document.getElementById("introduction").style.transform = `translate(-50%, ${-50 + introductionAnimation.durationElapsed / introductionAnimation.duration * 50}%)`;
        
        if(introductionAnimation.durationElapsed >= introductionAnimation.duration){
            document.getElementById("introduction").style.top = "0%";
            document.getElementById("introduction").style.transform = "translate(-50%, 0%)";
            introductionAnimation.start = false;
            introductionAnimation.durationElapsed = 0;
            introductionMoved = true;
        }
    }
    if(aboutEnterAnimation.start){
        currentlyAnimating = true;
        aboutEnterAnimation.durationElapsed += (delta/60);

        document.getElementById("about-section").style.top = String(110 - aboutEnterAnimation.durationElapsed / aboutEnterAnimation.duration * 60) + "%";
        document.getElementById("about-section").style.left = String(50 - aboutEnterAnimation.durationElapsed / aboutEnterAnimation.duration * 45) + "%";
        document.getElementById("about-section").style.transform = `translate(${-50 + aboutEnterAnimation.durationElapsed / aboutEnterAnimation.duration * 50}%, -50%)`;
        if(aboutEnterAnimation.durationElapsed >= aboutEnterAnimation.duration){
            document.getElementById("about-section").style.top = "50%";
            document.getElementById("about-section").style.left = "5%";
            document.getElementById("about-section").style.transform = "translate(0%, -50%)";
            aboutEnterAnimation.start = false;
            aboutEnterAnimation.durationElapsed = 0;
        }
    }
    if(projectsEnterAnimation.start){
        currentlyAnimating = true;
        projectsEnterAnimation.durationElapsed += (delta/60);

        document.getElementById("projects-section").style.top = String(110 - projectsEnterAnimation.durationElapsed / projectsEnterAnimation.duration * 77) + "%";
        document.getElementById("projects-section").style.left = String(50 - projectsEnterAnimation.durationElapsed / projectsEnterAnimation.duration * 50) + "%";
        document.getElementById("projects-section").style.transform = `translate(${-50 + projectsEnterAnimation.durationElapsed / projectsEnterAnimation.duration * 50}%, -50%)`;

        if(projectsEnterAnimation.durationElapsed >= projectsEnterAnimation.duration){
            document.getElementById("projects-section").style.top = "33%";
            document.getElementById("projects-section").style.left = "0%";
            document.getElementById("projects-section").style.transform = "translate(0%, -50%)";
            projectsEnterAnimation.start = false;
            projectsEnterAnimation.durationElapsed = 0;
        }
    }
    if(contactEnterAnimation.start){
        currentlyAnimating = true;
        contactEnterAnimation.durationElapsed += (delta/60);

        document.getElementById("contact-section").style.top = String(110 - contactEnterAnimation.durationElapsed / contactEnterAnimation.duration * 60) + "%";

        if(contactEnterAnimation.durationElapsed >= contactEnterAnimation.duration){
            document.getElementById("contact-section").style.top = "50%";
            contactEnterAnimation.start = false;
            contactEnterAnimation.durationElapsed = 0;
        }
    }

    if(aboutLeaveAnimation.start){
        currentlyAnimating = true;
        aboutLeaveAnimation.durationElapsed += (delta/60);

        document.getElementById("about-section").style.left = String(50 - aboutLeaveAnimation.durationElapsed / aboutLeaveAnimation.duration * 60) + "%";

        if(aboutLeaveAnimation.durationElapsed >= aboutLeaveAnimation.duration){
            document.getElementById("about-section").remove();
            aboutLeaveAnimation.start = false;
            aboutLeaveAnimation.durationElapsed = 0;
        }
    }
    if(projectsLeaveAnimation.start){
        currentlyAnimating = true;
        projectsLeaveAnimation.durationElapsed += (delta/60);

        document.getElementById("projects-section").style.left = String(50 - projectsLeaveAnimation.durationElapsed / projectsLeaveAnimation.duration * 60) + "%";

        if(projectsLeaveAnimation.durationElapsed >= projectsLeaveAnimation.duration){
            document.getElementById("projects-section").remove();
            projectsLeaveAnimation.start = false;
            projectsLeaveAnimation.durationElapsed = 0;
        }
    }
    if(contactLeaveAnimation.start){
        currentlyAnimating = true;
        contactLeaveAnimation.durationElapsed += (delta/60);

        document.getElementById("contact-section").style.left = String(50 - contactLeaveAnimation.durationElapsed / contactLeaveAnimation.duration * 60) + "%";

        if(contactLeaveAnimation.durationElapsed >= contactLeaveAnimation.duration){
            document.getElementById("contact-section").remove();
            contactLeaveAnimation.start = false;
            contactLeaveAnimation.durationElapsed = 0;
        }
    }
}

addEventListener("mousemove", function(e){
   mousePosition.x = e.clientX;
   mousePosition.y = e.clientY;
});

//about section
const about = `
<div id="about-section">
    <h1>About</h1>
    <p>
        Hey there, I'm Nevin Gilday, currently in my final two semesters at The University of Texas at Dallas, 
        working towards my Bachelor of Science in Computer Science, set to graduate in Spring 2024 after 2 years of studying. My journey 
        into computer science began in the 5th grade with website development. Over the years, my interest has evolved, 
        and now I'm deeply involved in programming my own AI and machine learning projects. Beyond the digital realm, 
        I'm a die-hard Liverpool FC supporter, watching soccer has become more of a passion than a pastime for me.
    </p>
</div>`
document.getElementById("about-button").addEventListener('click', function(e) {
    if(currentlyAnimating)
        return;
    if(currentSection == 'about')
        return;
    currentSection = 'about';

    //add about section
    //break out if about section already exists
    if (document.getElementById("about-section") != undefined)
        return;
	let element = document.createElement('div');
	element.innerHTML = about;
    element = element.children[0];
	document.body.appendChild(element);

    //configure points for boids on about animation
    aboutEnterAnimation.boidPosition1 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight * 1.1 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)]
        ]
    ];
    aboutEnterAnimation.boidPosition2 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];
    aboutLeaveAnimation.boidPosition1 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];
    aboutLeaveAnimation.boidPosition2 = [
        [
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth * -.1 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth * -.1 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];

    if(!introductionMoved){
        calculateBoidDensity([introductionAnimation.boidPosition1, aboutEnterAnimation.boidPosition1], .75);
        calculateBoidAnimationPosition(introductionAnimation.boidPosition1,0,boidAnimationDivisions[0]);
        queueAnimationAfterBoid('introductionAnimation');
        boidTimeRemaining = introductionAnimation.boidTime1;

        calculateBoidAnimationPosition(aboutEnterAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
    }else{
        if(document.getElementById('projects-section') != undefined){
            calculateBoidDensity([aboutEnterAnimation.boidPosition1, projectsLeaveAnimation.boidPosition1], .75);
            calculateBoidAnimationPosition(projectsLeaveAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
            queueAnimationAfterBoid('projectsLeaveAnimation');
        }
        else if(document.getElementById('contact-section') != undefined){
            calculateBoidDensity([aboutEnterAnimation.boidPosition1, contactLeaveAnimation.boidPosition1], .75);
            calculateBoidAnimationPosition(contactLeaveAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
            queueAnimationAfterBoid('contactLeaveAnimation');
        }

        calculateBoidAnimationPosition(aboutEnterAnimation.boidPosition1, 0, boidAnimationDivisions[0]);
    }
    //add the animation for enter
    queueAnimationAfterBoid('aboutEnterAnimation');
    boidTimeRemaining = aboutEnterAnimation.boidTime1;
});

//projects sections
const projects = `
<div id="projects-section">
    <h1 id="projects-heading">Projects</h1>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text">Project 1</p>
      </div>
      <div>
        <p class="projects-section-text">Full Stack</p>
      </div>
    </div>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text">Project 1</p>
      </div>
      <div>
        <p class="projects-section-text">Full Stack</p>
      </div>
    </div>
    <hr>
    
</div>`
document.getElementById("projects-button").addEventListener('click', function(e) {
    if(currentlyAnimating)
        return;
    if(currentSection == 'projects')
        return;
    currentSection = 'projects';

    //add projects section
    //break out if projects section already exists
    if (document.getElementById("projects-section") != undefined)
        return;
	let element = document.createElement('div');
	element.innerHTML = projects;
    element = element.children[0];
	document.body.appendChild(element);

    //configure points for boids on projects animation
    projectsEnterAnimation.boidPosition1 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight * 1.1 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)]
        ]
    ];
    projectsEnterAnimation.boidPosition2 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];
    projectsLeaveAnimation.boidPosition1 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];
    projectsLeaveAnimation.boidPosition2 = [
        [
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth * -.1 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth * -.1 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];

    if(!introductionMoved){
        calculateBoidDensity([introductionAnimation.boidPosition1, projectsEnterAnimation.boidPosition1], .75);
        calculateBoidAnimationPosition(introductionAnimation.boidPosition1,0,boidAnimationDivisions[0]);
        queueAnimationAfterBoid('introductionAnimation');
        boidTimeRemaining = introductionAnimation.boidTime1;

        calculateBoidAnimationPosition(projectsEnterAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
    }else{
        if(document.getElementById('about-section') != undefined){
            calculateBoidDensity([projectsEnterAnimation.boidPosition1, aboutLeaveAnimation.boidPosition1], .75);
            calculateBoidAnimationPosition(aboutLeaveAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
            queueAnimationAfterBoid('aboutLeaveAnimation');
        }
        else if(document.getElementById('contact-section') != undefined){
            calculateBoidDensity([projectsEnterAnimation.boidPosition1, contactLeaveAnimation.boidPosition1], .75);
            calculateBoidAnimationPosition(contactLeaveAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
            queueAnimationAfterBoid('contactLeaveAnimation');
        }

        calculateBoidAnimationPosition(projectsEnterAnimation.boidPosition1, 0, boidAnimationDivisions[0]);
    }
    //add the animation for enter
    queueAnimationAfterBoid('projectsEnterAnimation');
    boidTimeRemaining = projectsEnterAnimation.boidTime1;
});

//contact section
const contact = `
<div id="contact-section">
    <h1>Contact</h1>
    <p>some lrandom stuff</p>
</div>`
document.getElementById("contact-button").addEventListener('click', function(e) {
    if(currentlyAnimating)
        return;
    if(currentSection == 'contact')
        return;
    currentSection = 'contact';

    //add contact section
    //break out if contact section already exists
    if (document.getElementById("contact-section") != undefined)
        return;
	let element = document.createElement('div');
	element.innerHTML = contact;
    element = element.children[0];
	document.body.appendChild(element);

    //configure points for boids on contact animation
    contactEnterAnimation.boidPosition1 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight * 1.1 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight * 1.1 + (element.clientHeight / 2)]
        ]
    ];
    contactEnterAnimation.boidPosition2 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];
    contactLeaveAnimation.boidPosition1 = [
        [
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth / 2 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth / 2 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];
    contactLeaveAnimation.boidPosition2 = [
        [
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth * -.1 + (element.clientWidth / 2),window.innerHeight / 2 - (element.clientHeight / 2)],
            [window.innerWidth * -.1 + (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)],
            [window.innerWidth * -.1 - (element.clientWidth / 2),window.innerHeight / 2 + (element.clientHeight / 2)]
        ]
    ];

    if(!introductionMoved){
        calculateBoidDensity([introductionAnimation.boidPosition1, contactEnterAnimation.boidPosition1], .75);
        calculateBoidAnimationPosition(introductionAnimation.boidPosition1,0,boidAnimationDivisions[0]);
        queueAnimationAfterBoid('introductionAnimation');
        boidTimeRemaining = introductionAnimation.boidTime1;

        calculateBoidAnimationPosition(contactEnterAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
    }else{
        if(document.getElementById('projects-section') != undefined){
            calculateBoidDensity([contactEnterAnimation.boidPosition1, projectsLeaveAnimation.boidPosition1], .75);
            calculateBoidAnimationPosition(projectsLeaveAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
            queueAnimationAfterBoid('projectsLeaveAnimation');
        }
        else if(document.getElementById('about-section') != undefined){
            calculateBoidDensity([contactEnterAnimation.boidPosition1, aboutLeaveAnimation.boidPosition1], .75);
            calculateBoidAnimationPosition(aboutLeaveAnimation.boidPosition1, boidAnimationDivisions[0], boidAnimationDivisions[1]);
            queueAnimationAfterBoid('aboutLeaveAnimation');
        }

        calculateBoidAnimationPosition(contactEnterAnimation.boidPosition1, 0, boidAnimationDivisions[0]);
    }
    //add the animation for enter
    queueAnimationAfterBoid('contactEnterAnimation');
    boidTimeRemaining = contactEnterAnimation.boidTime1;
});

function removeBoidAnimationPositions(){
    for(let i = 0;i < boids.length; i++){
        boids[i].animationPosition.x = undefined;
        boids[i].animationPosition.y = undefiend;
    }
}

function calculateBoidAnimationPosition(boidPosition, startBoid, endBoid){
    //[[0,0],[1,0],[2,0]]
    //calculate total line length
    //using all boids position evenly along lines

    //calculate spacing for boids
    let totalPixelLength = 0;
    for(let j = 0; j < boidPosition.length; j++){
        for(let i = 1; i < boidPosition[j].length; i++){
            totalPixelLength += Math.sqrt(Math.pow(boidPosition[j][i][0] - boidPosition[j][i-1][0], 2) + Math.pow(boidPosition[j][i][1] - boidPosition[j][i-1][1], 2));
        }
    }

    const newBoidDist = totalPixelLength / (endBoid - startBoid);
    let currentDist = 0;
    let boidIndex = startBoid;

    //start placing boids
    for(let k = 0; k < boidPosition.length; k++){
        for(let i = 0; i < boidPosition[k].length - 1; i++){
            dir = [boidPosition[k][i + 1][0] - boidPosition[k][i][0], boidPosition[k][i + 1][1] - boidPosition[k][i][1]];
            //normalize dir
            const mag = Math.sqrt(Math.pow(dir[0],2) + Math.pow(dir[1],2));
            dir[0] /= mag;
            dir[1] /= mag;
            
            //place boids
            while(currentDist <= mag && boidIndex < endBoid){
                boids[boidIndex].animationPosition.x = boidPosition[k][i][0] + currentDist * dir[0];
                boids[boidIndex].animationPosition.y = boidPosition[k][i][1] + currentDist * dir[1];
                currentDist += newBoidDist;
                boidIndex++;
            }
            currentDist = currentDist - mag;
        }
    }
}

function queueAnimationAfterBoid(s){
    animationsQueuedAfterBoids.push(s);
}

function distance(boidA, boidB){
    return Math.sqrt(Math.pow((boidA.boidGraphic.position.x - boidB.boidGraphic.position.x),2) + Math.pow((boidA.boidGraphic.position.y - boidB.boidGraphic.position.y),2));
}

function normalizeDirection(boid){
    const magnitiude = Math.sqrt(boid.direction.x * boid.direction.x + boid.direction.y * boid.direction.y)
    boid.direction.x /= magnitiude;
    boid.direction.y /= magnitiude;
}

function calculateBoidDensity(boidPositions, percentOfBoids){
    boidAnimationDivisions = [];
     //calculate spacing for boids

     let otherPixelLength = 0;
     let currentLength = 0

    for(let j = 0; j < boidPositions.length; j++){
        currentLength = 0;
        for(let k = 0; k < boidPositions[j].length; k++){
            for(let i = 1; i < boidPositions[j][k].length; i++){
                currentLength += Math.sqrt(Math.pow(boidPositions[j][k][i][0] - boidPositions[j][k][i-1][0], 2) + Math.pow(boidPositions[j][k][i][1] - boidPositions[j][k][i-1][1], 2));
                otherPixelLength += Math.sqrt(Math.pow(boidPositions[j][k][i][0] - boidPositions[j][k][i-1][0], 2) + Math.pow(boidPositions[j][k][i][1] - boidPositions[j][k][i-1][1], 2));
            }
        }
        boidAnimationDivisions.push(currentLength);
    }
     
     
    for(let i = 0; i < boidAnimationDivisions.length; i++){
        boidAnimationDivisions[i] /= otherPixelLength;
        boidAnimationDivisions[i] *= boidCount * percentOfBoids;
        boidAnimationDivisions[i] = Math.floor(boidAnimationDivisions[i]);
        if(i > 0){
            boidAnimationDivisions[i] += boidAnimationDivisions[i-1];
        }
        if(i + 1 >= boidAnimationDivisions.length){
            boidAnimationDivisions[i] = Math.floor(boidCount * percentOfBoids);
        }
    }
}




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
let selectedProject = 0;
let boidImages;

const introductionDiv = document.getElementById('introduction');
let introductionAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,

    boidTime1: 1,
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
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),introductionDiv.clientHeight],
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),0],
            [window.innerWidth / 2 + (introductionDiv.clientWidth / 2),0],
            [window.innerWidth / 2 + (introductionDiv.clientWidth / 2),introductionDiv.clientHeight],
            [window.innerWidth / 2 - (introductionDiv.clientWidth / 2),introductionDiv.clientHeight]
        ],
    ],
}
let aboutEnterAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,
    boidTime1: 1,
};
let aboutLeaveAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,
};
let projectsEnterAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,
    boidTime1: 1,
};
let projectsLeaveAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,
};
let contactEnterAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,
    boidTime1: 1,
};
let contactLeaveAnimation = {
    start: false,
    duration: 2,
    durationElapsed: 0,
};

const Graphics = PIXI.Graphics;

const boidCount = Math.floor((window.innerHeight * window.innerWidth) * .0003);
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

        //stop if boid froze
        if(boids[i].freeze != undefined && boids[i].freeze)
            continue;

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

        document.getElementById("about-section").style.right = String(100 - aboutEnterAnimation.durationElapsed / aboutEnterAnimation.duration * 45) + "%";
        if(aboutEnterAnimation.durationElapsed >= aboutEnterAnimation.duration){
            document.getElementById("about-section").style.right = "55%";
            aboutEnterAnimation.start = false;
            aboutEnterAnimation.durationElapsed = 0;
        }
    }
    if(projectsEnterAnimation.start){
        currentlyAnimating = true;
        projectsEnterAnimation.durationElapsed += (delta/60);

        document.getElementById("projects-section").style.right = String(100 - projectsEnterAnimation.durationElapsed / projectsEnterAnimation.duration * 32.5) + "%";
        document.getElementById("current-project").style.left = String(100 - projectsEnterAnimation.durationElapsed / projectsEnterAnimation.duration * 62.5) + "%";


        if(projectsEnterAnimation.durationElapsed >= projectsEnterAnimation.duration){
            document.getElementById("projects-section").style.right = "67.5%";
            document.getElementById("current-project").style.left = "37.5%";

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

        document.getElementById("about-section").style.top = String(50 - aboutLeaveAnimation.durationElapsed / aboutLeaveAnimation.duration * 50) + "%";
        document.getElementById("about-section").style.transform = `translate(0%, ${-50 - aboutLeaveAnimation.durationElapsed / aboutLeaveAnimation.duration * 50}%)`;

        if(aboutLeaveAnimation.durationElapsed >= aboutLeaveAnimation.duration){
            document.getElementById("about-section").remove();
            aboutLeaveAnimation.start = false;
            aboutLeaveAnimation.durationElapsed = 0;
        }
    }
    if(projectsLeaveAnimation.start){
        currentlyAnimating = true;
        projectsLeaveAnimation.durationElapsed += (delta/60);

        document.getElementById("projects-section").style.top = String(20 - projectsLeaveAnimation.durationElapsed / projectsLeaveAnimation.duration * 20) + "%";
        document.getElementById("projects-section").style.transform = `translate(0%, ${projectsLeaveAnimation.durationElapsed / projectsLeaveAnimation.duration * -100}%)`;

        document.getElementById("current-project").style.top = String(20 + projectsLeaveAnimation.durationElapsed / projectsLeaveAnimation.duration * 80) + "%";

        if(projectsLeaveAnimation.durationElapsed >= projectsLeaveAnimation.duration){
            document.getElementById("projects-section").remove();
            document.getElementById("current-project").remove();
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
        Hey there, I'm <a class="animation-button" onmouseover="boidImage('headshot')" onmouseleave="stopBoidImage()">Nevin Gilday</a>,
        currently in my final two semesters at 
        <a class="animation-button" onmouseover="boidImage('utd')" onmouseleave="stopBoidImage()">The University of Texas at Dallas</a>, 
        working towards my Bachelor of Science in Computer Science, set to graduate in Spring 2024 after 2 years of studying. My journey 
        into computer science began in the 5th grade with website development. Over the years, my interest has evolved, 
        and now I'm deeply involved in programming my own AI and machine learning projects. Beyond the digital realm, 
        I'm a die-hard <a class="animation-button" onmouseover="boidImage('liverpool')" onmouseleave="stopBoidImage()">Liverpool FC</a> supporter, 
        watching soccer has become more of a passion than a pastime for me.
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
            [window.innerWidth / 10 * -2 - (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)],
            [window.innerWidth / 10 * -2 - (element.clientWidth / 2),window.innerHeight * .5 - (element.clientHeight / 2)],
            [window.innerWidth / 10 * -2 + (element.clientWidth / 2),window.innerHeight * .5 - (element.clientHeight / 2)],
            [window.innerWidth / 10 * -2 + (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)],
            [window.innerWidth / 10 * -2 - (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)]
        ]
    ];
    aboutEnterAnimation.boidPosition2 = [
        [
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),window.innerHeight * .5 - (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 + (element.clientWidth / 2),window.innerHeight * .5 - (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 + (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)]
        ]
    ];
    aboutLeaveAnimation.boidPosition1 = [
        [
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),window.innerHeight * .5 - (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 + (element.clientWidth / 2),window.innerHeight * .5 - (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 + (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)],
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),window.innerHeight * .5 + (element.clientHeight / 2)]
        ]
    ];
    aboutLeaveAnimation.boidPosition2 = [
        [
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),0],
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),-element.clientHeight],
            [window.innerWidth / 10 * 2.5 + (element.clientWidth / 2),-element.clientHeight],
            [window.innerWidth / 10 * 2.5 + (element.clientWidth / 2),0],
            [window.innerWidth / 10 * 2.5 - (element.clientWidth / 2),0]
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
const projectSection = `
<div id="projects-section">
    <h1 id="projects-heading">Projects</h1>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(0)">Abstract Art Generator</a></p>
      </div>
      <div>
        <p class="projects-type-text">AI/ML</p>
      </div>
    </div>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(1)">Bill Predictor</a></p>
      </div>
      <div>
        <p class="projects-type-text">AI/ML</p>
      </div>
    </div>
    <hr>
    
    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(2)">Poker</a></p>
      </div>
      <div>
        <p class="projects-type-text">Full Stack</p>
      </div>
    </div>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(3)">Mock Quizlet</a></p>
      </div>
      <div>
        <p class="projects-type-text">Full Stack</p>
      </div>
    </div>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(4)">March Madness</a></p>
      </div>
      <div>
        <p class="projects-type-text">Full Stack</p>
      </div>
    </div>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(5)">Coding Typing Test</a></p>
      </div>
      <div>
        <p class="projects-type-text">Front End</p>
      </div>
    </div>
    <hr>

    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(6)">Ishihara Plate Generator</a></p>
      </div>
      <div>
        <p class="projects-type-text">Front End</p>
      </div>
    </div>
    <hr>
    
    <div class="project-container">
      <div>
        <p class="projects-section-text"><a href="#" onclick="selectProject(7)">Unity Games</a></p>
      </div>
      <div>
        <p class="projects-type-text">Game Development</p>
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
	element.innerHTML = projectSection;
    element = element.children[0];
	document.body.appendChild(element);

    let element2 = document.createElement('div');
	element2.innerHTML = projects[selectedProject];
    element2 = element2.children[0];
	document.body.appendChild(element2);

    //configure points for boids on projects animation
    projectsEnterAnimation.boidPosition1 = [
        [
            [-element.clientWidth,window.innerHeight * .2 + element.clientHeight],
            [-element.clientWidth,window.innerHeight * .2],
            [0,window.innerHeight * .2],
            [0,window.innerHeight * .2 + element.clientHeight],
            [-element.clientWidth,window.innerHeight * .2 + element.clientHeight]
        ],
        [
            [window.innerWidth,window.innerHeight * .2 + element2.clientHeight],
            [window.innerWidth,window.innerHeight * .2],
            [window.innerWidth + element2.clientWidth,window.innerHeight * .2],
            [window.innerWidth + element2.clientWidth,window.innerHeight * .2 + element2.clientHeight],
            [window.innerWidth,window.innerHeight * .2 + element2.clientHeight]
        ]
    ];
    projectsEnterAnimation.boidPosition2 = [
        [
            [window.innerWidth * 0.025,window.innerHeight * .2 + element.clientHeight],
            [window.innerWidth * 0.025,window.innerHeight * .2],
            [window.innerWidth * 0.025 + element.clientWidth,window.innerHeight * .2],
            [window.innerWidth * 0.025 + element.clientWidth,window.innerHeight * .2 + element.clientHeight],
            [window.innerWidth * 0.025,window.innerHeight * .2 + element.clientHeight]
        ],
        [
            [window.innerWidth * .375,window.innerHeight * .2 + element2.clientHeight],
            [window.innerWidth * .375,window.innerHeight * .2],
            [window.innerWidth * .375 + element2.clientWidth,window.innerHeight * .2],
            [window.innerWidth * .375 + element2.clientWidth,window.innerHeight * .2 + element2.clientHeight],
            [window.innerWidth * .375,window.innerHeight * .2 + element2.clientHeight]
        ]
    ];
    projectsLeaveAnimation.boidPosition1 = [
        [
            [window.innerWidth * 0.025,window.innerHeight * .2 + element.clientHeight],
            [window.innerWidth * 0.025,window.innerHeight * .2],
            [window.innerWidth * 0.025 + element.clientWidth,window.innerHeight * .2],
            [window.innerWidth * 0.025 + element.clientWidth,window.innerHeight * .2 + element.clientHeight],
            [window.innerWidth * 0.025,window.innerHeight * .2 + element.clientHeight]
        ],
        [
            [window.innerWidth * .375,window.innerHeight * .2 + element2.clientHeight],
            [window.innerWidth * .375,window.innerHeight * .2],
            [window.innerWidth * .375 + element2.clientWidth,window.innerHeight * .2],
            [window.innerWidth * .375 + element2.clientWidth,window.innerHeight * .2 + element2.clientHeight],
            [window.innerWidth * .375,window.innerHeight * .2 + element2.clientHeight]
        ]
    ];
    projectsLeaveAnimation.boidPosition2 = [
        [
            [window.innerWidth * 0.025, 0],
            [window.innerWidth * 0.025, -element.clientHeight],
            [window.innerWidth * 0.025 + element.clientWidth, -element.clientHeight],
            [window.innerWidth * 0.025 + element.clientWidth, 0],
            [window.innerWidth * 0.025, 0]
        ],
        [
            [window.innerWidth * .375,window.innerHeight + element2.clientHeight],
            [window.innerWidth * .375,window.innerHeight],
            [window.innerWidth * .375 + element2.clientWidth,window.innerHeight],
            [window.innerWidth * .375 + element2.clientWidth,window.innerHeight + element2.clientHeight],
            [window.innerWidth * .375,window.innerHeight + element2.clientHeight]
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
    <p>Email: nevingilday@gmail.com | nevin.gilday@utdallas.edu</p>
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

function calculateBoidAnimationPosition(boidPosition, startBoid, endBoid, freeze = false){
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
                if(freeze)
                    boids[boidIndex].freeze = true;
                currentDist += newBoidDist;
                boidIndex++;
            }
            currentDist = currentDist - mag;
        }
    }
}

function selectProject(i){
    selectedProject = i;

    element = document.createElement('div');
	element.innerHTML = projects[selectedProject];
    element = element.children[0];
	document.getElementById("current-project").innerHTML = element.innerHTML;
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

function stopBoidImage(){
    for(let i = 0;i < boidCount; i++){
        boids[i].freeze = false;
    }
}

function boidImage(image){
    switch(image){
        case "headshot":
            calculateBoidDensity([boidImages.headshot.boidPosition], .75);
            calculateBoidAnimationPosition(boidImages.headshot.boidPosition, 0, boidAnimationDivisions[0], true);
            boidTimeRemaining = 1;
        break;

        case "utd":
            calculateBoidDensity([boidImages.utd.boidPosition], .75);
            calculateBoidAnimationPosition(boidImages.utd.boidPosition, 0, boidAnimationDivisions[0], true);
            boidTimeRemaining = 1;
        break;

        case "liverpool":
            calculateBoidDensity([boidImages.liverpool.boidPosition], .75);
            calculateBoidAnimationPosition(boidImages.liverpool.boidPosition, 0, boidAnimationDivisions[0], true);
            boidTimeRemaining = 1;
        break;
    }
}
//WHAT I DO TO START THE ANIMATION WHEN DETECTED
// calculateBoidDensity([boidImages.headshot.boidPosition], .75);
// calculateBoidAnimationPosition(boidImages.headshot.boidPosition, 0, boidAnimationDivisions[0], true);
// boidTimeRemaining = 1;
let width;
let height;
width = window.innerWidth * .4;
height = window.innerWidth * .4 * 0.7452471482889734;
anchor = [window.innerWidth * .55, window.innerHeight / 2 - height / 2];

boidImages = {
    headshot: {
        width: window.innerWidth / 4,
        height: window.innerWidth / 4 * this.aspectRatio,
        aspectRatio: 0.7452471482889734,
        boidPosition:
            [
                [
                    [anchor[0] + width * 0.46683673469387754, anchor[1] + height * 0.9942965779467681],
                    [anchor[0] + width * 0.375, anchor[1] + height * 0.9714828897338403],
                    [anchor[0] + width * 0.30612244897959184, anchor[1] + height * 0.9315589353612167],
                    [anchor[0] + width * 0.21173469387755103, anchor[1] + height * 0.8878326996197718],
                    [anchor[0] + width * 0.14795918367346939, anchor[1] + height * 0.8174904942965779],
                    [anchor[0] + width * 0.12244897959183673, anchor[1] + height * 0.7110266159695817],
                    [anchor[0] + width * 0.04846938775510204, anchor[1] + height * 0.6634980988593155],
                    [anchor[0] + width * 0.03571428571428571, anchor[1] + height * 0.5950570342205324],
                    [anchor[0] + width * 0.03826530612244898, anchor[1] + height * 0.5399239543726235],
                    [anchor[0] + width * 0.061224489795918366, anchor[1] + height * 0.5019011406844106],
                    [anchor[0] + width * 0.09693877551020408, anchor[1] + height * 0.5057034220532319],
                    [anchor[0] + width * 0.09948979591836735, anchor[1] + height * 0.4296577946768061],
                    [anchor[0] + width * 0.08163265306122448, anchor[1] + height * 0.3840304182509506],
                    [anchor[0] + width * 0.08928571428571429, anchor[1] + height * 0.2737642585551331],
                    [anchor[0] + width * 0.11224489795918367, anchor[1] + height * 0.2224334600760456],
                    [anchor[0] + width * 0.16326530612244897, anchor[1] + height * 0.16730038022813687],
                    [anchor[0] + width * 0.22448979591836735, anchor[1] + height * 0.1311787072243346],
                    [anchor[0] + width * 0.2755102040816326, anchor[1] + height * 0.10456273764258556],
                    [anchor[0] + width * 0.32142857142857145, anchor[1] + height * 0.0817490494296578],
                    [anchor[0] + width * 0.3903061224489796, anchor[1] + height * 0.053231939163498096],
                    [anchor[0] + width * 0.4387755102040816, anchor[1] + height * 0.04182509505703422],
                    [anchor[0] + width * 0.5, anchor[1] + height * 0.034220532319391636],
                    [anchor[0] + width * 0.5586734693877551, anchor[1] + height * 0.03612167300380228],
                    [anchor[0] + width * 0.6147959183673469, anchor[1] + height * 0.04182509505703422],
                    [anchor[0] + width * 0.6862244897959183, anchor[1] + height * 0.055133079847908745],
                    [anchor[0] + width * 0.7295918367346939, anchor[1] + height * 0.07604562737642585],
                    [anchor[0] + width * 0.7755102040816326, anchor[1] + height * 0.08555133079847908],
                    [anchor[0] + width * 0.8367346938775511, anchor[1] + height * 0.11026615969581749],
                    [anchor[0] + width * 0.8928571428571429, anchor[1] + height * 0.14638783269961977],
                    [anchor[0] + width * 0.9336734693877551, anchor[1] + height * 0.1920152091254753],
                    [anchor[0] + width * 0.951530612244898, anchor[1] + height * 0.2414448669201521],
                    [anchor[0] + width * 0.9617346938775511, anchor[1] + height * 0.2889733840304182],
                    [anchor[0] + width * 0.9719387755102041, anchor[1] + height * 0.35361216730038025],
                    [anchor[0] + width * 0.9719387755102041, anchor[1] + height * 0.3821292775665399],
                    [anchor[0] + width * 0.9591836734693877, anchor[1] + height * 0.42395437262357416],
                    [anchor[0] + width * 0.9438775510204082, anchor[1] + height * 0.467680608365019],
                    [anchor[0] + width * 0.9336734693877551, anchor[1] + height * 0.5],
                    [anchor[0] + width * 0.9362244897959183, anchor[1] + height * 0.526615969581749],
                    [anchor[0] + width * 0.9719387755102041, anchor[1] + height * 0.5361216730038023],
                    [anchor[0] + width * 0.9821428571428571, anchor[1] + height * 0.5798479087452472],
                    [anchor[0] + width * 0.9821428571428571, anchor[1] + height * 0.6197718631178707],
                    [anchor[0] + width * 0.9744897959183674, anchor[1] + height * 0.655893536121673],
                    [anchor[0] + width * 0.9642857142857143, anchor[1] + height * 0.6958174904942965],
                    [anchor[0] + width * 0.9311224489795918, anchor[1] + height * 0.7167300380228137],
                    [anchor[0] + width * 0.8979591836734694, anchor[1] + height * 0.7357414448669202],
                    [anchor[0] + width * 0.8647959183673469, anchor[1] + height * 0.7452471482889734],
                    [anchor[0] + width * 0.8698979591836735, anchor[1] + height * 0.7775665399239544],
                    [anchor[0] + width * 0.8571428571428571, anchor[1] + height * 0.8174904942965779],
                    [anchor[0] + width * 0.8316326530612245, anchor[1] + height * 0.8479087452471483],
                    [anchor[0] + width * 0.7933673469387755, anchor[1] + height * 0.8821292775665399],
                    [anchor[0] + width * 0.7551020408163265, anchor[1] + height * 0.908745247148289],
                    [anchor[0] + width * 0.7066326530612245, anchor[1] + height * 0.9334600760456274],
                    [anchor[0] + width * 0.6632653061224489, anchor[1] + height * 0.9581749049429658],
                    [anchor[0] + width * 0.6045918367346939, anchor[1] + height * 0.9904942965779467],
                    [anchor[0] + width * 0.5331632653061225, anchor[1] + height * 0.9980988593155894],
                    [anchor[0] + width * 0.461734693877551, anchor[1] + height * 0.9885931558935361],
                ],
                [
                    [anchor[0] + width * 0.18877551020408162, anchor[1] + height * 0.4448669201520912],
                    [anchor[0] + width * 0.22448979591836735, anchor[1] + height * 0.43155893536121676],
                    [anchor[0] + width * 0.25255102040816324, anchor[1] + height * 0.42395437262357416],
                    [anchor[0] + width * 0.30357142857142855, anchor[1] + height * 0.4220532319391635],
                    [anchor[0] + width * 0.3392857142857143, anchor[1] + height * 0.4220532319391635],
                    [anchor[0] + width * 0.37755102040816324, anchor[1] + height * 0.4296577946768061],
                    [anchor[0] + width * 0.40816326530612246, anchor[1] + height * 0.435361216730038],
                    [anchor[0] + width * 0.42857142857142855, anchor[1] + height * 0.4391634980988593],
                ],
                [
                    [anchor[0] + width * 0.6173469387755102, anchor[1] + height * 0.4296577946768061],
                    [anchor[0] + width * 0.6836734693877551, anchor[1] + height * 0.43346007604562736],
                    [anchor[0] + width * 0.7244897959183674, anchor[1] + height * 0.43346007604562736],
                    [anchor[0] + width * 0.7678571428571429, anchor[1] + height * 0.43155893536121676],
                    [anchor[0] + width * 0.7933673469387755, anchor[1] + height * 0.43155893536121676],
                    [anchor[0] + width * 0.8341836734693877, anchor[1] + height * 0.4372623574144487],
                    [anchor[0] + width * 0.8673469387755102, anchor[1] + height * 0.45817490494296575],
                    [anchor[0] + width * 0.8775510204081632, anchor[1] + height * 0.4695817490494297],
                ],
                [
                    [anchor[0] + width * 0.3469387755102041, anchor[1] + height * 0.7642585551330798],
                    [anchor[0] + width * 0.3903061224489796, anchor[1] + height * 0.7623574144486692],
                    [anchor[0] + width * 0.4413265306122449, anchor[1] + height * 0.7623574144486692],
                    [anchor[0] + width * 0.4897959183673469, anchor[1] + height * 0.7604562737642585],
                    [anchor[0] + width * 0.5586734693877551, anchor[1] + height * 0.7604562737642585],
                    [anchor[0] + width * 0.6122448979591837, anchor[1] + height * 0.7585551330798479],
                    [anchor[0] + width * 0.6556122448979592, anchor[1] + height * 0.7585551330798479],
                    [anchor[0] + width * 0.6989795918367347, anchor[1] + height * 0.7585551330798479],
                    [anchor[0] + width * 0.7091836734693877, anchor[1] + height * 0.7699619771863118],
                    [anchor[0] + width * 0.673469387755102, anchor[1] + height * 0.785171102661597],
                    [anchor[0] + width * 0.625, anchor[1] + height * 0.7984790874524715],
                    [anchor[0] + width * 0.5918367346938775, anchor[1] + height * 0.8060836501901141],
                    [anchor[0] + width * 0.5561224489795918, anchor[1] + height * 0.8098859315589354],
                    [anchor[0] + width * 0.5127551020408163, anchor[1] + height * 0.811787072243346],
                    [anchor[0] + width * 0.46683673469387754, anchor[1] + height * 0.8079847908745247],
                    [anchor[0] + width * 0.4260204081632653, anchor[1] + height * 0.7984790874524715],
                    [anchor[0] + width * 0.39540816326530615, anchor[1] + height * 0.7889733840304183],
                    [anchor[0] + width * 0.3520408163265306, anchor[1] + height * 0.7737642585551331],
                    [anchor[0] + width * 0.34438775510204084, anchor[1] + height * 0.7623574144486692],
                ],
                [
                    [anchor[0] + width * 0.5714285714285714, anchor[1] + height * 0.5247148288973384],
                    [anchor[0] + width * 0.576530612244898, anchor[1] + height * 0.5513307984790875],
                    [anchor[0] + width * 0.5790816326530612, anchor[1] + height * 0.5817490494296578],
                    [anchor[0] + width * 0.6071428571428571, anchor[1] + height * 0.6159695817490495],
                    [anchor[0] + width * 0.6275510204081632, anchor[1] + height * 0.6273764258555133],
                    [anchor[0] + width * 0.6377551020408163, anchor[1] + height * 0.6482889733840305],
                    [anchor[0] + width * 0.6326530612244898, anchor[1] + height * 0.6711026615969582],
                ],
                [
                    [anchor[0] + width * 0.4897959183673469, anchor[1] + height * 0.5095057034220533],
                    [anchor[0] + width * 0.47959183673469385, anchor[1] + height * 0.5456273764258555],
                    [anchor[0] + width * 0.46938775510204084, anchor[1] + height * 0.5741444866920152],
                    [anchor[0] + width * 0.44387755102040816, anchor[1] + height * 0.591254752851711],
                    [anchor[0] + width * 0.4107142857142857, anchor[1] + height * 0.6140684410646388],
                    [anchor[0] + width * 0.4030612244897959, anchor[1] + height * 0.6311787072243346],
                    [anchor[0] + width * 0.413265306122449, anchor[1] + height * 0.6673003802281369],
                    [anchor[0] + width * 0.42857142857142855, anchor[1] + height * 0.6749049429657795],
                ],
                [
                    [anchor[0] + width * 0.4770408163265306, anchor[1] + height * 0.6749049429657795],
                    [anchor[0] + width * 0.49489795918367346, anchor[1] + height * 0.688212927756654],
                    [anchor[0] + width * 0.5102040816326531, anchor[1] + height * 0.688212927756654],
                    [anchor[0] + width * 0.5408163265306123, anchor[1] + height * 0.6901140684410646],
                    [anchor[0] + width * 0.5561224489795918, anchor[1] + height * 0.688212927756654],
                    [anchor[0] + width * 0.5714285714285714, anchor[1] + height * 0.6711026615969582],
                ],
                [
                    [anchor[0] + width * 0.11479591836734694, anchor[1] + height * 0.4923954372623574],
                    [anchor[0] + width * 0.11989795918367346, anchor[1] + height * 0.4600760456273764],
                    [anchor[0] + width * 0.13010204081632654, anchor[1] + height * 0.4372623574144487],
                    [anchor[0] + width * 0.14030612244897958, anchor[1] + height * 0.4049429657794677],
                    [anchor[0] + width * 0.14030612244897958, anchor[1] + height * 0.3669201520912547],
                    [anchor[0] + width * 0.15051020408163265, anchor[1] + height * 0.3288973384030418],
                    [anchor[0] + width * 0.1556122448979592, anchor[1] + height * 0.2870722433460076],
                    [anchor[0] + width * 0.17091836734693877, anchor[1] + height * 0.2585551330798479],
                    [anchor[0] + width * 0.22704081632653061, anchor[1] + height * 0.25665399239543724],
                    [anchor[0] + width * 0.25255102040816324, anchor[1] + height * 0.25665399239543724],
                    [anchor[0] + width * 0.3163265306122449, anchor[1] + height * 0.26045627376425856],
                    [anchor[0] + width * 0.3520408163265306, anchor[1] + height * 0.2623574144486692],
                    [anchor[0] + width * 0.40816326530612246, anchor[1] + height * 0.2661596958174905],
                    [anchor[0] + width * 0.4336734693877551, anchor[1] + height * 0.2661596958174905],
                    [anchor[0] + width * 0.46683673469387754, anchor[1] + height * 0.2661596958174905],
                    [anchor[0] + width * 0.5229591836734694, anchor[1] + height * 0.26425855513307983],
                    [anchor[0] + width * 0.576530612244898, anchor[1] + height * 0.2623574144486692],
                    [anchor[0] + width * 0.6096938775510204, anchor[1] + height * 0.2623574144486692],
                    [anchor[0] + width * 0.6683673469387755, anchor[1] + height * 0.2623574144486692],
                    [anchor[0] + width * 0.7270408163265306, anchor[1] + height * 0.26806083650190116],
                    [anchor[0] + width * 0.826530612244898, anchor[1] + height * 0.2718631178707224],
                    [anchor[0] + width * 0.8647959183673469, anchor[1] + height * 0.2718631178707224],
                    [anchor[0] + width * 0.9005102040816326, anchor[1] + height * 0.27756653992395436],
                    [anchor[0] + width * 0.9081632653061225, anchor[1] + height * 0.3403041825095057],
                    [anchor[0] + width * 0.9005102040816326, anchor[1] + height * 0.38593155893536124],
                    [anchor[0] + width * 0.9056122448979592, anchor[1] + height * 0.4296577946768061],
                    [anchor[0] + width * 0.9413265306122449, anchor[1] + height * 0.47718631178707227],
                    [anchor[0] + width * 0.9311224489795918, anchor[1] + height * 0.5],
                ],
                [
                    [anchor[0] + width * 0.10459183673469388, anchor[1] + height * 0.6444866920152091],
                    [anchor[0] + width * 0.09948979591836735, anchor[1] + height * 0.6444866920152091],
                    [anchor[0] + width * 0.08673469387755102, anchor[1] + height * 0.6197718631178707],
                    [anchor[0] + width * 0.08163265306122448, anchor[1] + height * 0.6045627376425855],
                    [anchor[0] + width * 0.08163265306122448, anchor[1] + height * 0.5950570342205324],
                    [anchor[0] + width * 0.08673469387755102, anchor[1] + height * 0.5760456273764258],
                    [anchor[0] + width * 0.09693877551020408, anchor[1] + height * 0.5608365019011406],
                ],
                [
                    [anchor[0] + width * 0.9081632653061225, anchor[1] + height * 0.6653992395437263],
                    [anchor[0] + width * 0.9311224489795918, anchor[1] + height * 0.6596958174904943],
                    [anchor[0] + width * 0.9438775510204082, anchor[1] + height * 0.6463878326996197],
                    [anchor[0] + width * 0.9413265306122449, anchor[1] + height * 0.6197718631178707],
                    [anchor[0] + width * 0.9311224489795918, anchor[1] + height * 0.596958174904943],
                    [anchor[0] + width * 0.9260204081632653, anchor[1] + height * 0.5703422053231939],
                ],
                [
                    [anchor[0] + width * 0.7474489795918368, anchor[1] + height * 0.7034220532319392],
                    [anchor[0] + width * 0.7576530612244898, anchor[1] + height * 0.7110266159695817],
                    [anchor[0] + width * 0.7653061224489796, anchor[1] + height * 0.7243346007604563],
                    [anchor[0] + width * 0.7729591836734694, anchor[1] + height * 0.7490494296577946],
                    [anchor[0] + width * 0.7729591836734694, anchor[1] + height * 0.7623574144486692],
                    [anchor[0] + width * 0.7551020408163265, anchor[1] + height * 0.779467680608365],
                ],
                [
                    [anchor[0] + width * 0.09183673469387756, anchor[1] + height * 0.38022813688212925],
                    [anchor[0] + width * 0.12244897959183673, anchor[1] + height * 0.37832699619771865],
                ],
                [
                    [anchor[0] + width * 0.09693877551020408, anchor[1] + height * 0.32129277566539927],
                    [anchor[0] + width * 0.125, anchor[1] + height * 0.3269961977186312],
                ],
                [
                    [anchor[0] + width * 0.11734693877551021, anchor[1] + height * 0.22813688212927757],
                    [anchor[0] + width * 0.9311224489795918, anchor[1] + height * 0.2414448669201521],
                ],
                [
                    [anchor[0] + width * 0.16326530612244897, anchor[1] + height * 0.1920152091254753],
                    [anchor[0] + width * 0.9056122448979592, anchor[1] + height * 0.19391634980988592],
                ],
                [
                    [anchor[0] + width * 0.2372448979591837, anchor[1] + height * 0.1444866920152091],
                    [anchor[0] + width * 0.8571428571428571, anchor[1] + height * 0.14068441064638784],
                ],
                [
                    [anchor[0] + width * 0.32908163265306123, anchor[1] + height * 0.10076045627376426],
                    [anchor[0] + width * 0.7729591836734694, anchor[1] + height * 0.10266159695817491],
                ],
                [
                    [anchor[0] + width * 0.46683673469387754, anchor[1] + height * 0.06463878326996197],
                    [anchor[0] + width * 0.6198979591836735, anchor[1] + height * 0.057034220532319393],
                ],
            ]
    },
    utd: {
        aspectRatio: 1.3350515463917525,
        boidPosition:
            [
                [
                    [anchor[0] + width * 0.4980694980694981, anchor[1] + height * 0.9432989690721649],
                    [anchor[0] + width * 0.42084942084942084, anchor[1] + height * 0.9278350515463918],
                    [anchor[0] + width * 0.33976833976833976, anchor[1] + height * 0.8865979381443299],
                    [anchor[0] + width * 0.25096525096525096, anchor[1] + height * 0.8092783505154639],
                    [anchor[0] + width * 0.20077220077220076, anchor[1] + height * 0.6958762886597938],
                    [anchor[0] + width * 0.16988416988416988, anchor[1] + height * 0.5927835051546392],
                    [anchor[0] + width * 0.16602316602316602, anchor[1] + height * 0.4536082474226804],
                    [anchor[0] + width * 0.18146718146718147, anchor[1] + height * 0.32989690721649484],
                    [anchor[0] + width * 0.21621621621621623, anchor[1] + height * 0.25257731958762886],
                    [anchor[0] + width * 0.26640926640926643, anchor[1] + height * 0.18041237113402062],
                    [anchor[0] + width * 0.33976833976833976, anchor[1] + height * 0.1134020618556701],
                    [anchor[0] + width * 0.42084942084942084, anchor[1] + height * 0.07216494845360824],
                    [anchor[0] + width * 0.5057915057915058, anchor[1] + height * 0.05670103092783505],
                    [anchor[0] + width * 0.5752895752895753, anchor[1] + height * 0.05670103092783505],
                    [anchor[0] + width * 0.640926640926641, anchor[1] + height * 0.08762886597938144],
                    [anchor[0] + width * 0.7027027027027027, anchor[1] + height * 0.15463917525773196],
                    [anchor[0] + width * 0.752895752895753, anchor[1] + height * 0.20103092783505155],
                    [anchor[0] + width * 0.7876447876447876, anchor[1] + height * 0.27835051546391754],
                    [anchor[0] + width * 0.8146718146718147, anchor[1] + height * 0.35051546391752575],
                    [anchor[0] + width * 0.8223938223938224, anchor[1] + height * 0.4484536082474227],
                    [anchor[0] + width * 0.8301158301158301, anchor[1] + height * 0.5360824742268041],
                    [anchor[0] + width * 0.8223938223938224, anchor[1] + height * 0.6237113402061856],
                    [anchor[0] + width * 0.7992277992277992, anchor[1] + height * 0.7061855670103093],
                    [anchor[0] + width * 0.7760617760617761, anchor[1] + height * 0.7577319587628866],
                    [anchor[0] + width * 0.7374517374517374, anchor[1] + height * 0.7989690721649485],
                    [anchor[0] + width * 0.694980694980695, anchor[1] + height * 0.8556701030927835],
                    [anchor[0] + width * 0.6525096525096525, anchor[1] + height * 0.8814432989690721],
                    [anchor[0] + width * 0.6023166023166023, anchor[1] + height * 0.9175257731958762],
                    [anchor[0] + width * 0.5212355212355212, anchor[1] + height * 0.9432989690721649],
                ],
                [
                    [anchor[0] + width * 0.26640926640926643, anchor[1] + height * 0.32989690721649484],
                    [anchor[0] + width * 0.26640926640926643, anchor[1] + height * 0.3711340206185567],
                    [anchor[0] + width * 0.26640926640926643, anchor[1] + height * 0.4329896907216495],
                    [anchor[0] + width * 0.2625482625482625, anchor[1] + height * 0.4845360824742268],
                    [anchor[0] + width * 0.25868725868725867, anchor[1] + height * 0.5360824742268041],
                    [anchor[0] + width * 0.25868725868725867, anchor[1] + height * 0.6185567010309279],
                    [anchor[0] + width * 0.2625482625482625, anchor[1] + height * 0.6649484536082474],
                    [anchor[0] + width * 0.2625482625482625, anchor[1] + height * 0.6958762886597938],
                    [anchor[0] + width * 0.30115830115830117, anchor[1] + height * 0.7164948453608248],
                    [anchor[0] + width * 0.3204633204633205, anchor[1] + height * 0.7319587628865979],
                    [anchor[0] + width * 0.35135135135135137, anchor[1] + height * 0.7371134020618557],
                    [anchor[0] + width * 0.38223938223938225, anchor[1] + height * 0.7371134020618557],
                    [anchor[0] + width * 0.4015444015444015, anchor[1] + height * 0.7319587628865979],
                    [anchor[0] + width * 0.42857142857142855, anchor[1] + height * 0.7216494845360825],
                    [anchor[0] + width * 0.42084942084942084, anchor[1] + height * 0.6649484536082474],
                    [anchor[0] + width * 0.4247104247104247, anchor[1] + height * 0.5876288659793815],
                    [anchor[0] + width * 0.42857142857142855, anchor[1] + height * 0.5515463917525774],
                    [anchor[0] + width * 0.42857142857142855, anchor[1] + height * 0.4793814432989691],
                    [anchor[0] + width * 0.42857142857142855, anchor[1] + height * 0.4329896907216495],
                    [anchor[0] + width * 0.43243243243243246, anchor[1] + height * 0.3711340206185567],
                    [anchor[0] + width * 0.43243243243243246, anchor[1] + height * 0.33505154639175255],
                    [anchor[0] + width * 0.4247104247104247, anchor[1] + height * 0.31958762886597936],
                    [anchor[0] + width * 0.40540540540540543, anchor[1] + height * 0.3247422680412371],
                    [anchor[0] + width * 0.38996138996138996, anchor[1] + height * 0.33505154639175255],
                    [anchor[0] + width * 0.38223938223938225, anchor[1] + height * 0.36082474226804123],
                    [anchor[0] + width * 0.38223938223938225, anchor[1] + height * 0.3865979381443299],
                    [anchor[0] + width * 0.38223938223938225, anchor[1] + height * 0.4329896907216495],
                    [anchor[0] + width * 0.38223938223938225, anchor[1] + height * 0.4639175257731959],
                    [anchor[0] + width * 0.3783783783783784, anchor[1] + height * 0.520618556701031],
                    [anchor[0] + width * 0.3745173745173745, anchor[1] + height * 0.5927835051546392],
                    [anchor[0] + width * 0.3783783783783784, anchor[1] + height * 0.6494845360824743],
                    [anchor[0] + width * 0.37065637065637064, anchor[1] + height * 0.6597938144329897],
                    [anchor[0] + width * 0.35135135135135137, anchor[1] + height * 0.6752577319587629],
                    [anchor[0] + width * 0.33976833976833976, anchor[1] + height * 0.6752577319587629],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.6494845360824743],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.6082474226804123],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.5463917525773195],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.4948453608247423],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.422680412371134],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.38144329896907214],
                    [anchor[0] + width * 0.32432432432432434, anchor[1] + height * 0.33505154639175255],
                    [anchor[0] + width * 0.2625482625482625, anchor[1] + height * 0.31958762886597936],
                ],
                [
                    [anchor[0] + width * 0.305019305019305, anchor[1] + height * 0.28350515463917525],
                    [anchor[0] + width * 0.3127413127413127, anchor[1] + height * 0.21649484536082475],
                    [anchor[0] + width * 0.6833976833976834, anchor[1] + height * 0.21649484536082475],
                    [anchor[0] + width * 0.6911196911196911, anchor[1] + height * 0.28350515463917525],
                    [anchor[0] + width * 0.6718146718146718, anchor[1] + height * 0.26804123711340205],
                    [anchor[0] + width * 0.528957528957529, anchor[1] + height * 0.26804123711340205],
                    [anchor[0] + width * 0.528957528957529, anchor[1] + height * 0.7835051546391752],
                    [anchor[0] + width * 0.5444015444015444, anchor[1] + height * 0.8092783505154639],
                    [anchor[0] + width * 0.4594594594594595, anchor[1] + height * 0.8041237113402062],
                    [anchor[0] + width * 0.47104247104247104, anchor[1] + height * 0.7835051546391752],
                    [anchor[0] + width * 0.47104247104247104, anchor[1] + height * 0.27835051546391754],
                    [anchor[0] + width * 0.3088803088803089, anchor[1] + height * 0.27835051546391754],
                ],
                [
                    [anchor[0] + width * 0.5521235521235521, anchor[1] + height * 0.3247422680412371],
                    [anchor[0] + width * 0.5752895752895753, anchor[1] + height * 0.35051546391752575],
                    [anchor[0] + width * 0.5714285714285714, anchor[1] + height * 0.7061855670103093],
                    [anchor[0] + width * 0.555984555984556, anchor[1] + height * 0.7216494845360825],
                    [anchor[0] + width * 0.6756756756756757, anchor[1] + height * 0.7371134020618557],
                    [anchor[0] + width * 0.7065637065637066, anchor[1] + height * 0.711340206185567],
                    [anchor[0] + width * 0.7297297297297297, anchor[1] + height * 0.6752577319587629],
                    [anchor[0] + width * 0.7413127413127413, anchor[1] + height * 0.6237113402061856],
                    [anchor[0] + width * 0.752895752895753, anchor[1] + height * 0.5773195876288659],
                    [anchor[0] + width * 0.7567567567567568, anchor[1] + height * 0.5051546391752577],
                    [anchor[0] + width * 0.7567567567567568, anchor[1] + height * 0.4587628865979381],
                    [anchor[0] + width * 0.752895752895753, anchor[1] + height * 0.39690721649484534],
                    [anchor[0] + width * 0.7297297297297297, anchor[1] + height * 0.36082474226804123],
                    [anchor[0] + width * 0.7065637065637066, anchor[1] + height * 0.3247422680412371],
                    [anchor[0] + width * 0.6795366795366795, anchor[1] + height * 0.31443298969072164],
                    [anchor[0] + width * 0.555984555984556, anchor[1] + height * 0.30927835051546393],
                ],
                [
                    [anchor[0] + width * 0.6177606177606177, anchor[1] + height * 0.3711340206185567],
                    [anchor[0] + width * 0.6216216216216216, anchor[1] + height * 0.6649484536082474],
                    [anchor[0] + width * 0.6640926640926641, anchor[1] + height * 0.6752577319587629],
                    [anchor[0] + width * 0.6833976833976834, anchor[1] + height * 0.6391752577319587],
                    [anchor[0] + width * 0.6911196911196911, anchor[1] + height * 0.5927835051546392],
                    [anchor[0] + width * 0.694980694980695, anchor[1] + height * 0.520618556701031],
                    [anchor[0] + width * 0.694980694980695, anchor[1] + height * 0.4587628865979381],
                    [anchor[0] + width * 0.694980694980695, anchor[1] + height * 0.4072164948453608],
                    [anchor[0] + width * 0.6718146718146718, anchor[1] + height * 0.3711340206185567],
                    [anchor[0] + width * 0.6293436293436293, anchor[1] + height * 0.36597938144329895],
                ],
            ]
    },
    liverpool: {
        aspectRatio: 1.5,
        boidPosition:
            [
                [
                    [anchor[0] + width * 0.29365079365079366, anchor[1] + height * 0.9920634920634921],
                    [anchor[0] + width * 0.291005291005291, anchor[1] + height * 0.9484126984126984],
                    [anchor[0] + width * 0.291005291005291, anchor[1] + height * 0.9166666666666666],
                    [anchor[0] + width * 0.29365079365079366, anchor[1] + height * 0.875],
                    [anchor[0] + width * 0.294973544973545, anchor[1] + height * 0.8253968253968254],
                    [anchor[0] + width * 0.2896825396825397, anchor[1] + height * 0.7837301587301587],
                    [anchor[0] + width * 0.2830687830687831, anchor[1] + height * 0.751984126984127],
                    [anchor[0] + width * 0.25396825396825395, anchor[1] + height * 0.7380952380952381],
                    [anchor[0] + width * 0.23015873015873015, anchor[1] + height * 0.7599206349206349],
                    [anchor[0] + width * 0.2037037037037037, anchor[1] + height * 0.7916666666666666],
                    [anchor[0] + width * 0.17195767195767195, anchor[1] + height * 0.8174603174603174],
                    [anchor[0] + width * 0.13095238095238096, anchor[1] + height * 0.8392857142857143],
                    [anchor[0] + width * 0.10449735449735449, anchor[1] + height * 0.8511904761904762],
                    [anchor[0] + width * 0.08333333333333333, anchor[1] + height * 0.8551587301587301],
                    [anchor[0] + width * 0.047619047619047616, anchor[1] + height * 0.8531746031746031],
                    [anchor[0] + width * 0.027777777777777776, anchor[1] + height * 0.8511904761904762],
                    [anchor[0] + width * 0.007936507936507936, anchor[1] + height * 0.8472222222222222],
                    [anchor[0] + width * 0.006613756613756613, anchor[1] + height * 0.8174603174603174],
                    [anchor[0] + width * 0.007936507936507936, anchor[1] + height * 0.7638888888888888],
                    [anchor[0] + width * 0.010582010582010581, anchor[1] + height * 0.7261904761904762],
                    [anchor[0] + width * 0.017195767195767195, anchor[1] + height * 0.6825396825396826],
                    [anchor[0] + width * 0.018518518518518517, anchor[1] + height * 0.6408730158730159],
                    [anchor[0] + width * 0.0291005291005291, anchor[1] + height * 0.5992063492063492],
                    [anchor[0] + width * 0.03571428571428571, anchor[1] + height * 0.5634920634920635],
                    [anchor[0] + width * 0.046296296296296294, anchor[1] + height * 0.5059523809523809],
                    [anchor[0] + width * 0.046296296296296294, anchor[1] + height * 0.4662698412698413],
                    [anchor[0] + width * 0.04894179894179894, anchor[1] + height * 0.4384920634920635],
                    [anchor[0] + width * 0.04365079365079365, anchor[1] + height * 0.3888888888888889],
                    [anchor[0] + width * 0.05291005291005291, anchor[1] + height * 0.3492063492063492],
                    [anchor[0] + width * 0.06481481481481481, anchor[1] + height * 0.3353174603174603],
                    [anchor[0] + width * 0.07539682539682539, anchor[1] + height * 0.3333333333333333],
                    [anchor[0] + width * 0.07671957671957672, anchor[1] + height * 0.3412698412698413],
                    [anchor[0] + width * 0.08068783068783068, anchor[1] + height * 0.3392857142857143],
                    [anchor[0] + width * 0.08597883597883597, anchor[1] + height * 0.32936507936507936],
                    [anchor[0] + width * 0.09126984126984126, anchor[1] + height * 0.32936507936507936],
                    [anchor[0] + width * 0.09523809523809523, anchor[1] + height * 0.3373015873015873],
                    [anchor[0] + width * 0.09523809523809523, anchor[1] + height * 0.3194444444444444],
                    [anchor[0] + width * 0.10582010582010581, anchor[1] + height * 0.3115079365079365],
                    [anchor[0] + width * 0.10714285714285714, anchor[1] + height * 0.3115079365079365],
                    [anchor[0] + width * 0.11904761904761904, anchor[1] + height * 0.3134920634920635],
                    [anchor[0] + width * 0.11507936507936507, anchor[1] + height * 0.2916666666666667],
                    [anchor[0] + width * 0.12169312169312169, anchor[1] + height * 0.25793650793650796],
                    [anchor[0] + width * 0.12433862433862433, anchor[1] + height * 0.2222222222222222],
                    [anchor[0] + width * 0.13095238095238096, anchor[1] + height * 0.20436507936507936],
                    [anchor[0] + width * 0.1388888888888889, anchor[1] + height * 0.20436507936507936],
                    [anchor[0] + width * 0.14285714285714285, anchor[1] + height * 0.2361111111111111],
                    [anchor[0] + width * 0.14285714285714285, anchor[1] + height * 0.2718253968253968],
                    [anchor[0] + width * 0.14417989417989419, anchor[1] + height * 0.30753968253968256],
                    [anchor[0] + width * 0.14417989417989419, anchor[1] + height * 0.3392857142857143],
                    [anchor[0] + width * 0.14814814814814814, anchor[1] + height * 0.3551587301587302],
                    [anchor[0] + width * 0.14947089947089948, anchor[1] + height * 0.375],
                    [anchor[0] + width * 0.14947089947089948, anchor[1] + height * 0.4107142857142857],
                    [anchor[0] + width * 0.14814814814814814, anchor[1] + height * 0.4305555555555556],
                    [anchor[0] + width * 0.1335978835978836, anchor[1] + height * 0.45634920634920634],
                    [anchor[0] + width * 0.12698412698412698, anchor[1] + height * 0.47023809523809523],
                    [anchor[0] + width * 0.12433862433862433, anchor[1] + height * 0.49206349206349204],
                    [anchor[0] + width * 0.11904761904761904, anchor[1] + height * 0.5218253968253969],
                    [anchor[0] + width * 0.11243386243386243, anchor[1] + height * 0.5456349206349206],
                    [anchor[0] + width * 0.10449735449735449, anchor[1] + height * 0.5734126984126984],
                    [anchor[0] + width * 0.09656084656084656, anchor[1] + height * 0.625],
                    [anchor[0] + width * 0.0992063492063492, anchor[1] + height * 0.6527777777777778],
                    [anchor[0] + width * 0.10185185185185185, anchor[1] + height * 0.6785714285714286],
                    [anchor[0] + width * 0.10978835978835978, anchor[1] + height * 0.6845238095238095],
                    [anchor[0] + width * 0.13095238095238096, anchor[1] + height * 0.6626984126984127],
                    [anchor[0] + width * 0.14947089947089948, anchor[1] + height * 0.6448412698412699],
                    [anchor[0] + width * 0.164021164021164, anchor[1] + height * 0.6309523809523809],
                    [anchor[0] + width * 0.17724867724867724, anchor[1] + height * 0.6031746031746031],
                    [anchor[0] + width * 0.19047619047619047, anchor[1] + height * 0.5833333333333334],
                    [anchor[0] + width * 0.20899470899470898, anchor[1] + height * 0.5615079365079365],
                    [anchor[0] + width * 0.22486772486772486, anchor[1] + height * 0.5376984126984127],
                    [anchor[0] + width * 0.24867724867724866, anchor[1] + height * 0.5198412698412699],
                    [anchor[0] + width * 0.26455026455026454, anchor[1] + height * 0.5],
                    [anchor[0] + width * 0.28703703703703703, anchor[1] + height * 0.4880952380952381],
                    [anchor[0] + width * 0.3029100529100529, anchor[1] + height * 0.4801587301587302],
                    [anchor[0] + width * 0.31613756613756616, anchor[1] + height * 0.4781746031746032],
                    [anchor[0] + width * 0.32671957671957674, anchor[1] + height * 0.48214285714285715],
                    [anchor[0] + width * 0.33201058201058203, anchor[1] + height * 0.4583333333333333],
                    [anchor[0] + width * 0.3544973544973545, anchor[1] + height * 0.4523809523809524],
                    [anchor[0] + width * 0.37433862433862436, anchor[1] + height * 0.4503968253968254],
                    [anchor[0] + width * 0.38756613756613756, anchor[1] + height * 0.44642857142857145],
                    [anchor[0] + width * 0.3955026455026455, anchor[1] + height * 0.4166666666666667],
                    [anchor[0] + width * 0.39814814814814814, anchor[1] + height * 0.40476190476190477],
                    [anchor[0] + width * 0.39285714285714285, anchor[1] + height * 0.376984126984127],
                    [anchor[0] + width * 0.3888888888888889, anchor[1] + height * 0.36904761904761907],
                    [anchor[0] + width * 0.37962962962962965, anchor[1] + height * 0.3630952380952381],
                    [anchor[0] + width * 0.3716931216931217, anchor[1] + height * 0.3472222222222222],
                    [anchor[0] + width * 0.3716931216931217, anchor[1] + height * 0.3253968253968254],
                    [anchor[0] + width * 0.3716931216931217, anchor[1] + height * 0.30753968253968256],
                    [anchor[0] + width * 0.36507936507936506, anchor[1] + height * 0.2916666666666667],
                    [anchor[0] + width * 0.35978835978835977, anchor[1] + height * 0.27976190476190477],
                    [anchor[0] + width * 0.35185185185185186, anchor[1] + height * 0.25793650793650796],
                    [anchor[0] + width * 0.3544973544973545, anchor[1] + height * 0.24801587301587302],
                    [anchor[0] + width * 0.3412698412698413, anchor[1] + height * 0.22420634920634921],
                    [anchor[0] + width * 0.3412698412698413, anchor[1] + height * 0.1865079365079365],
                    [anchor[0] + width * 0.3478835978835979, anchor[1] + height * 0.1746031746031746],
                    [anchor[0] + width * 0.3558201058201058, anchor[1] + height * 0.12301587301587301],
                    [anchor[0] + width * 0.36507936507936506, anchor[1] + height * 0.10317460317460317],
                    [anchor[0] + width * 0.37566137566137564, anchor[1] + height * 0.09523809523809523],
                    [anchor[0] + width * 0.3835978835978836, anchor[1] + height * 0.07936507936507936],
                    [anchor[0] + width * 0.39285714285714285, anchor[1] + height * 0.061507936507936505],
                    [anchor[0] + width * 0.39285714285714285, anchor[1] + height * 0.03571428571428571],
                    [anchor[0] + width * 0.4060846560846561, anchor[1] + height * 0.027777777777777776],
                    [anchor[0] + width * 0.414021164021164, anchor[1] + height * 0.027777777777777776],
                    [anchor[0] + width * 0.4312169312169312, anchor[1] + height * 0.011904761904761904],
                    [anchor[0] + width * 0.44312169312169314, anchor[1] + height * 0.00992063492063492],
                    [anchor[0] + width * 0.4497354497354497, anchor[1] + height * 0.015873015873015872],
                    [anchor[0] + width * 0.4642857142857143, anchor[1] + height * 0.017857142857142856],
                    [anchor[0] + width * 0.48544973544973546, anchor[1] + height * 0.013888888888888888],
                    [anchor[0] + width * 0.49603174603174605, anchor[1] + height * 0.013888888888888888],
                    [anchor[0] + width * 0.5092592592592593, anchor[1] + height * 0.013888888888888888],
                    [anchor[0] + width * 0.5198412698412699, anchor[1] + height * 0.017857142857142856],
                    [anchor[0] + width * 0.5317460317460317, anchor[1] + height * 0.023809523809523808],
                    [anchor[0] + width * 0.548941798941799, anchor[1] + height * 0.05555555555555555],
                    [anchor[0] + width * 0.548941798941799, anchor[1] + height * 0.06944444444444445],
                    [anchor[0] + width * 0.5648148148148148, anchor[1] + height * 0.07539682539682539],
                    [anchor[0] + width * 0.5687830687830688, anchor[1] + height * 0.05357142857142857],
                    [anchor[0] + width * 0.578042328042328, anchor[1] + height * 0.06746031746031746],
                    [anchor[0] + width * 0.5740740740740741, anchor[1] + height * 0.10119047619047619],
                    [anchor[0] + width * 0.5886243386243386, anchor[1] + height * 0.11507936507936507],
                    [anchor[0] + width * 0.6031746031746031, anchor[1] + height * 0.12103174603174603],
                    [anchor[0] + width * 0.6044973544973545, anchor[1] + height * 0.1527777777777778],
                    [anchor[0] + width * 0.6150793650793651, anchor[1] + height * 0.19047619047619047],
                    [anchor[0] + width * 0.6177248677248677, anchor[1] + height * 0.2222222222222222],
                    [anchor[0] + width * 0.6177248677248677, anchor[1] + height * 0.27976190476190477],
                    [anchor[0] + width * 0.6164021164021164, anchor[1] + height * 0.31547619047619047],
                    [anchor[0] + width * 0.593915343915344, anchor[1] + height * 0.3630952380952381],
                    [anchor[0] + width * 0.5793650793650794, anchor[1] + height * 0.3948412698412698],
                    [anchor[0] + width * 0.5753968253968254, anchor[1] + height * 0.4226190476190476],
                    [anchor[0] + width * 0.5873015873015873, anchor[1] + height * 0.4305555555555556],
                    [anchor[0] + width * 0.5992063492063492, anchor[1] + height * 0.43253968253968256],
                    [anchor[0] + width * 0.6031746031746031, anchor[1] + height * 0.4523809523809524],
                    [anchor[0] + width * 0.6216931216931217, anchor[1] + height * 0.44841269841269843],
                    [anchor[0] + width * 0.6296296296296297, anchor[1] + height * 0.44246031746031744],
                    [anchor[0] + width * 0.6375661375661376, anchor[1] + height * 0.4623015873015873],
                    [anchor[0] + width * 0.6455026455026455, anchor[1] + height * 0.4662698412698413],
                    [anchor[0] + width * 0.6746031746031746, anchor[1] + height * 0.4662698412698413],
                    [anchor[0] + width * 0.6851851851851852, anchor[1] + height * 0.4801587301587302],
                    [anchor[0] + width * 0.6957671957671958, anchor[1] + height * 0.4880952380952381],
                    [anchor[0] + width * 0.7235449735449735, anchor[1] + height * 0.498015873015873],
                    [anchor[0] + width * 0.7526455026455027, anchor[1] + height * 0.5178571428571429],
                    [anchor[0] + width * 0.7658730158730159, anchor[1] + height * 0.5337301587301587],
                    [anchor[0] + width * 0.7857142857142857, anchor[1] + height * 0.5575396825396826],
                    [anchor[0] + width * 0.798941798941799, anchor[1] + height * 0.5853174603174603],
                    [anchor[0] + width * 0.8187830687830688, anchor[1] + height * 0.6111111111111112],
                    [anchor[0] + width * 0.8386243386243386, anchor[1] + height * 0.625],
                    [anchor[0] + width * 0.8597883597883598, anchor[1] + height * 0.6309523809523809],
                    [anchor[0] + width * 0.8716931216931217, anchor[1] + height * 0.6349206349206349],
                    [anchor[0] + width * 0.8703703703703703, anchor[1] + height * 0.5972222222222222],
                    [anchor[0] + width * 0.8611111111111112, anchor[1] + height * 0.5773809523809523],
                    [anchor[0] + width * 0.8478835978835979, anchor[1] + height * 0.5456349206349206],
                    [anchor[0] + width * 0.83994708994709, anchor[1] + height * 0.5119047619047619],
                    [anchor[0] + width * 0.8333333333333334, anchor[1] + height * 0.4861111111111111],
                    [anchor[0] + width * 0.8174603174603174, anchor[1] + height * 0.4523809523809524],
                    [anchor[0] + width * 0.8042328042328042, anchor[1] + height * 0.42857142857142855],
                    [anchor[0] + width * 0.798941798941799, anchor[1] + height * 0.40476190476190477],
                    [anchor[0] + width * 0.7962962962962963, anchor[1] + height * 0.36904761904761907],
                    [anchor[0] + width * 0.7976190476190477, anchor[1] + height * 0.3412698412698413],
                    [anchor[0] + width * 0.798941798941799, anchor[1] + height * 0.32142857142857145],
                    [anchor[0] + width * 0.8029100529100529, anchor[1] + height * 0.30753968253968256],
                    [anchor[0] + width * 0.8068783068783069, anchor[1] + height * 0.2976190476190476],
                    [anchor[0] + width * 0.8095238095238095, anchor[1] + height * 0.2698412698412698],
                    [anchor[0] + width * 0.8095238095238095, anchor[1] + height * 0.2400793650793651],
                    [anchor[0] + width * 0.8108465608465608, anchor[1] + height * 0.21626984126984128],
                    [anchor[0] + width * 0.8253968253968254, anchor[1] + height * 0.20436507936507936],
                    [anchor[0] + width * 0.8346560846560847, anchor[1] + height * 0.20238095238095238],
                    [anchor[0] + width * 0.8359788359788359, anchor[1] + height * 0.24801587301587302],
                    [anchor[0] + width * 0.8359788359788359, anchor[1] + height * 0.27976190476190477],
                    [anchor[0] + width * 0.8359788359788359, anchor[1] + height * 0.30753968253968256],
                    [anchor[0] + width * 0.83994708994709, anchor[1] + height * 0.3055555555555556],
                    [anchor[0] + width * 0.8478835978835979, anchor[1] + height * 0.2996031746031746],
                    [anchor[0] + width * 0.8584656084656085, anchor[1] + height * 0.30952380952380953],
                    [anchor[0] + width * 0.8584656084656085, anchor[1] + height * 0.32341269841269843],
                    [anchor[0] + width * 0.8637566137566137, anchor[1] + height * 0.30753968253968256],
                    [anchor[0] + width * 0.873015873015873, anchor[1] + height * 0.3055555555555556],
                    [anchor[0] + width * 0.8756613756613757, anchor[1] + height * 0.32142857142857145],
                    [anchor[0] + width * 0.8822751322751323, anchor[1] + height * 0.32142857142857145],
                    [anchor[0] + width * 0.8902116402116402, anchor[1] + height * 0.32142857142857145],
                    [anchor[0] + width * 0.9021164021164021, anchor[1] + height * 0.3492063492063492],
                    [anchor[0] + width * 0.9047619047619048, anchor[1] + height * 0.36507936507936506],
                    [anchor[0] + width * 0.9126984126984127, anchor[1] + height * 0.4226190476190476],
                    [anchor[0] + width * 0.9047619047619048, anchor[1] + height * 0.44841269841269843],
                    [anchor[0] + width * 0.906084656084656, anchor[1] + height * 0.4781746031746032],
                    [anchor[0] + width * 0.9166666666666666, anchor[1] + height * 0.49603174603174605],
                    [anchor[0] + width * 0.9285714285714286, anchor[1] + height * 0.5357142857142857],
                    [anchor[0] + width * 0.9378306878306878, anchor[1] + height * 0.5575396825396826],
                    [anchor[0] + width * 0.9523809523809523, anchor[1] + height * 0.5853174603174603],
                    [anchor[0] + width * 0.9656084656084656, anchor[1] + height * 0.626984126984127],
                    [anchor[0] + width * 0.9854497354497355, anchor[1] + height * 0.6845238095238095],
                    [anchor[0] + width * 0.9933862433862434, anchor[1] + height * 0.7579365079365079],
                    [anchor[0] + width * 0.9920634920634921, anchor[1] + height * 0.7857142857142857],
                    [anchor[0] + width * 0.9722222222222222, anchor[1] + height * 0.8134920634920635],
                    [anchor[0] + width * 0.951058201058201, anchor[1] + height * 0.8253968253968254],
                    [anchor[0] + width * 0.917989417989418, anchor[1] + height * 0.8253968253968254],
                    [anchor[0] + width * 0.8862433862433863, anchor[1] + height * 0.8174603174603174],
                    [anchor[0] + width * 0.8478835978835979, anchor[1] + height * 0.7976190476190477],
                    [anchor[0] + width * 0.8201058201058201, anchor[1] + height * 0.7857142857142857],
                    [anchor[0] + width * 0.7711640211640212, anchor[1] + height * 0.7678571428571429],
                    [anchor[0] + width * 0.7486772486772487, anchor[1] + height * 0.751984126984127],
                    [anchor[0] + width * 0.7248677248677249, anchor[1] + height * 0.7321428571428571],
                    [anchor[0] + width * 0.705026455026455, anchor[1] + height * 0.746031746031746],
                    [anchor[0] + width * 0.7037037037037037, anchor[1] + height * 0.7698412698412699],
                    [anchor[0] + width * 0.6931216931216931, anchor[1] + height * 0.8075396825396826],
                    [anchor[0] + width * 0.6851851851851852, anchor[1] + height * 0.8551587301587301],
                    [anchor[0] + width * 0.6865079365079365, anchor[1] + height * 0.8809523809523809],
                    [anchor[0] + width * 0.6917989417989417, anchor[1] + height * 0.9384920634920635],
                    [anchor[0] + width * 0.7037037037037037, anchor[1] + height * 0.9722222222222222],
                    [anchor[0] + width * 0.6984126984126984, anchor[1] + height * 0.9880952380952381],
                ],
                [
                    [anchor[0] + width * 0.41798941798941797, anchor[1] + height * 0.9861111111111112],
                    [anchor[0] + width * 0.42063492063492064, anchor[1] + height * 0.9404761904761905],
                    [anchor[0] + width * 0.42063492063492064, anchor[1] + height * 0.8988095238095238],
                    [anchor[0] + width * 0.42063492063492064, anchor[1] + height * 0.8373015873015873],
                    [anchor[0] + width * 0.4193121693121693, anchor[1] + height * 0.8035714285714286],
                    [anchor[0] + width * 0.4193121693121693, anchor[1] + height * 0.751984126984127],
                    [anchor[0] + width * 0.4193121693121693, anchor[1] + height * 0.7162698412698413],
                    [anchor[0] + width * 0.39285714285714285, anchor[1] + height * 0.7162698412698413],
                    [anchor[0] + width * 0.4060846560846561, anchor[1] + height * 0.6567460317460317],
                    [anchor[0] + width * 0.4656084656084656, anchor[1] + height * 0.6507936507936508],
                    [anchor[0] + width * 0.458994708994709, anchor[1] + height * 0.9940476190476191],
                ],
                [
                    [anchor[0] + width * 0.5343915343915344, anchor[1] + height * 0.9920634920634921],
                    [anchor[0] + width * 0.5383597883597884, anchor[1] + height * 0.7242063492063492],
                    [anchor[0] + width * 0.5105820105820106, anchor[1] + height * 0.7202380952380952],
                    [anchor[0] + width * 0.5211640211640212, anchor[1] + height * 0.6607142857142857],
                    [anchor[0] + width * 0.5846560846560847, anchor[1] + height * 0.6607142857142857],
                    [anchor[0] + width * 0.5806878306878307, anchor[1] + height * 0.9940476190476191],
                ],
                [
                    [anchor[0] + width * 0.3637566137566138, anchor[1] + height * 0.5714285714285714],
                    [anchor[0] + width * 0.36904761904761907, anchor[1] + height * 0.5138888888888888],
                    [anchor[0] + width * 0.38095238095238093, anchor[1] + height * 0.5436507936507936],
                    [anchor[0] + width * 0.40476190476190477, anchor[1] + height * 0.5119047619047619],
                    [anchor[0] + width * 0.3994708994708995, anchor[1] + height * 0.5714285714285714],
                ],
                [
                    [anchor[0] + width * 0.414021164021164, anchor[1] + height * 0.5555555555555556],
                    [anchor[0] + width * 0.4193121693121693, anchor[1] + height * 0.5555555555555556],
                    [anchor[0] + width * 0.421957671957672, anchor[1] + height * 0.5714285714285714],
                    [anchor[0] + width * 0.41005291005291006, anchor[1] + height * 0.5674603174603174],
                ],
                [
                    [anchor[0] + width * 0.4537037037037037, anchor[1] + height * 0.5297619047619048],
                    [anchor[0] + width * 0.44047619047619047, anchor[1] + height * 0.5198412698412699],
                    [anchor[0] + width * 0.43253968253968256, anchor[1] + height * 0.5357142857142857],
                    [anchor[0] + width * 0.4444444444444444, anchor[1] + height * 0.5456349206349206],
                    [anchor[0] + width * 0.4537037037037037, anchor[1] + height * 0.5555555555555556],
                    [anchor[0] + width * 0.4537037037037037, anchor[1] + height * 0.5734126984126984],
                    [anchor[0] + width * 0.4417989417989418, anchor[1] + height * 0.5773809523809523],
                    [anchor[0] + width * 0.4351851851851852, anchor[1] + height * 0.5674603174603174],
                ],
                [
                    [anchor[0] + width * 0.4642857142857143, anchor[1] + height * 0.5773809523809523],
                    [anchor[0] + width * 0.47354497354497355, anchor[1] + height * 0.5317460317460317],
                    [anchor[0] + width * 0.48148148148148145, anchor[1] + height * 0.5158730158730159],
                    [anchor[0] + width * 0.4894179894179894, anchor[1] + height * 0.5376984126984127],
                    [anchor[0] + width * 0.49206349206349204, anchor[1] + height * 0.5694444444444444],
                    [anchor[0] + width * 0.49867724867724866, anchor[1] + height * 0.5853174603174603],
                ],
                [
                    [anchor[0] + width * 0.4708994708994709, anchor[1] + height * 0.5615079365079365],
                    [anchor[0] + width * 0.48677248677248675, anchor[1] + height * 0.5615079365079365],
                ],
                [
                    [anchor[0] + width * 0.5105820105820106, anchor[1] + height * 0.5158730158730159],
                    [anchor[0] + width * 0.5132275132275133, anchor[1] + height * 0.5753968253968254],
                    [anchor[0] + width * 0.5277777777777778, anchor[1] + height * 0.5793650793650794],
                ],
                [
                    [anchor[0] + width * 0.541005291005291, anchor[1] + height * 0.5714285714285714],
                    [anchor[0] + width * 0.5595238095238095, anchor[1] + height * 0.5079365079365079],
                    [anchor[0] + width * 0.5767195767195767, anchor[1] + height * 0.5714285714285714],
                ],
                [
                    [anchor[0] + width * 0.5436507936507936, anchor[1] + height * 0.5535714285714286],
                    [anchor[0] + width * 0.5674603174603174, anchor[1] + height * 0.5535714285714286],
                ],
                [
                    [anchor[0] + width * 0.5925925925925926, anchor[1] + height * 0.5198412698412699],
                    [anchor[0] + width * 0.58994708994709, anchor[1] + height * 0.5813492063492064],
                ],
                [
                    [anchor[0] + width * 0.6124338624338624, anchor[1] + height * 0.5218253968253969],
                    [anchor[0] + width * 0.6164021164021164, anchor[1] + height * 0.5932539682539683],
                ],
                [
                    [anchor[0] + width * 0.5912698412698413, anchor[1] + height * 0.5496031746031746],
                    [anchor[0] + width * 0.6150793650793651, anchor[1] + height * 0.5496031746031746],
                ],
                [
                    [anchor[0] + width * 0.753968253968254, anchor[1] + height * 0.7321428571428571],
                    [anchor[0] + width * 0.8029100529100529, anchor[1] + height * 0.6051587301587301],
                ],
                [
                    [anchor[0] + width * 0.7777777777777778, anchor[1] + height * 0.75],
                    [anchor[0] + width * 0.8267195767195767, anchor[1] + height * 0.625],
                ],
                [
                    [anchor[0] + width * 0.7261904761904762, anchor[1] + height * 0.5119047619047619],
                    [anchor[0] + width * 0.7394179894179894, anchor[1] + height * 0.5496031746031746],
                    [anchor[0] + width * 0.7619047619047619, anchor[1] + height * 0.5813492063492064],
                    [anchor[0] + width * 0.7923280423280423, anchor[1] + height * 0.5912698412698413],
                ],
                [
                    [anchor[0] + width * 0.2275132275132275, anchor[1] + height * 0.753968253968254],
                    [anchor[0] + width * 0.16666666666666666, anchor[1] + height * 0.6349206349206349],
                ],
                [
                    [anchor[0] + width * 0.15608465608465608, anchor[1] + height * 0.6547619047619048],
                    [anchor[0] + width * 0.21296296296296297, anchor[1] + height * 0.7698412698412699],
                ],
                [
                ],
            ]
    }
}




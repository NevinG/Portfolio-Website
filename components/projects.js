const projects = [];

const abstractArtGenerator =`
<div class="project" id="current-project">
    <h1 class="project-title">Art Generator</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">Python</div>
        <div class="project-technology">Tensorflow</div>
    </div>
    <p class="project-text">
        I worked on this project as a part of The Artifical Intelligence Society (AIS) at UTD.
        I was the mentor for this project, so I was responsible on mentoring three students through
        their very first AI/ML project.
        <br>
        <br>
        The goal of this project was to explore if you can make art through an evolutionary model.
        To compare the results of our evolutionary model to a baseline we also made a DCGAN model.
        <br>
        <br>
        The goal of this project was to guide my mentee's through their first AI/ML project
        and to see if an evolutionary model for art generation was a viable method. After seeing the results
        our evolutionary model isn't a competitive alternative to the existing technologies like a DCGAN model.
        <br>
        <br>
        <a target="_blank" class="link_to_new_tab" href="https://drive.google.com/file/d/1_wMElj7dfBLVtDtF7aoh_QRU3luXegwQ/view"><u>View Presentation</u></a>
        &nbsp;
        <a target="_blank" class="link_to_new_tab" href="https://github.com/AIM-Spring-2023-Nevin-s-Team/AIM-Spring-2023-Team-Nevin"><u>Github Repo</u></a>
    </p>
</div>
`;
projects.push(abstractArtGenerator);

const billPredictionModel =`
<div class="project" id="current-project">
    <h1 class="project-title">Bill Predictor</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">Python</div>
        <div class="project-technology">Tensorflow</div>
        <div class="project-technology">Selenium</div>
        <div class="project-technology">Flask</div>
    </div>
    <p class="project-text">
        I worked on this project as a part of The Artifical Intelligence Society (AIS) at UTD.
        I was a mentee being led by a mentor on my first AI/ML project. Our final Model used two seperate models.
        One was a NLP LSTM model trained on the bill text, and the other was a feed forward neural network trained on
        information about the bill like: sponser, author, author party, senate majority, etc. 
        <br>
        <br>
        I led three other mentees through the whole data scraping process and model creation for the feed forward neural network.
        <br>
        <br>
        <a target="_blank" class="link_to_new_tab" href="https://drive.google.com/file/d/1FYeQ21pLmOJs3zQ85ypk9_daGLSXoK8-/view?usp=sharing"><u>View Presentation</u></a>
        &nbsp;
        <a target="_blank" class="link_to_new_tab" href="https://github.com/NevinG/TGIF-ML-TEAM"><u>Github Repo 1</u></a>
        &nbsp;
        <a target="_blank" class="link_to_new_tab" href="https://github.com/NevinG/TGIF_Flask_app"><u>Github Repo 2</u></a>
    </p>
</div>
`;
projects.push(billPredictionModel);

const poker =`
<div class="project" id="current-project">
    <h1 class="project-title">Poker</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">HTML</div>
        <div class="project-technology">CSS</div>
        <div class="project-technology">JavaScript</div>
        <div class="project-technology">React.js</div>
        <div class="project-technology">Node.js</div>
        <div class="project-technology">Express.js</div>
    </div>
    <p class="project-text">
        I created a full stack poker application for you to play with your friends.
        <br>
        <br>
        <a target="_blank" class="link_to_new_tab" href="https://neving.github.io/poker-game/"><u>View Project</u></a> 
        &nbsp;
        <a target="_blank" class="link_to_new_tab" href="https://github.com/NevinG/poker-game"><u>Github Repo</u></a>
    </p>
</div>
`;
projects.push(poker);

const mockQuizlet =`
<div class="project" id="current-project">
    <h1 class="project-title">Mock Quizlet</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">HTML</div>
        <div class="project-technology">CSS</div>
        <div class="project-technology">JavaScript</div>
        <div class="project-technology">React.js</div>
        <div class="project-technology">Node.js</div>
        <div class="project-technology">Express.js</div>
        <div class="project-technology">PostgreSQL</div>
    </div>
    <img src="./images/mock_quizlet.PNG" width="800px" height="400px" style="margin-top: 10px; margin-bottom: 10px">  
    <p class="project-text">
        I implemented all the main flashcard features of quizlet on my own mock quizlet application. All basic quizlet functionality worked
        as intended. I store the flashcard information locally on a postreSQL database on my desktop, so no demo.  
    </p>
</div>
`;
projects.push(mockQuizlet);

const marchMadness =`
<div class="project" id="current-project">
    <h1 class="project-title">March Madness</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">HTML</div>
        <div class="project-technology">CSS</div>
        <div class="project-technology">JavaScript</div>
        <div class="project-technology">Node.js</div>
        <div class="project-technology">Express.js</div>
    </div>
    <p class="project-text">
        I always lose in the popular basketball tournament March Madness. I decided I could finally win if I made a million brackets.
        After quickly making a json file with the million brackets I needed to come up with a way my friends could view it. I settup a server
        in my garage that hosted all my brackets and built a simple website where my friends could view the brackets.
    </p>
    <a target="_blank" class="link_to_new_tab" href="https://neving.github.io/Million-March-Madness-Brackets-Website/"><u>View Project</u></a>
    &nbsp;
    <a target="_blank" class="link_to_new_tab" href="https://github.com/NevinG/Million-March-Madness-Brackets-Website"><u>Github Repo</u></a>
</div>
`;
projects.push(marchMadness);

const practiceTypingCode =`
<div class="project" id="current-project">
    <h1 class="project-title">Practice Typing Code</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">HTML</div>
        <div class="project-technology">CSS</div>
        <div class="project-technology">JavaScript</div>
        <div class="project-technology">Python</div>
    </div>
    <p class="project-text">
      For a few weeks I was getting into typing. Then when I would go to work on coding projects my typing speed drastically decreased. I couldn't
      find a website to practice typing code, so I made it myself.
    </p>
    <a target="_blank" class="link_to_new_tab" href="https://www.practicetypingcode.com"><u>View Project</u></a>
    &nbsp;
    <a target="_blank" class="link_to_new_tab" href="https://github.com/NevinG/PracticeTypingCode"><u>Github Repo</u></a>
</div>
`;
projects.push(practiceTypingCode);

const ishiharaPlateGenerator =`
<div class="project" id="current-project">
    <h1 class="project-title">Ishihara Plate Generator</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">HTML</div>
        <div class="project-technology">CSS</div>
        <div class="project-technology">JavaScript</div>
    </div>
    <p class="project-text">
      Fun fact: I am color blind. I wanted normal vision people to understand the pain of looking at those color blind tests
      and not being able to see a number. So after alot of work and research I was able to generate color blind plates that I can
      see but normal vision people cannot.
    </p>
    <a target="_blank" class="link_to_new_tab" href="https://neving.github.io/ReverseColorBlindTest/"><u>View Project</u></a>
    &nbsp;
    <a target="_blank" class="link_to_new_tab" href="https://github.com/NevinG/ReverseColorBlindTest"><u>Github Repo</u></a>
</div>
`;
projects.push(ishiharaPlateGenerator);

const unityGames =`
<div class="project" id="current-project">
    <h1 class="project-title">Unity Games</h1>
    <div style="display: flex;">
        <div class="project-technology"style="margin-left: 0;">C#</div>
        <div class="project-technology">Unity</div>
    </div>
    <p class="project-text">
        I have made a dozen games in Unity, and have two games that are free download on itch.io. And I have like ten others not released.
    </p>
    <a target="_blank" class="link_to_new_tab" href="https://immersible.itch.io/"><u>Released Games</u></a>
</div>
`;
projects.push(unityGames);
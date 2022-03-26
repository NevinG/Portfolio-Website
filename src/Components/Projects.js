import React from 'react-dom';
import { Project } from './Project.js';
import './Projects.css';
import marchMadImg from '../Images/MarchMadnessImage.png';
import ptcImg from '../Images/PracticeTypingCodeImage.png';

export function Projects() {
    return (    
        <div className="projectsContainer">
            <Project
             title="Million March Madness Brackets"
             img={marchMadImg}
             text = "Have you dreamed of getting the perfect bracket? So have I! I decided to make a million of them, and now you can too!"
            />

            <Project
             title="PracticeTypingCode.com"
             img={ptcImg}
             text="A website where instead of practicing your regular typing, you can practice typing actual code."
            />
        </div>
    );
}
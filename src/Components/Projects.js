import React from 'react-dom';
import { Project } from './Project.js';
import './Projects.css';
import testImage from '../Images/testImage.png';

export function Projects() {
    return (    
        <div className="projectsContainer">
            <Project
             title="Test Title For Project 1"
             img={testImage}
             text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut tortor pretium viverra suspendisse potenti. In est ante in nibh mauris cursus mattis molestie. Venenatis urna cursus eget nunc scelerisque viverra mauris. Nisl rhoncus mattis rhoncus urna neque viverra justo. Enim praesent elementum facilisis leo vel fringilla. Quis vel eros donec ac odio tempor orci dapibus. Sed lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt. Consequat semper viverra nam libero. Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Interdum consectetur libero id faucibus. Hendrerit gravida rutrum quisque non tellus orci ac auctor augue. Viverra nam libero justo laoreet sit amet. Tristique nulla aliquet enim tortor at auctor urna nunc. Placerat orci nulla pellentesque dignissim enim sit. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi. Dictum varius duis at consectetur lorem donec. Lobortis elementum nibh tellus molestie nunc non. Enim ut tellus elementum sagittis vitae."
            />

            <Project
             title="Projec 2"
             img={testImage}
             text="woah, what a prject description."
            />
        </div>
    );
}
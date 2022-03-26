import React from 'react-router-dom';
import './Project.css'

export function Project(props){
    return (
        <div className="projectContainer">
            <h1>{props.title}</h1>
            <img src={props.img} alt="test project" className="projectImage"/>
            <p>{props.text}</p>
        </div>
    );
}
import React from 'react-dom';
import './NavBar.css';
import { NavLink } from 'react-router-dom';

export function NavBar () {
    return (
        <div className="navContainer">
            <NavLink to='/projects'> Projects </NavLink>
            <NavLink to='/about'> About </NavLink>
        </div>
    );
}
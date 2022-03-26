import React from 'react-dom';
import { Title } from './Title.js';
import { NavBar } from './NavBar.js';
import { Outlet } from 'react-router-dom';
import './App.css';

export function App() {
    return (
        <div>
            <Title></Title>
            <NavBar></NavBar>
            <Outlet/>
        </div>
    );
}
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './Components/App.js';
import { Projects } from './Components/Projects';
import { About } from './Components/About';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App/>}>
        <Route path="projects" element={<Projects/>}/>
        <Route path="about" element={<About/>}/>
      </Route>
    </Routes>
  </Router>,
  document.getElementById('root')
);

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { BrowserRouter } from "react-router-dom";
import "popper.js/dist/popper";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";
import "bootstrap/js/dist/util";
import "bootstrap/js/dist/dropdown";

import './style.scss';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
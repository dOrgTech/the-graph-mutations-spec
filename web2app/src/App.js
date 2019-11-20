import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Notifications from 'react-notify-toast';

import Home from './pages/home';

import { Container } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <Notifications />
      <Container>
        <Route exact path='/' component={Home} />
      </Container>
    </Router>
  );
}

export default App;

import React from 'react';
import { Route, Switch, NavLink } from "react-router-dom";
import Registration from './Registration';
import Login from './Login';
import Calendar from './Calendar';

class App extends React.Component {
  state = {
    userId: ''
  }

  componentWillMount = () => {
    if(!this.state.userId)
      this.auth();
  }

  auth = () => {
    fetch('/api/auth')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState({userId: result.id})
      })
      .catch(e => console.log(e));
  }

  logout = event => {
    event.preventDefault();

    fetch('/api/logout')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState({userId: ''})
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <div className="wrapper">
        <div className="section section__left">
          <div>
              
            {!this.state.userId ? (
              <ul>
                <li>
                  <NavLink to="/registration">Registration</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
              </ul>
            ) : (
              <ul>
                <li>
                  <NavLink to="/">Calendar</NavLink>
                </li>
                <li>
                  <a href="#" onClick={this.logout}>Logout</a>
                </li>
              </ul>
            )}
              
          </div>
        </div>
        <div className="section section__right">
          <Switch>
            <Route exact path="/" component={Calendar} />
            <Route path="/registration" component={Registration} />
            <Route path="/login" component={Login} />
            <Route render={() => <div>Not Found</div>} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App;

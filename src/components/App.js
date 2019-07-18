import React from 'react';
import { Route, Switch, NavLink } from "react-router-dom";
import Registration from './Registration';
import Login from './Login';
import Calendar from './Calendar';

export const AppContext = React.createContext();

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: '',
      userGroup: '',
      isLogin: false,
      logout: this.logout,
      toggleLogin: this.toggleLogin
    }
  }

  componentWillMount = () => {
    if(!this.state.userId)
      this.auth();
  }

  toggleLogin = (id, role) => {
    this.setState(state => {
      return {
        userId: state.userId ? '' : id,
        userGroup: state.userGroup ? '' : role,
        isLogin: !state.isLogin
      }
    });
  }

  auth = () => {
    fetch('/api/auth')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState({
          userId: result.id,
          userGroup: result.role,
          isLogin: true
        })
      })
      .catch(e => console.log(e));
  }

  logout = event => {
    event.preventDefault();

    fetch('/api/auth/logout')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState({
          userId: '',
          userGroup: '',
          isLogin: false
        })
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <AppContext.Provider value={this.state}>
        <Layout />
      </AppContext.Provider>
    )
  }
}

App.contextType = AppContext;

function Nav() {
  return (
    <AppContext.Consumer>
      {state => (
        <div className="list-group">
          {
            !state.userId ? (
              <React.Fragment>
                <NavLink to="/signup" className="list-group-item list-group-item-action">Sign up</NavLink>
                <NavLink to="/login" className="list-group-item list-group-item-action">Log in</NavLink>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <NavLink to="/" className="list-group-item list-group-item-action">Calendar</NavLink>
                <a href="#" className="list-group-item list-group-item-action" onClick={state.logout}>Log out</a>
              </React.Fragment>
            )
          }
        </div>
      )}
    </AppContext.Consumer>
  )
}

function Sidebar() {
  return (
    <div className="section section__left">
      <Nav />
    </div>
  )
}

function Welcome() {
  return (
    <div className="alert">
      <h1 className="alert-heading">Hello, Guest!</h1>
      <p className="lead">This is a test application for organizing your schedule, planning projects and vacations.</p>
      <hr className="my-4" />
      <p>To get started, please sign up.</p>
      <NavLink to="/signup" className="btn btn-primary btn-lg">Sign up</NavLink>
    </div>
  )
}

function Content() {
  return (
    <AppContext.Consumer>
      {app => (
        <div className="section section__right">
          <Switch>
            <Route exact path="/" component={app.isLogin ? () => <Calendar app={app} /> : () => <Welcome />} />
            <Route path="/signup" component={Registration} />
            <Route path="/login" component={Login} />
            <Route render={() => <div className="section__wrapper">Page Not Found</div>} />
          </Switch>
        </div>
      )}
    </AppContext.Consumer>
  )
}

function Layout() {
  return (
    <div className="wrapper">
      <Sidebar />
      <Content />
    </div>
  )
}

export default App;

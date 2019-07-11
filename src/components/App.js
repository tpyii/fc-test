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
    fetch('/fc-test/api/auth')
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

    fetch('/fc-test/api/logout')
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
        !state.userId ? (
          <ul>
            <li>
              <NavLink to="/fc-test/registration">Registration</NavLink>
            </li>
            <li>
              <NavLink to="/fc-test/login">Login</NavLink>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <NavLink to="/fc-test">Calendar</NavLink>
            </li>
            <li>
              <a href="#" onClick={state.logout}>Logout</a>
            </li>
          </ul>
        )
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

function Content() {
  return (
    <AppContext.Consumer>
      {app => (
        <div className="section section__right">
          <Switch>
            <Route exact path="/fc-test" component={app.isLogin ? Calendar : () => <div>Welcome!</div>} />
            <Route path="/fc-test/registration" component={Registration} />
            <Route path="/fc-test/login" component={Login} />
            <Route render={() => <div>Not Found</div>} />
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

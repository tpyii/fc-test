import React from 'react';
import { Route, Switch, NavLink, Redirect } from "react-router-dom";
import Registration from './Registration';
import Login from './Login';
import Calendar from './Calendar';
import Users from './Users';
import Orders from './Orders';
import Roles from './Roles';

export const AppContext = React.createContext();

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      logout: this.logout,
      toggleLogin: this.toggleLogin,
      checkAcl: this.checkAcl,
      setTitlePage: this.setTitlePage,
    }
  }

  componentWillMount = () => {
    if(!this.state.userId)
      this.auth();
  }

  componentDidMount = () => {
    this.setTitlePage()
  }

  setTitlePage = () => {
    let title = document.title.split(' - ')
    let pathname = location.pathname.split('/')[1] || 'Welcome'
    pathname = pathname.charAt(0).toUpperCase() + pathname.slice(1)
    if(title.length > 1)
      title.splice(0, 1)
    title.unshift(pathname)
    title = title.join(' - ')
    document.title = title;
  }

  toggleLogin = (data) => {
    this.setState({
      user: this.state.user ? {} : data,
    });

    return this.state.user;
  }

  auth = () => {
    fetch('/api/auth')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          this.setState({
            user: {},
          })
          return;
        }

        this.setState({
          user: result,
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
          user: {},
        })

        this.setTitlePage();
      })
      .catch(e => console.log(e));
  }

  checkAcl = (title, section, method) => {
    const acl = this.state.user.acl.find(a => a.title === title)
    if(!acl)
      return false;

    return acl.settings[section][method]
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

function Routers() {
  return (
    <AppContext.Consumer>
      {app => (
        <Switch>
          <Route exact path="/" component={() => !app.user.id ? <Welcome /> : <Redirect to="/calendar" />} />
          <Route path="/calendar" component={() => app.user.id ? <Calendar app={app} /> : <Redirect to="/" />} />
          <Route path="/roles" component={() => app.user.id && app.checkAcl('Roles', 'main', 'show') === true ? <Roles app={app} /> : <Redirect to="/" />} />
          <Route path="/orders" component={() => app.user.id && app.checkAcl('Orders', 'main', 'show') === true ? <Orders app={app} /> : <Redirect to="/" />} />
          <Route path="/users" component={() => app.user.id && app.checkAcl('Users', 'main', 'show') === true ? <Users app={app} /> : <Redirect to="/" />} />
          <Route path="/signup" component={() => !app.user.id ? <Registration app={app} /> : <Redirect to="/calendar" />} />
          <Route path="/login" component={() => !app.user.id ? <Login app={app} /> : <Redirect to="/calendar" />} />
          <Route render={PageNotFoud} />
        </Switch>
      )}
    </AppContext.Consumer>
  )
}

function Nav() {
  return (
    <AppContext.Consumer>
      {state => (
        <div className="list-group">
          {
            !state.user.id ? (
              <React.Fragment>
                <NavLink to="/signup" className="list-group-item list-group-item-action">Sign up</NavLink>
                <NavLink to="/login" className="list-group-item list-group-item-action">Log in</NavLink>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {state.user.acl.map(acl => {
                  return acl.settings.main.show === true && <NavLink to={`/${acl.title.toLowerCase()}`} className="list-group-item list-group-item-action">{acl.title}</NavLink>
                })}
                <a href="#" className="list-group-item list-group-item-action" onClick={state.logout}>Log out</a>
              </React.Fragment>
            )
          }
        </div>
      )}
    </AppContext.Consumer>
  )
}

function PageNotFoud() {
  return <div className="section__wrapper">Page Not Found</div>
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
    <div className="section section__right">
      <Routers />
    </div>
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

import React from 'react';
import { AppContext } from './App';
import { Redirect } from "react-router-dom";


class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userEmail: '',
      userPassword: '',
      recovery: false,
      error: '',
    }
  }

  componentDidMount = () => {
    this.props.app.setTitlePage()
  }
  
  handleInputChange = event => {
    const target = event.target;
    const name = target.name;
    let value = '';

    if(target.type === 'checkbox')
      value = target.checked;
    else if(target.type === 'select-multiple') {
      const options = target.options;
      value = [];
      for(let i = 0; i < options.length; i++) {
        if(options[i].selected) 
          value.push(options[i].value);
      }
    }
    else
      value = target.value;

    this.setState({
      [name]: value
    });
  }

  recovery = () => {
    if(!this.state.userEmail.trim().length)
      return false;

    fetch('/api/auth/recovery', {
      method: 'POST',
      body: JSON.stringify({
        email: this.state.userEmail,
      }),
      headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        this.setState({error: result.error})
        return;
      }

      this.setState({recovery: true})
    })
    .catch(e => console.log(e));
  }

  login = toggleLogin => {
    event.preventDefault()

    if(!this.state.userEmail.trim().length || !this.state.userPassword.trim().length)
      return false;

    fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: this.state.userEmail,
        password: this.state.userPassword
      }),
      headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        this.setState({error: result.error})
        return;
      }

      toggleLogin(result)
      location = location.protocol + '//' + location.hostname + '/calendar';
    })
    .catch(e => console.log(e));
  }

  render() {
    if(this.state.recovery)
      return <Redirect to='/recovery' />

    return (
      <div className="wrapper">
        <div className="section section__left">
          <AppContext.Consumer>
            {app => (
              <form className="card" onSubmit={() => this.login(app.toggleLogin)}>
                <h5 className="card-header bg-white">Login</h5>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="userEmail">Email address</label>
                    <input 
                      type="email"
                      className="form-control"
                      id="userEmail"
                      placeholder="email@example.com"
                      name="userEmail"
                      value={this.state.userEmail}
                      onChange={this.handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-group">
                      <input 
                        type="password" 
                        className="form-control" 
                        id="password" 
                        placeholder="Password"
                        name="userPassword" 
                        value={this.state.userPassword}  
                        onChange={this.handleInputChange}
                      />
                      <div className="input-group-append">
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          disabled={!this.state.userEmail.trim().length}
                          onClick={this.recovery}
                        >
                          Recovery
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {this.state.error && (
                  <div className="card-footer bg-white">
                    <small className="text-danger">{this.state.error}</small>
                  </div>
                )}
                <div className="card-footer bg-white">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={
                      !this.state.userEmail.trim().length ||
                      !this.state.userPassword.length
                    }
                  >
                    Log in
                  </button>
                </div>
              </form>
            )}
          </AppContext.Consumer>
        </div>
        <div className="section section__right">
        </div>
      </div>
    );
  }
}

export default Login;

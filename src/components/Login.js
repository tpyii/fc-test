import React from 'react';
import { AppContext } from './App';


class Login extends React.Component {
  state = {
    userEmail: '',
    userPassword: '',
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

  login = (event, toggleLogin) => {
    event.preventDefault();

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
        return;
      }

      toggleLogin(result)
      location = location.protocol + '//' + location.hostname + '/calendar';
    })
    .catch(e => console.log(e));
  }

  render() {
    return (
      <div className="wrapper">
        <div className="section section__left">
          <AppContext.Consumer>
            {app => (
              <form className="card" onSubmit={e => this.login(e, app.toggleLogin)}>
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
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password" 
                      placeholder="Password"
                      name="userPassword" 
                      value={this.state.userPassword}  
                      onChange={this.handleInputChange}
                    />
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
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

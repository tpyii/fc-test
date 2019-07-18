import React from 'react';
import { Redirect } from 'react-router';

class Registration extends React.Component {
  state = {
    userEmail: '',
    userPassword: '',
    isRegistration: false,
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

  addUser = event => {
    event.preventDefault();

    if(!this.state.userEmail.trim().length || 
       !this.state.userPassword.trim().length)
      return false;

    const body = {
      email: this.state.userEmail,
      password: this.state.userPassword
    }

    fetch('/api/auth/registration', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        console.log(result.error)
        return;
      }

      if(result)
        this.setState({isRegistration: true})
    })
    .catch(e => console.log(e));
  }

  render() {
    if(this.state.isRegistration)
      return <Redirect to="/login" />

    return (
      <div className="wrapper">
        <div className="section section__left">
          <form onSubmit={this.addUser} className="dropdown-menu px-4 py-3">
            <h3>Registration</h3>
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
            <button 
              type="submit" 
              className="btn btn-primary" 
            >
              Sign up
            </button>
          </form>
        </div>
        <div className="section section__right">
        </div>
      </div>
    );
  }
}

export default Registration;

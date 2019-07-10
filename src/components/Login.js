import React from 'react';

class Login extends React.Component {
  state = {
    userEmail: '',
    userPassword: ''
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

  login = event => {
    event.preventDefault();

    if(!this.state.userEmail.trim().length || !this.state.userPassword.trim().length)
      return false;

    fetch('/fc-test/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: this.state.userEmail,
        password: this.state.userPassword
      }),
      headers: {'content-type': 'application/json'}
    })
    .then(function(response) {
      console.log(response.status);
      return response.json();
    })
    .then(function(data) {
      console.log(data)
    })
    .catch(alert);
  }

  render() {
    return (
      <div className="wrapper">
        <div className="section section__left">
          <div className="section__form">
            <h3>Login</h3>
            <form onSubmit={this.login}>
              <p>
                <label>
                  Email: <br />
                  <input 
                    type="email"
                    name="userEmail" 
                    value={this.state.userEmail} 
                    onChange={this.handleInputChange} 
                  />
                </label>
              </p>
              <p>
                <label>
                  Password: <br />
                  <input 
                    type="password"
                    name="userPassword" 
                    value={this.state.userPassword}  
                    onChange={this.handleInputChange}
                  />
                </label>
              </p>
              <p>
                <input type="submit" value="Login" />
              </p>
            </form>
          </div>
        </div>
        <div className="section section__right">
        </div>
      </div>
    );
  }
}

export default Login;

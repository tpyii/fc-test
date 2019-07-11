import React from 'react';

class Registration extends React.Component {
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

  addUser = event => {
    event.preventDefault();

    if(!this.state.userEmail.trim().length || 
       !this.state.userPassword.trim().length)
      return false;

    const body = {
      email: this.state.userEmail,
      password: this.state.userPassword
    }

    fetch('/fc-test/api/users', {
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

      location.href = '/fc-test/login';
    })
    .catch(e => console.log(e));
  }

  render() {
    return (
      <div className="wrapper">
        <div className="section section__left">
          <div className="section__form">
            <h3>Registration</h3>
            <form onSubmit={this.addUser}>
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
                <input type="submit" value="Registration" />
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

export default Registration;

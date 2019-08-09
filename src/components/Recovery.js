import React from 'react';
import { Redirect } from "react-router-dom";

class Recovery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      secretKey: '',
      userPassword: '',
      complete: false,
    }

    console.log(this, props)
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
    event.preventDefault();

    if(!this.state.secretKey.trim().length || !this.state.userPassword.trim().length)
      return false;

    fetch('/api/auth/recovery', {
      method: 'PUT',
      body: JSON.stringify({
        key: this.state.secretKey,
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

      this.setState({complete: true})
    })
    .catch(e => console.log(e));
  }

  render() {
    if(this.state.complete)
      return <Redirect to="/login" />

    return (
      <div className="wrapper">
        <div className="section section__left">
          <form className="card" onSubmit={this.recovery}>
            <h5 className="card-header bg-white">Recovery</h5>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="secretKey">Key</label>
                <input 
                  type="input"
                  className="form-control"
                  id="secretKey"
                  name="secretKey"
                  value={this.state.secretKey}
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="form-group">
                  <label htmlFor="userPassword">New password</label>
                  <input 
                    type="password"
                    className="form-control"
                    id="userPassword"
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
                disabled={
                  !this.state.secretKey.trim().length ||
                  !this.state.userPassword.trim().length
                }
              >
                Recovery
              </button>
            </div>
          </form>
        </div>
        <div className="section section__right">
        </div>
      </div>
    );
  }
}

export default Recovery;

import React from 'react';
export const UsersContext = React.createContext();

class Users extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      userId: '',
      userEmail: '',
      userEditing: false,

      handleInputChange: this.handleInputChange,
      updateUser: this.updateUser,
      handleDeleteUser: this.handleDeleteUser,
      handleCancelEditUser: this.handleCancelEditUser,
      editUser: this.editUser
    }
  }

  componentWillMount = () => {
    this.fetchUsers();
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

    this.setState({[name]: value});
  }

  updateUser = e => {
    e.preventDefault();

    if(!this.state.userEmail.trim().length ||
       !this.state.userId.length)
      return;

    const user = {
      email: this.state.userEmail
    }

    fetch(`/api/users/${this.state.userId}`, {
      method: 'PUT',
      body: JSON.stringify(user),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        return;
      }

      if(result) {
        const users = this.state.users.map(user => {
          if(user.id == this.state.userId)
            return {...user, ...result}

          return user;
        });

        this.setState({
          userId: '',
          userEmail: '',
          userEditing: false,
          users
        })
      }
    })
    .catch(e => console.log(e));
  }

  handleDeleteUser = e => {
    e.preventDefault();

    if(!this.state.userId)
      return;

    fetch(`/api/users/${this.state.userId}`, {
      method: 'DELETE'
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        return;
      }

      if(result) {
        const users = this.state.users.filter(user => user.id != result)
      
        this.setState({
          userId: '',
          userEmail: '',
          userEditing: false,
          users
        });
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditUser = e => {
    e.preventDefault();
    this.setState({
      userId: '',
      userEmail: '',
      userEditing: false
    })
  }

  editUser = user => {
    this.setState({
      userEmail: user.email,
      userId: user.id,
      userEditing: true
    })
  }

  fetchUsers = () => {    
    fetch('/api/users')
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result)
          this.setState({users: result})
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <UsersContext.Provider value={this.state}>
        <Layout />
      </UsersContext.Provider>
    )
  }
}

Users.contextType = UsersContext;

function Layout() {
  return (
    <div className="wrapper">
      <div className="section section__left">
        <UsersForm />
      </div>
      <div className="section section__right">
        <UsersTable />
      </div>
    </div>
  )
}

function UsersForm() {
  return (
    <UsersContext.Consumer>
      {context => (
        <form className="form-group card" onSubmit={context.updateUser}>
          <h5 className="card-header bg-white">Edit User</h5>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="userEmail">Email</label>
              <input 
                type="email" 
                className="form-control" 
                id="userEmail" 
                name="userEmail" 
                value={context.userEmail} 
                onChange={context.handleInputChange} 
              />
            </div>
            <input type="hidden" value={context.userId} />
          </div>
          <div className="card-footer bg-white">
            <div className="btn-group">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!context.userEmail.trim().length}
              >
                Update
              </button>
              {context.userEditing && <button type="button" className="btn btn-primary" onClick={context.handleDeleteUser}>Delete</button>}
              {context.userEditing && <button type="button" className="btn btn-primary" onClick={context.handleCancelEditUser}>Cancel</button>}
            </div>
          </div>
        </form>
      )}
    </UsersContext.Consumer>
  )
}

function UsersTable() {
  return (
    <UsersContext.Consumer>
      {context => (
        <table class="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Email</th>
            </tr>
          </thead>
          <tbody>
          {context.users.map(user => {
            return (
              <tr key={user.id} onClick={() => context.editUser(user)}>
                <th scope="row">{user.id}</th>
                <td>{context.userEditing && context.userId == user.id ? context.userEmail : user.email}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
      )}
    </UsersContext.Consumer>
  )
}

export default Users;
import React from 'react';
import Select from 'react-select';
import Pagination from './Pagination';
export const UsersContext = React.createContext();

class Users extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      userId: '',
      userEmail: '',
      userRole: '',
      userEditing: false,
      error: '',

      roles: [],
      settings: [],
      dsettings: [],

      pagination: {},

      handleInputChange: this.handleInputChange,
      updateUser: this.updateUser,
      handleDeleteUser: this.handleDeleteUser,
      handleCancelEditUser: this.handleCancelEditUser,
      editUser: this.editUser,
      getRoleTitle: this.getRoleTitle,
      handleSelectChange: this.handleSelectChange,
      handleInputChangeSwitch: this.handleInputChangeSwitch,
      handleInputChangeSelect: this.handleInputChangeSelect,
      handleInputChangeInput: this.handleInputChangeInput,
      fetchUsers: this.fetchUsers,
    }
  }

  componentWillMount = () => {
    this.fetchUsers();
    this.fetchRoles();
    this.fetchSettings();
  }

  componentDidMount = () => {
    this.props.app.setTitlePage()
  }

  handleSelectChange = (name, value) => {
    this.setState({[name]: value || ''});
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

  handleInputChangeInput = (title, section, option) => {
    const value = event.target.value;

    const settings = this.state.dsettings.map(d => {
      let a = this.state.settings.filter(o => o.title === d.title)[0]
      
      if(!a)
        a = d

      if(!a.settings.hasOwnProperty(section) ||
         !a.settings[section].hasOwnProperty(option)) {
        a = {
          ...a,
          settings: {
            ...a.settings,
            [section]: {
                ...d.settings[section],
                [option]: d.settings[section][option]
            }
          }
        }
      }

      if(d.title == title) {
        return (
          {...a, 
            settings: {
              ...a.settings,
              [section]: {
                ...a.settings[section],
                [option]: value || ''
              }
            }
          }
        )
      }

      return a;
    })

    this.setState({settings})
  }

  handleInputChangeSwitch = (title, section, option) => {
    const settings = this.state.dsettings.map(d => {
      let a = this.state.settings.filter(o => o.title === d.title)[0]
      
      if(!a)
        a = d

      if(!a.settings.hasOwnProperty(section) ||
         !a.settings[section].hasOwnProperty(option)) {
        a = {
          ...a,
          settings: {
            ...a.settings,
            [section]: {
                ...d.settings[section],
                [option]: d.settings[section][option]
            }
          }
        }
      }
        

      if(d.title == title) {
        return (
          {...a, 
            settings: {
              ...a.settings,
              [section]: {
                ...a.settings[section],
                [option]: !a.settings[section][option]
              }
            }
          }
        )
      }

      return a;
    })

    this.setState({settings})
  }

  handleInputChangeSelect = (title, section, option, select) => {
    const settings = this.state.dsettings.map(d => {
      let a = this.state.settings.filter(o => o.title === d.title)[0]
      
      if(!a)
        a = d

      if(!a.settings.hasOwnProperty(section) ||
         !a.settings[section].hasOwnProperty(option)) {
        a = {
          ...a,
          settings: {
            ...a.settings,
            [section]: {
                ...d.settings[section],
                [option]: d.settings[section][option]
            }
          }
        }
      }

      if(d.title == title) {
        return (
          {...a, 
            settings: {
              ...a.settings,
              [section]: {
                ...a.settings[section],
                [option]: select || []
              }
            }
          }
        )
      }

      return a;
    })

    this.setState({settings})
  }

  updateUser = e => {
    e.preventDefault();

    if(!this.state.userEmail.trim().length ||
       !this.state.userRole.length         ||
       !this.state.userId.length)
      return;

    const user = {
      email: this.state.userEmail,
      role: this.state.userRole,
      settings: this.state.settings,
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
        this.setState({error: result.error})
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
          userRole: '',
          userEditing: false,
          users,
          settings: this.state.dsettings,
          error: '',
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
        this.setState({error: result.error})
        return;
      }

      if(result) {
        const users = this.state.users.filter(user => user.id != result)
        let page = this.state.pagination.page

        if(!users.length) {
          page = page == this.state.pagination.links[this.state.pagination.links.length - 1].label 
                 && page != 1 
                  ? --page
                  : page;
        }

        this.setState({
          userId: '',
          userEmail: '',
          userRole: '',
          userEditing: false,
          settings: this.state.dsettings,
          error: '',
        });

        this.fetchUsers(page)
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditUser = e => {
    e.preventDefault();
    this.setState({
      userId: '',
      userEmail: '',
      userRole: '',
      userEditing: false,
      settings: this.state.dsettings,
      error: '',
    })
  }

  editUser = user => {
    this.setState({
      userRole: user.role,
      userEmail: user.email,
      userId: user.id,
      userEditing: true,
      settings: user.settings,
      error: '',
    })
  }

  fetchUsers = page => {
    if(event)
      event.preventDefault();

    const url = page ? `/api/users/page/${page}` : '/api/users/page/1';

    fetch(url)
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result) {
          this.setState({
            users: result.users,
            pagination: result.pagination,
          })
        }
      })
      .catch(e => console.log(e));
  }

  fetchRoles = () => {    
    fetch('/api/roles')
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result)
          this.setState({roles: result})
      })
      .catch(e => console.log(e));
  }

  fetchSettings = () => {
    fetch('/api/users/settings')
      .then(responce => responce.json())
      .then(result => {
        if(result) {
          this.setState({
            settings: result,
            dsettings: result
          })
        }
      })
      .catch(e => console.log(e));
  }

  getRoleTitle = user => {
    if(!this.state.roles.length)
      return '';

    const r = this.state.roles.filter(role => {
      if(this.state.userEditing && this.state.userId == user.id)
        return this.state.userRole == role.id
      else
        return user.role == role.id
    })[0]

    return r.title || ''
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
    <UsersContext.Consumer>
      {context => (
        <div className="wrapper">
          <div className="section section__left">
            <UsersForm />
          </div>
          <div className="section section__right">
            <div className="section__wrapper">
              <UsersTable />
              <Pagination 
                pagination={context.pagination} 
                changePage={context.fetchUsers} 
              />
            </div>
          </div>
        </div>
      )}
    </UsersContext.Consumer>
  )
}

function Input({section, option, settings, dsettings}) {
  const title = dsettings.title;
  const value = !settings.settings.hasOwnProperty(section) 
                  ? ''
                  : settings.settings[section].hasOwnProperty(option)
                  ? settings.settings[section][option]
                  : '';
  const id = `${title.toLowerCase()}${option}`;

  return (
    <UsersContext.Consumer>
      {context => (
        <React.Fragment>
          <label htmlFor={id}>{option}</label>
          <input 
            type="text" 
            className="form-control" 
            id={id} 
            name={option} 
            value={value}
            onChange={() => context.handleInputChangeInput(title, section, option)} 
          />
        </React.Fragment>
      )}
    </UsersContext.Consumer>
  )
}

function Time({section, option, settings, dsettings}) {
  const title = dsettings.title;
  const value = !settings.settings.hasOwnProperty(section) 
                  ? '00:00'
                  : settings.settings[section].hasOwnProperty(option)
                  ? settings.settings[section][option]
                  : '00:00';
  const id = `${title.toLowerCase()}${option}`;

  return (
    <UsersContext.Consumer>
      {context => (
        <React.Fragment>
          <label htmlFor={id}>{option}</label>
          <input 
            type="time" 
            className="form-control" 
            id={id} 
            name={option} 
            value={value}
            onChange={() => context.handleInputChangeInput(title, section, option)} 
          />
        </React.Fragment>
      )}
    </UsersContext.Consumer>
  )
}

function Switch({section, option, settings, dsettings}) {
  const title = dsettings.title;
  const value = !settings.settings.hasOwnProperty(section) 
                  ? false
                  : settings.settings[section].hasOwnProperty(option)
                  ? settings.settings[section][option]
                  : false;
  const id = `${title.toLowerCase()}${option}`;

  return (
    <UsersContext.Consumer>
      {context => (
        <div className="custom-control custom-switch">
          <input 
            name={option}
            value={value}
            checked={value}
            type="checkbox" 
            className="custom-control-input" 
            id={id}
            onChange={() => context.handleInputChangeSwitch(title, section, option)} 
          />
          <label 
            className="custom-control-label" 
            htmlFor={id}
          >
            {option}
          </label>
        </div>
      )}
    </UsersContext.Consumer>
  )
}

function MySelect({section, option, settings, dsettings}) {
  const title = dsettings.title;
  const value = !settings.settings.hasOwnProperty(section) 
                  ? {}
                  : settings.settings[section].hasOwnProperty(option)
                  ? settings.settings[section][option]
                  : {};
  const id = `${title.toLowerCase()}${option}`;

  let values = dsettings.settings[section][option]
  let isMulti = false

  if(section === 'businessHours') {
    isMulti = true
    values = [
      {
        id: 0,
        title: 'Sunday'
      },
      {
        id: 1,
        title: 'Monday'
      },
      {
        id: 2,
        title: 'Tuesday'
      },
      {
        id: 3,
        title: 'Wednesday'
      },
      {
        id: 4,
        title: 'Thursday'
      },
      {
        id: 5,
        title: 'Friday'
      },
      {
        id: 6,
        title: 'Saturday'
      }
    ]
  }

  return (
    <UsersContext.Consumer>
      {context => (
        <React.Fragment>
          <label htmlFor={id}>{option}</label>
          <Select
            placeholder=""
            isMulti={isMulti}
            isClearable
            id={id}
            name={option}
            onChange={(select) => context.handleInputChangeSelect(title, section, option, select)}
            options={values}
            getOptionLabel={(select) => select.title}
            getOptionValue={(select) => select.id}
            value={context.userEditing && value}
          />
        </React.Fragment>
      )}
    </UsersContext.Consumer>
  )
}

function Section({section, settings, dsettings}) {
  const keys = Object.keys(dsettings.settings[section]);
  const options = keys.map(option => {

    const input = option === 'daysOfWeek' || option === 'group'
      ? <MySelect section={section} option={option} settings={settings} dsettings={dsettings} />
      : option === 'startTime' || option === 'endTime'
      ? <Time section={section} option={option} settings={settings} dsettings={dsettings} />
      : option === 'resourceText'
      ? <Input section={section} option={option} settings={settings} dsettings={dsettings} />
      : <Switch section={section} option={option} settings={settings} dsettings={dsettings} />

    return (
      <li key={`${dsettings.title}${section}${option}`} className="list-group-item">
        {input}
      </li>
    )
  })

  return (
    <React.Fragment>
      <li className="list-group-item">
        {section}
      </li>
      {options}
    </React.Fragment>
  )
}

function Settings({settings, dsettings}) {
  const keys = Object.keys(dsettings.settings)
  const sections = keys.map(section => {
    return (
      <Section key={`${dsettings.title}${section}`} section={section} settings={settings} dsettings={dsettings} />
    )
  })

  return (
    <ul className="list-group list-group-flush collapse" id={`collapse${dsettings.title}`} data-parent="#accordionSettings">
      {sections}
    </ul>
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
            <div className="form-group">
              <label htmlFor="userRole">Role</label>
              <Select
                placeholder=""
                id="userRole"
                name="userRole"
                onChange={(option) => context.handleSelectChange('userRole', option.id)}
                options={context.roles}
                getOptionLabel={(option) => option.title}
                getOptionValue={(option) => option.id}
                value={context.userEditing && context.roles.filter(role => role.id === context.userRole)}
              />
            </div>
            <label>Settings</label>
            <div className="accordion" id="accordionSettings">
              {context.dsettings.map(dsettings => {
                const settings = context.settings.filter(settings => dsettings.title === settings.title)[0]
                return (
                  <div key={dsettings.title}>
                    <a href="#" className="list-group-item list-group-item-action" data-toggle="collapse" data-target={`#collapse${dsettings.title}`}>{dsettings.title}</a>
                    <Settings settings={settings} dsettings={dsettings} />
                  </div>
                )
              })}
            </div>
            <input type="hidden" value={context.userId} />
          </div>
          {context.error && (
            <div className="card-footer bg-white">
              <small className="text-danger">{context.error}</small>
            </div>
          )}
          <div className="card-footer bg-white">
            <div className="btn-group">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={
                  !context.userEmail.trim().length ||
                  !context.userRole.length
                }
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
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
          {context.users.map(user => {
            return (
              <tr key={user.id} onClick={() => context.editUser(user)}>
                <th scope="row">{user.id}</th>
                <td>{context.userEditing && context.userId == user.id ? context.userEmail : user.email}</td>
                <td>{context.getRoleTitle(user)}</td>
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

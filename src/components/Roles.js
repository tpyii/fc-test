import React from 'react';
import Pagination from './Pagination';
export const RolesContext = React.createContext();

class Roles extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      roleId: '',
      roleTitle: '',
      roleEditing: false,
      error: '',

      roles: [],
      acl: [],
      dacl: [],

      pagination: {},

      handleInputChangeAcl: this.handleInputChangeAcl,
      handleInputChange: this.handleInputChange,
      updateRole: this.updateRole,
      handleDeleteRole: this.handleDeleteRole,
      handleCancelEditRole: this.handleCancelEditRole,
      editRole: this.editRole,
      addRole: this.addRole,
      fetchRoles: this.fetchRoles,
    }
  }

  componentWillMount = () => {
    this.fetchRoles();
    this.fetchAcl();
  }

  componentDidMount = () => {
    this.props.app.setTitlePage()
  }

  handleInputChangeAcl = (title, section, option) => {

    const acl = this.state.dacl.map(d => {
      let a = this.state.acl.filter(o => o.title === d.title)[0]
      
      if(!a)
        a = d

      if(d.title == title) {
        return (
          {...a, 
            settings: {
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

    this.setState({acl})
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

  addRole = event => {
    event.preventDefault();

    if(!this.state.roleTitle.trim().length)
      return false;

    const role = {
      title: this.state.roleTitle,
      acl: this.state.acl,
    }

    fetch('/api/roles', {
      method: 'POST',
      body: JSON.stringify(role),
      headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        console.log(result.error)
        this.setState({error: result.error})
        return;
      }

      if(result) {
        const roles = [...this.state.roles, result]
        let page = this.state.pagination.page

        if(roles.length > this.state.pagination.limit)
          page = page == 1 ? page : ++page;

        this.setState(state => {
          return {
            roleTitle: '',
            acl: state.dacl,
            error: '',
          }
        })

        this.fetchRoles(page)
      }
    })
    .catch(e => console.log(e));
  }

  updateRole = e => {
    e.preventDefault();

    if(!this.state.roleTitle.trim().length)
      return;

    const role = {
      title: this.state.roleTitle,
      acl: this.state.acl
    }

    fetch(`/api/roles/${this.state.roleId}`, {
      method: 'PUT',
      body: JSON.stringify(role),
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
        const roles = this.state.roles.map(role => {
          if(role.id == this.state.roleId)
            return {...role, ...result}

          return role;
        });

        this.setState(state => {
          return {
            roleId: '',
            roleTitle: '',
            roleEditing: false,
            roles,
            acl: state.dacl,
            error: '',
          }
        })
      }
    })
    .catch(e => console.log(e));
  }

  handleDeleteRole = e => {
    e.preventDefault();

    if(!this.state.roleId)
      return;

    fetch(`/api/roles/${this.state.roleId}`, {
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
        const roles = this.state.roles.filter(role => role.id != result)
        let page = this.state.pagination.page

        if(!roles.length) {
          page = page == this.state.pagination.links[this.state.pagination.links.length - 1].label 
                 && page != 1 
                  ? --page
                  : page;
        }
      
        this.setState(state => {
          return {
            roleId: '',
            roleTitle: '',
            roleEditing: false,
            acl: state.dacl,
            error: '',
          }
        });

        this.fetchRoles(page)
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditRole = e => {
    e.preventDefault();
    this.setState(state => {
      return {
        roleId: '',
        roleTitle: '',
        roleEditing: false,
        acl: state.dacl,
        error: '',
      }
    })
  }

  editRole = role => {
    this.setState({
      roleTitle: role.title,
      roleId: role.id,
      roleEditing: true,
      acl: role.acl,
      error: '',
    })
  }

  fetchRoles = page => {
    if(event)
      event.preventDefault();

    const url = page ? `/api/roles/page/${page}` : '/api/roles/page/1';

    fetch(url)
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result) {
          this.setState({
            roles: result.roles,
            pagination: result.pagination,
          })
        }
      })
      .catch(e => console.log(e));
  }

  fetchAcl = () => {
    fetch('/api/roles/acl')
      .then(responce => responce.json())
      .then(result => {
        if(result) {
          this.setState({
            acl: result,
            dacl: result
          })
        }
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <RolesContext.Provider value={this.state}>
        <Layout />
      </RolesContext.Provider>
    )
  }
}

Roles.contextType = RolesContext;

function Layout() {
  return (
    <RolesContext.Consumer>
      {context => (
        <div className="wrapper">
          <div className="section section__left">
            <RolesForm />
          </div>
          <div className="section section__right">
            <div className="section__wrapper">
              <RolesTable />
              <Pagination 
                pagination={context.pagination} 
                changePage={context.fetchRoles} 
              />
            </div>
          </div>
        </div>
      )}
    </RolesContext.Consumer>
  )
}

function Switch({section, option, acl, dacl}) {
  const title = dacl.title;
  const value = acl ? acl.settings[section][option] : false;
  const id = `${title.toLowerCase()}${option}`;

  return (
    <RolesContext.Consumer>
      {context => (
        <div className="custom-control custom-switch">
          <input 
            name={option}
            value={value}
            checked={value}
            type="checkbox" 
            className="custom-control-input" 
            id={id}
            disabled={title === 'Calendar' && option === 'show'}
            onChange={() => context.handleInputChangeAcl(title, section, option)} 
          />
          <label 
            className="custom-control-label" 
            htmlFor={id}
          >
            {option}
          </label>
        </div>
      )}
    </RolesContext.Consumer>
  )
}

function Section({section, acl, dacl}) {
  const keys = Object.keys(dacl.settings[section]);
  const options = keys.map(option => {
    return (
      <li key={`${dacl.title}${section}${option}`} className="list-group-item">
        <Switch section={section} option={option} acl={acl} dacl={dacl} />
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

function Settings({acl, dacl}) {
  const keys = Object.keys(dacl.settings)
  const sections = keys.map(section => {
    return (
      <Section key={`${dacl.title}${section}`} section={section} acl={acl} dacl={dacl} />
    )
  })

  return (
    <ul className="list-group list-group-flush collapse" id={`collapse${dacl.title}`} data-parent="#accordionAcl">
      {sections}
    </ul>
  )
}

function RolesForm() {
  return (
    <RolesContext.Consumer>
      {context => (
        <form className="card" onSubmit={context.roleEditing ? context.updateRole : context.addRole}>
          <h5 className="card-header bg-white">{context.roleEditing ? 'Edit' : 'Add'} role</h5>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="roleTitle">Title</label>
              <input 
                type="text" 
                className="form-control" 
                id="roleTitle" 
                name="roleTitle" 
                value={context.roleTitle}
                onChange={context.handleInputChange} 
              />
            </div>
            <label>Acl</label>
            <div className="accordion" id="accordionAcl">
              {context.dacl.map(dacl => {
                const acl = context.acl.filter(acl => dacl.title === acl.title)[0]
                return (
                  <div key={dacl.title}>
                    <a href="#" className="list-group-item list-group-item-action" data-toggle="collapse" data-target={`#collapse${dacl.title}`}>{dacl.title}</a>
                    <Settings acl={acl} dacl={dacl} />
                  </div>
                )
              })}
            </div>
            <input type="hidden" value={context.roleId} />
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
                disabled={!context.roleTitle.trim().length}
              >
                {context.roleEditing ? 'Update' : 'Add'}
              </button>
              {context.roleEditing && <button type="button" className="btn btn-primary" onClick={context.handleDeleteRole}>Delete</button>}
              {
                context.roleTitle.trim().length
                  ? <button type="button" className="btn btn-primary" onClick={context.handleCancelEditRole}>Cancel</button>
                  : false
              }
            </div>
          </div>
        </form>
      )}
    </RolesContext.Consumer>
  )
}

function RolesTable() {
  return (
    <RolesContext.Consumer>
      {context => (
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
            </tr>
          </thead>
          <tbody>
          {context.roles.map(role => {
            return (
              <tr key={role.id} onClick={() => context.editRole(role)}>
                <th scope="row">{role.id}</th>
                <td>{context.roleEditing && context.roleId == role.id ? context.roleTitle : role.title}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
      )}
    </RolesContext.Consumer>
  )
}

export default Roles;

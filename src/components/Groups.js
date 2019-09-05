import React from 'react';
import Pagination from './Pagination';
export const GroupsContext = React.createContext();

class Groups extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: [],
      groupId: '',
      groupTitle: '',
      groupEditing: false,
      error: '',

      pagination: {},

      handleInputChange: this.handleInputChange,
      addGroup: this.addGroup,
      updateGroup: this.updateGroup,
      handleDeleteGroup: this.handleDeleteGroup,
      handleCancelEditGroup: this.handleCancelEditGroup,
      editGroup: this.editGroup,
      fetchGroups: this.fetchGroups,
    }
  }

  componentWillMount = () => {
    this.fetchGroups();
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

    this.setState({[name]: value});
  }

  addGroup = event => {
    event.preventDefault();

    if(!this.state.groupTitle.trim().length)
      return false;

    const group = {
      title: this.state.groupTitle
    }

    fetch('/api/groups', {
      method: 'POST',
      body: JSON.stringify(group),
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
        const groups = [...this.state.groups, result]
        let page = this.state.pagination.page

        if(groups.length > this.state.pagination.limit)
          page = page == 1 ? page : ++page;

        this.setState({
          groupTitle: '',
          error: '',
        })
        this.fetchGroups(page)
      }
    })
    .catch(e => console.log(e));
  }

  updateGroup = e => {
    e.preventDefault();

    if(!this.state.groupTitle.trim().length ||
       !this.state.groupId.length)
      return;

    const group = {
      title: this.state.groupTitle,
    }

    fetch(`/api/groups/${this.state.groupId}`, {
      method: 'PUT',
      body: JSON.stringify(group),
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
        const groups = this.state.groups.map(group => {
          if(group.id == this.state.groupId)
            return {...group, ...result}

          return group;
        });

        this.setState({
          groupId: '',
          groupTitle: '',
          groupEditing: false,
          groups,
          error: '',
        })
      }
    })
    .catch(e => console.log(e));
  }

  handleDeleteGroup = e => {
    e.preventDefault();

    if(!this.state.groupId)
      return;

    fetch(`/api/groups/${this.state.groupId}`, {
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
        const groups = this.state.groups.filter(group => group.id != result)
        let page = this.state.pagination.page

        if(!groups.length) {
          page = page == this.state.pagination.links[this.state.pagination.links.length - 1].label 
                 && page != 1 
                  ? --page
                  : page;
        }

        this.setState({
          groupId: '',
          groupTitle: '',
          groupEditing: false,
          error: '',
        });

        this.fetchGroups(page)
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditGroup = e => {
    e.preventDefault();
    this.setState({
      groupId: '',
      groupTitle: '',
      groupEditing: false,
      error: '',
    })
  }

  editGroup = group => {
    this.setState({
      groupTitle: group.title,
      groupId: group.id,
      groupEditing: true,
      error: '',
    })
  }

  fetchGroups = page => {
    if(event)
      event.preventDefault();

    const url = page ? `/api/groups/page/${page}` : '/api/groups/page/1';

    fetch(url)
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        if(result) {
          this.setState({
            groups: result.groups,
            pagination: result.pagination,
          })
        }
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <GroupsContext.Provider value={this.state}>
        <Layout />
      </GroupsContext.Provider>
    )
  }
}

Groups.contextType = GroupsContext;

function Layout() {
  return (
    <GroupsContext.Consumer>
      {context => (
        <div className="wrapper">
          <div className="section section__left">
            <GroupsForm />
          </div>
          <div className="section section__right">
            <div className="section__wrapper">
              <GroupsTable />
              <Pagination 
                pagination={context.pagination} 
                changePage={context.fetchGroups} 
              />
            </div>
          </div>
        </div>
      )}
    </GroupsContext.Consumer>
  )
}

function GroupsForm() {
  return (
    <GroupsContext.Consumer>
      {context => (
        <form className="card" onSubmit={context.groupEditing ? context.updateGroup : context.addGroup}>
          <h5 className="card-header bg-white">{context.groupEditing ? 'Edit' : 'Add'} group</h5>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="groupTitle">Title</label>
              <input 
                type="text" 
                className="form-control" 
                id="groupTitle" 
                name="groupTitle" 
                value={context.groupTitle} 
                onChange={context.handleInputChange} 
              />
            </div>
            <input type="hidden" value={context.groupId} />
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
                disabled={!context.groupTitle.trim().length}
              >
                {context.groupEditing ? 'Update' : 'Add'}
              </button>
              {context.groupEditing && <button type="button" className="btn btn-primary" onClick={context.handleDeleteGroup}>Delete</button>}
              {
                context.groupTitle.trim().length
                  ? <button type="button" className="btn btn-primary" onClick={context.handleCancelEditGroup}>Cancel</button>
                  : false
              }
            </div>
          </div>
        </form>
      )}
    </GroupsContext.Consumer>
  )
}

function GroupsTable() {
  return (
    <GroupsContext.Consumer>
      {context => (
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
            </tr>
          </thead>
          <tbody>
          {context.groups.map(group => {
            return (
              <tr key={group.id} onClick={() => context.editGroup(group)}>
                <th scope="row">{group.id}</th>
                <td>{context.groupEditing && context.groupId == group.id ? context.groupTitle : group.title}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
      )}
    </GroupsContext.Consumer>
  )
}

export default Groups;

import React from 'react';
import ReactDOM from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import moment from 'moment';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import './style.scss';

class App extends React.Component {
  state = {
    userId: ''
  }

  componentWillMount = () => {
    if(!this.state.userId)
      this.auth();
  }

  auth = () => {
    fetch('/fc-test/api/auth')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState({userId: result.id})
      })
      .catch(e => console.log(e));
  }

  logout = event => {
    event.preventDefault();
    
    fetch('/fc-test/api/logout')
      .then(response => response.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState({userId: ''})
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <div className="wrapper">
        <Router>
          <div className="section section__left">
            <div>
              
              {!this.state.userId ? (
                <ul>
                  <li>
                    <Link to="/fc-test/registration">Registration</Link>
                  </li>
                  <li>
                    <Link to="/fc-test/login">Login</Link>
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <Link to="/fc-test">Calendar</Link>
                  </li>
                  <li>
                    <a href="#" onClick={this.logout}>Logout</a>
                  </li>
                </ul>
              )}
                
            </div>
          </div>
          <div className="section section__right">
            <div className="wrapper">
              <Route exact path="/fc-test" component={Calendar} />
              <Route path="/fc-test/registration" component={Registration} />
              <Route path="/fc-test/login" component={Login} />
            </div>
          </div>
        </Router>
      </div>
    )
  }
}

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

    if(!this.state.userEmail.trim().length || !this.state.userPassword.trim().length)
      return false;

    fetch('/fc-test/api/users', {
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
      <>
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
      </>
    );
  }
}

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
      <>
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
      </>
    );
  }
}

class Calendar extends React.Component {
  state = {
    sourceTitle: '',
    sourceParent: '',
    eventId: '',
    eventTitle: '',
    eventResource: [],
    eventStart: '',
    eventEnd: '',
    eventAllDay: false,
    eventEditing: false,

    resources: [
      {
        id: 'p1',
        title: 'Project 1',
        
      },
      {
        id: 'p2',
        title: 'Project 2',
        
      },
      {
        id: 'p3',
        title: 'Project 3',
        
      },
      {
        id: 's1',
        parentId: 'p3',
        title: 'Stage 1'
      },
      {
        id: 's2',
        parentId: 'p3',
        title: 'Stage 2'
      },
      {
        id: 's3',
        parentId: 's2',
        title: 'Stage 3'
      }
    ],
    events: [
      {
        id: '1',
        resourceIds: ['s1'],
        title: 'The Title',
        start: '2019-07-05T12:00:00',
        end: '2019-07-05T13:00:00'
      },
      {
        id: '2',
        resourceIds: ['s2'],
        title: 'The Title 2',
        start: '2019-07-05T16:00:00',
        end: '2019-07-05T17:00:00'
      },
      {
        id: '3',
        resourceIds: ['s3', 's2'],
        title: 'The Title 3',
        start: '2019-07-05T17:00:00',
        end: '2019-07-05T18:00:00'
      }
    ]
  }

  handleEventClick = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay' ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      this.setState({
        eventId: info.event.id,
        eventEditing: true
      });

      let editEvent = {};
      let resourceIds = [];
      const resources = info.event.getResources();

      if(resources) {
        resources.map(resource => {
          resourceIds.push(resource.id)
        })

        editEvent.eventResource = resourceIds;
      }

      editEvent.eventTitle = info.event.title;
      editEvent.eventStart = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss');
      editEvent.eventEnd = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss');
      editEvent.eventAllDay = info.event.allDay;

      this.setState({...editEvent});
    }
  }

  handleSelect = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay' ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      let eventStart = '';
      let eventEnd = '';

      if(info.allDay) {
        eventStart = `${info.startStr}T00:00:00`;
        eventEnd = `${info.endStr}T00:00:00`;
      } else {
        eventStart = info.startStr.slice(0, -6);
        eventEnd = info.endStr.slice(0, -6);
      }

      this.setState(state => {
        return {
          eventResource: [info.resource.id],
          eventAllDay: info.allDay,
          eventStart,
          eventEnd
        }
      });
    }
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

  handleDrop = info => {
    console.log(info);
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay' ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      this.updateEventAfterDrop(info);
    }
  }

  updateEventAfterDrop = info => {
    const eventStart = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss');
    const eventEnd = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss');

    const events = this.state.events.map(item => {
      if(item.id === info.event.id) {
        let event = {
          start: eventStart,
          end: eventEnd
        }

        if(info.newResource && info.oldResource) {
          let resourceIds = item.resourceIds;
          const index = resourceIds.indexOf(info.oldResource.id);
          resourceIds.splice(index, 1, info.newResource.id);
          event.resourceIds = resourceIds;
        }

        return {...item, ...event}
      }

      return item;
    });

    this.setState({events});
  }

  updateEvent = e => {
    e.preventDefault();

    const events = this.state.events.map(item => {
      if(item.id === this.state.eventId) {
        let event = {
          start: this.state.eventStart,
          end: this.state.eventEnd,
          title: this.state.eventTitle,
          resourceIds: this.state.eventResource
        }

        return {...item, ...event}
      }

      return item;
    });

    console.log(events)

    this.setState({
      events,
      eventId: '',
      eventTitle: '',
      eventResource: [],
      eventStart: '',
      eventEnd: '',
      eventAllDay: false,
      eventEditing: false
    });
  }

  handleCancelEditEvent = e => {
    e.preventDefault();
    this.setState({
      eventId: '',
      eventTitle: '',
      eventResource: [],
      eventStart: '',
      eventEnd: '',
      eventAllDay: false,
      eventEditing: false
    });
  }

  addSource = e => {
    e.preventDefault();

    if(!this.state.sourceTitle.trim().length)
      return;

    const resource = {
      id: Date.now(),
      parentId: this.state.sourceParent,
      title: this.state.sourceTitle
    }

    this.setState(state => {
      return {
        sourceParent: '',
        sourceTitle: '',
        resources: [...state.resources, resource]
      }
    })
  }

  addEvent = e => {
    e.preventDefault();

    if(!this.state.eventTitle.trim().length)
      return;

    const event = {
      id: Date.now(),
      resourceIds: this.state.eventResource,
      title: this.state.eventTitle,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      allDay: this.state.allDay
    }

    this.setState(state => {
      return {
        eventResource: [],
        eventTitle: '',
        eventStart: '',
        eventEnd: '',
        events: [...state.events, event]
      }
    })
  }

  render() {
    return (
      <>
        <div className="section section__left">
          <div className="section__form">
            <h3>Add Resource</h3>
            <form onSubmit={this.addSource}>
              <p>
                <label>
                  Title: <br />
                  <input 
                    name="sourceTitle" 
                    value={this.state.sourceTitle} 
                    onChange={this.handleInputChange} 
                  />
                </label>
              </p>
              <p>
                <label>
                  Parent: <br />
                  <select 
                    name="sourceParent" 
                    value={this.state.sourceParent}  
                    onChange={this.handleInputChange}
                  >
                    <option value="">-- select parent resource --</option>
                    {
                      this.state.resources.map(resource => (
                        <option 
                          key={resource.id} 
                          value={resource.id}
                        >
                          {resource.title}
                        </option>
                      ))
                    }
                  </select>
                </label>
              </p>
              <p>
                <input type="submit" />
              </p>
            </form>
          </div>
          <div className="section__form">
            <h3>{this.state.eventEditing ? 'Edit' : 'Add'} Event</h3>
            <form onSubmit={this.state.eventEditing ? this.updateEvent : this.addEvent}>
              <p>
                <label>
                  Title: <br />
                  <input 
                    name="eventTitle" 
                    value={this.state.eventTitle} 
                    onChange={this.handleInputChange} 
                  />
                </label>
              </p>
              <p>
                <label>
                  Resource: <br />
                  <select 
                    multiple={true}
                    name="eventResource" 
                    value={this.state.eventResource}  
                    onChange={this.handleInputChange}
                  >
                    {
                      this.state.resources.map(resource => (
                        <option 
                          key={resource.id} 
                          value={resource.id}
                        >
                          {resource.title}
                        </option>
                      ))
                    }
                  </select>
                </label>
              </p>
              <p>
                <label>
                  Start: <br />
                  <input 
                    type="datetime-local"
                    name="eventStart" 
                    value={this.state.eventStart} 
                    onChange={this.handleInputChange} 
                  />
                </label>
              </p>
              <p>
                <label>
                  End: <br />
                  <input 
                    type="datetime-local"
                    name="eventEnd" 
                    value={this.state.eventEnd} 
                    onChange={this.handleInputChange} 
                  />
                </label>
              </p>
              <p>
                <input type="hidden" value={this.state.eventId} />
                <input type="submit" value={this.state.eventEditing ? 'Update' : 'Add'} />
                {this.state.eventEditing && <button onClick={this.handleCancelEditEvent}>Cancel</button>}
              </p>
            </form>
          </div>
        </div>
        <div className="section section__right">
          <FullCalendar 
            locale={ruLocale}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
              resourceTimelinePlugin
            ]}
            header={{
              left:   'prev,next today',
              center: 'title',
              right:  'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth dayGridMonth,timeGridWeek,timeGridDay, listWeek'
            }}
            businessHours={{
              startTime: '09:00',
              endTime: '19:00',
              daysOfWeek: [1, 2, 3, 4, 5]
            }}
            views={{
              resourceTimelineDay: {
                selectable: true,
                
              },
              resourceTimelineWeek: {
                selectable: true,
                
              },
              resourceTimelineMonth: {
                selectable: true,
                
              }
            }}
            editable={true}
            nowIndicator={true}
            eventClick={this.handleEventClick}
            select={this.handleSelect}
            eventDrop={this.handleDrop}
            resources={this.state.resources}
            events={this.state.events}
          />
        </div>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
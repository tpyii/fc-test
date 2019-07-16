import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import moment from 'moment';
import { AppContext } from './App';

export const CalendarContext = React.createContext();

class Calendar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sourceId: '',
      sourceTitle: '',
      sourceParent: '',
      sourceEditing: false,

      eventId: '',
      eventTitle: '',
      eventDescription: '',
      eventResource: [],
      eventUsers: [],
      eventStart: '',
      eventEnd: '',
      eventEditing: false,

      users: [],
      resources: [],
      events: [],

      handleEventClick: this.handleEventClick,
      handleSelect: this.handleSelect,
      handleInputChange: this.handleInputChange,
      handleDrop: this.handleDrop,
      updateEventAfterDrop: this.updateEventAfterDrop,
      updateEvent: this.updateEvent,
      updateSource: this.updateSource,
      handleCancelEditEvent: this.handleCancelEditEvent,
      addSource: this.addSource,
      addEvent: this.addEvent,
      fetchResources: this.fetchResources,
      fetchEvents: this.fetchEvents,
      handleDeleteEvent: this.handleDeleteEvent,
      handleResize: this.handleResize,
      eventRender: this.eventRender,
      datesRender: this.datesRender,
      resourceRender: this.resourceRender,
      handleDeleteSource: this.handleDeleteSource,
      handleCancelEditSource: this.handleCancelEditSource,
    }
  }

  componentWillMount = () => {
    const { userGroup } = this.props.app;

    if(userGroup == 1) {
      this.fetchResources();
      this.fetchUsers();
    }

    this.fetchEvents();
  }

  handleEventClick = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      this.setState({
        eventId: info.event.id,
        eventEditing: true
      });

      let editEvent = {};
      let resourceIds = [];
      const resources = info.event.getResources();
      const users = info.event.extendedProps.users || [];
      const description = info.event.extendedProps.description || '';

      if(resources) {
        resources.map(resource => {
          resourceIds.push(resource.id)
        })

        editEvent.eventResource = resourceIds;
      }

      editEvent.eventTitle = info.event.title;
      editEvent.eventDescription = description;
      editEvent.eventStart = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss');
      editEvent.eventEnd = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss');
      editEvent.eventUsers = users;

      this.setState({...editEvent});
    }
  }

  handleSelect = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
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

      this.setState({
        eventResource: [info.resource.id],
        eventTitle: '',
        eventDescription: '',
        eventStart,
        eventEnd,
        eventUsers: [],
        eventEditing: false,
        eventId: ''
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

    this.setState({[name]: value});
  }

  handleDrop = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      this.updateEventAfterDrop(info);
    }
  }

  handleResize = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      const eventStart = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss');
      const eventEnd = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss');

      let item = this.state.events.filter(item => item.id == info.event.id)[0];
      let event = {
        title: item.title,
        start: eventStart,
        end: eventEnd,
        description: item.description,
      }

      fetch(`/api/events/${info.event.id}`, {
        method: 'PUT',
        body: JSON.stringify(event),
        headers: {'content-type': 'application/json'}
      })
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result.event) {

          let event = {}

          if(result.event.start)
            event.start = result.event.start
          if(result.event.end)
            event.end = result.event.end
          if(result.event.title)
            event.title = result.event.title
          if(result.event.description)
            event.description = result.event.description

          const events = this.state.events.map(item => {
            if(item.id == info.event.id)
              return {...item, ...event}

            return item;
          });

          this.setState({
            'eventStart': event.start,
            'eventEnd': event.end,
            events
          })
        }
      })
      .catch(e => console.log(e));

    }
  }

  updateEventAfterDrop = info => {
    const eventStart = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss');
    const eventEnd = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss');

    let item = this.state.events.filter(item => item.id == info.event.id)[0];
    let event = {
      title: item.title,
      start: eventStart,
      end: eventEnd,
      description: item.description,
    }

    if(info.newResource && info.oldResource) {
      let resourceIds = item.resourceIds;
      const index = resourceIds.indexOf(info.oldResource.id);
      resourceIds.splice(index, 1, info.newResource.id);
      event.resourceIds = resourceIds;
    }

    fetch(`/api/events/${info.event.id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error)
        console.log(result.error);

      if(result.event) {

        let event = {}

        if(result.event.start)
          event.start = result.event.start
        if(result.event.end)
          event.end = result.event.end
        if(result.event.title)
          event.title = result.event.title
        if(result.event.description)
          event.description = result.event.description
        if(result.event.resourceIds)
          event.resourceIds = result.event.resourceIds

        const events = this.state.events.map(item => {
          if(item.id == info.event.id)
            return {...item, ...event}

          return item;
        });

        this.setState({
          'eventStart': event.start,
          'eventEnd': event.end,
          'eventResource': event.resourceIds,
          events
        })
      }
    })
    .catch(e => console.log(e));
  }

  updateEvent = e => {
    e.preventDefault();

    if(!this.state.eventTitle.trim().length ||
       !this.state.eventStart.trim().length ||
       !this.state.eventEnd.trim().length   ||
       !this.state.eventResource.length     ||
       !this.state.eventUsers.length)
      return;

    const event = {
      resourceIds: this.state.eventResource,
      title: this.state.eventTitle,
      description: this.state.eventDescription,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      users: this.state.eventUsers
    }

    fetch(`/api/events/${this.state.eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error)
        console.log(result.error);

      if(result.event) {

        let event = {}

        if(result.event.start)
          event.start = result.event.start
        if(result.event.end)
          event.end = result.event.end
        if(result.event.title)
          event.title = result.event.title
        if(result.event.description)
          event.description = result.event.description
        if(result.event.resourceIds)
          event.resourceIds = result.event.resourceIds
        if(result.event.users)
          event.users = result.event.users

        const events = this.state.events.map(item => {
          if(item.id == this.state.eventId)
            return {...item, ...event}

          return item;
        });

        this.setState({
          eventId: '',
          eventResource: [],
          eventUsers: [],
          eventTitle: '',
          eventDescription: '',
          eventStart: '',
          eventEnd: '',
          eventEditing: false,
          events
        })
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditEvent = e => {
    e.preventDefault();
    this.setState({
      eventId: '',
      eventTitle: '',
      eventDescription: '',
      eventResource: [],
      eventUsers: [],
      eventStart: '',
      eventEnd: '',
      eventEditing: false
    });
  }

  handleDeleteEvent = e => {
    e.preventDefault();

    if(!this.state.eventId)
      return;

    fetch(`/api/events/${this.state.eventId}`, {
      method: 'DELETE'
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error)
        console.log(result.error);

      if(result.event) {
        const events = this.state.events.filter(event => event.id != result.event)
      
        this.setState({
          eventId: '',
          eventTitle: '',
          eventDescription: '',
          eventResource: [],
          eventUsers: [],
          eventStart: '',
          eventEnd: '',
          eventEditing: false,
          events
        });
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditSource = e => {
    e.preventDefault();
    this.setState({
      sourceId: '',
      sourceTitle: '',
      sourceParent: '',
      sourceEditing: false
    });
  }

  updateSource = e => {
    e.preventDefault();

    if(!this.state.sourceTitle.trim().length)
      return;

    const resource = {
      title: this.state.sourceTitle,
      parentId: this.state.sourceParent,
    }

    fetch(`/api/resources/${this.state.sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resource),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        return;
      }

      if(result) {
        const resources = this.state.resources.map(item => {
          if(item.id == this.state.sourceId)
            return {...item, ...result}

          return item;
        });

        this.setState({
          sourceId: '',
          sourceTitle: '',
          sourceParent: '',
          sourceEditing: false,
          resources
        })
      }
    })
    .catch(e => console.log(e));
  }
  
  handleDeleteSource = e => {
    e.preventDefault();

    if(!this.state.sourceId)
      return;

    fetch(`/api/resources/${this.state.sourceId}`, {
      method: 'DELETE'
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error)
        console.log(result.error);

      if(result.resource) {
        const resources = this.state.resources.filter(resource => resource.id != result.resource)
      
        this.setState({
          sourceId: '',
          sourceTitle: '',
          sourceParent: '',
          sourceEditing: false,
          resources
        });
      }
    })
    .catch(e => console.log(e));
  }

  handleClickResource = (info) => {
    const resource = this.state.resources.filter(resource => resource.id == info.resource.id)[0]

    this.setState({
      sourceId: info.resource.id,
      sourceTitle: info.resource.title,
      sourceParent: resource ? resource.parentId : '',
      sourceEditing: true
    });
  }

  addSource = e => {
    e.preventDefault();

    if(!this.state.sourceTitle.trim().length)
      return;

    const resource = {
      parentId: this.state.sourceParent,
      title: this.state.sourceTitle
    }

    fetch('/api/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
      headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        return;
      }

      if(result) {
        this.setState(state => {
          return {
            resources: [...state.resources, result]
          }
        })
      }
    })
    .catch(e => console.log(e));

    this.setState({
      sourceParent: '',
      sourceTitle: '',
    })
  }

  addEvent = e => {
    e.preventDefault();

    if(!this.state.eventTitle.trim().length ||
       !this.state.eventStart.trim().length ||
       !this.state.eventEnd.trim().length   ||
       !this.state.eventResource.length     ||
       !this.state.eventUsers.length)
      return;

    const event = {
      resourceIds: this.state.eventResource,
      title: this.state.eventTitle,
      description: this.state.eventDescription,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      users: this.state.eventUsers
    }

    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error)
        console.log(result.error);

      if(result.event) {
        this.setState(state => {
          return {
            eventId: '',
            eventResource: [],
            eventUsers: [],
            eventTitle: '',
            eventDescription: '',
            eventStart: '',
            eventEnd: '',
            events: [...state.events, result.event]
          }
        })
      }
    })
    .catch(e => console.log(e));
  }

  fetchResources = () => {
    fetch('/api/resources')
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        if(result)
          this.setState({resources: result})
      })
      .catch(e => console.log(e));
  }

  fetchUsers = () => {
    fetch('/api/users')
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        if(result)
          this.setState({users: result})
      })
      .catch(e => console.log(e));
  }

  fetchEvents = () => {
    const { userId, userGroup } = this.props.app;
    const url = userGroup == 1 ? '/api/events' : `/api/events/user/${userId}`;
    
    fetch(url)
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result.events)
          this.setState({events: result.events})
      })
      .catch(e => console.log(e));
  }

  resourceRender = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      info.el.onclick = (e) => this.handleClickResource(info);
    }
  }

  eventRender = info => {
    const typeView = info.view.type;
    if(typeView == 'timeGridWeek' ||
       typeView == 'timeGridDay'  ||
       typeView == 'timeGlistWeekridWeek' ||
       typeView == 'listWeek') {

      if(info.el) {

        let content;
        let description;

        if(typeView == 'listWeek') {
          content = info.el;
          description = document.createElement('td');
        } else {
          content = info.el.querySelector('.fc-content');
          description = document.createElement('div');
        }
        
        description.className = 'fc-description';
        description.innerHTML = info.event.extendedProps.description;
        content.appendChild(description);
      }
    }
  }

  datesRender = info => {
    const typeView = info.view.type;
    if(typeView == 'listWeek') {

      const headers = info.el.querySelectorAll('.fc-list-heading');

      if(headers) {
        for (let i = 0; i < headers.length; i++) {
          headers[i].firstChild.colSpan = '4'
        }
      }
    }
  }

  render() {
    return (
      <CalendarContext.Provider value={this.state}>
        <Layout />
      </CalendarContext.Provider>
    );
  }
}

Calendar.contextType = CalendarContext;

function ResourcesForm() {
  return (
    <CalendarContext.Consumer>
      {context => (
        <div className="section__form">
          <h3>{context.sourceEditing ? 'Edit' : 'Add'} Resource</h3>
          <form onSubmit={context.sourceEditing ? context.updateSource : context.addSource}>
            <p>
              <label>
                Title: <br />
                <input 
                  name="sourceTitle" 
                  value={context.sourceTitle} 
                  onChange={context.handleInputChange} 
                />
              </label>
            </p>
            <p>
              <label>
                Parent: <br />
                <select 
                  name="sourceParent" 
                  value={context.sourceParent}  
                  onChange={context.handleInputChange}
                >
                  <option value="">-- select parent resource --</option>
                  {
                    context.resources.map(resource => (
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
              <input type="hidden" value={context.sourceId} />
              <input type="submit" value={context.sourceEditing ? 'Update' : 'Add'} />
              {context.sourceEditing && <button onClick={context.handleDeleteSource}>Delete</button>}
              {context.sourceEditing && <button onClick={context.handleCancelEditSource}>Cancel</button>}
            </p>
          </form>
        </div>
      )}
    </CalendarContext.Consumer>
  )
}

function EventsForm() {
  return (
    <CalendarContext.Consumer>
      {context => (
        <div className="section__form">
          <h3>{context.eventEditing ? 'Edit' : 'Add'} Event</h3>
          <form onSubmit={context.eventEditing ? context.updateEvent : context.addEvent}>
            <p>
              <label>
                Title: <br />
                <input 
                  name="eventTitle" 
                  value={context.eventTitle} 
                  onChange={context.handleInputChange} 
                />
              </label>
            </p>
            <p>
              <label>
                Description: <br />
                <textarea 
                  name="eventDescription" 
                  value={context.eventDescription} 
                  onChange={context.handleInputChange}
                >
                </textarea>
              </label>
            </p>
            <p>
              <label>
                Resource: <br />
                <select 
                  multiple={true}
                  name="eventResource" 
                  value={context.eventResource}  
                  onChange={context.handleInputChange}
                >
                  {
                    context.resources.map(resource => (
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
                Users: <br />
                <select 
                  multiple={true}
                  name="eventUsers" 
                  value={context.eventUsers}  
                  onChange={context.handleInputChange}
                >
                  {
                    context.users.map(user => (
                      <option 
                        key={user.id} 
                        value={user.id}
                      >
                        {user.email}
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
                  value={context.eventStart} 
                  onChange={context.handleInputChange} 
                />
              </label>
            </p>
            <p>
              <label>
                End: <br />
                <input 
                  type="datetime-local"
                  name="eventEnd" 
                  value={context.eventEnd} 
                  onChange={context.handleInputChange} 
                />
              </label>
            </p>
            <p>
              <input type="hidden" value={context.eventId} />
              <input type="submit" value={context.eventEditing ? 'Update' : 'Add'} />
              {context.eventEditing && <button onClick={context.handleDeleteEvent}>Delete</button>}
              {context.eventEditing && <button onClick={context.handleCancelEditEvent}>Cancel</button>}
            </p>
          </form>
        </div>
      )}
    </CalendarContext.Consumer>
  )
}

function Sidebar() {
  return (
    <div className="section section__left">
      <ResourcesForm />
      <EventsForm />
    </div>
  )
}

function Content() {
  return (
    <div className="section section__right">
    <AppContext.Consumer>
      {app => (
        <CalendarContext.Consumer>
          {calendar => (
            <FullCalendar 
              locale={ruLocale}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
                resourceTimelinePlugin
              ]}
              header={
                app.userGroup === '1' 
                  ? {
                      left:   'prev,next today',
                      center: 'title',
                      right:  'resourceTimelineMonth,resourceTimelineWeek,resourceTimelineDay'
                    } 
                  : {
                      left:   'prev,next today',
                      center: 'title',
                      right:  'dayGridMonth,timeGridWeek,timeGridDay, listWeek'
                    } 
              }
              defaultView={app.userGroup === '1' ? 'resourceTimelineMonth' : 'dayGridMonth'}
              businessHours={{
                startTime: '09:00',
                endTime: '19:00',
                daysOfWeek: [1, 2, 3, 4, 5]
              }}
              scrollTime={'09:00:00'}
              views={{
                resourceTimelineDay: {
                  selectable: app.userGroup === '1' ? true : false,
                },
                resourceTimelineWeek: {
                  selectable: app.userGroup === '1' ? true : false,
                },
                resourceTimelineMonth: {
                  selectable: app.userGroup === '1' ? true : false,
                }
              }}
              resourceRender={calendar.resourceRender}
              eventRender={calendar.eventRender}
              datesRender={calendar.datesRender}
              editable={app.userGroup === '1' ? true : false}
              nowIndicator={true}
              eventClick={calendar.handleEventClick}
              select={calendar.handleSelect}
              eventDrop={calendar.handleDrop}
              eventResize={calendar.handleResize}
              resources={calendar.resources}
              events={calendar.events}
            />
          )}
        </CalendarContext.Consumer>
        )}
      </AppContext.Consumer>
    </div>
  )
}

function Layout() {
  return (
    <div className="wrapper">
      <AppContext.Consumer>
        {context => (
          context.userGroup == 1 ? (
            <>
              <Sidebar />
              <Content />
            </>
          ) : (
            <Content />
          )
        )}
      </AppContext.Consumer>
    </div>
  )
}

export default Calendar;

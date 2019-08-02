import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import ruLocale from '@fullcalendar/core/locales/ru';
import moment from 'moment';
import { AppContext } from './App';
import Select from 'react-select';

export const CalendarContext = React.createContext();

class Calendar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      eventId: '',
      eventTitle: '',
      eventDescription: '',
      eventResource: [],
      eventStart: '',
      eventEnd: '',
      eventEditing: false,
      eventAllDay: false,

      acl: this.getAcl(),
      resources: [],
      events: [],

      handleEventClick: this.handleEventClick,
      handleSelect: this.handleSelect,
      handleInputChange: this.handleInputChange,
      handleDrop: this.handleDrop,
      updateEventAfterDrop: this.updateEventAfterDrop,
      updateEvent: this.updateEvent,
      handleCancelEditEvent: this.handleCancelEditEvent,
      addEvent: this.addEvent,
      fetchResources: this.fetchResources,
      fetchEvents: this.fetchEvents,
      handleDeleteEvent: this.handleDeleteEvent,
      handleResize: this.handleResize,
      eventRender: this.eventRender,
      handleSelectChange: this.handleSelectChange,
    }
  }

  getAcl = () => {
    return this.props.app.user.acl.find(a => a.title === 'Calendar')
  }

  componentWillMount = () => {
    if(this.state.acl.settings.main.edit === true)
      this.fetchResources();

    this.fetchEvents();
  }

  handleEventClick = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      let resourceIds = [];
      const resources = info.event.getResources();

      if(resources) {
        resources.map(resource => {
          resourceIds.push({
            id: resource.id,
            title: resource.title
          })
        })
      }

      this.setState({
        eventId: info.event.id,
        eventTitle: info.event.title,
        eventDescription: info.event.extendedProps.description || '',
        eventResource: resourceIds,
        eventStart: moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss'),
        eventEnd: info.event.end ? moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss') : moment(info.event.start).add(1, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        eventEditing: true,
        eventAllDay: info.event.allDay,
      });
    }
  }

  handleSelect = info => {
    const typeView = info.view.type;
    if(typeView == 'resourceTimelineDay'  ||
       typeView == 'resourceTimelineWeek' ||
       typeView == 'resourceTimelineMonth') {

      const resource = {
        id: info.resource.id,
        title: info.resource.title
      }

      this.setState({
        eventResource: [resource],
        eventTitle: '',
        eventDescription: '',
        eventStart: moment(info.start).format('YYYY-MM-DDTHH:mm:ss'),
        eventEnd: moment(info.end).format('YYYY-MM-DDTHH:mm:ss'),
        eventEditing: false,
        eventId: '',
        eventAllDay: false,
      });
    }
  }

  handleSelectChange = (name, value) => {
    this.setState({[name]: value || []});
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

      let resourceIds = [];
      const resources = info.event.getResources();

      if(resources)
        resources.map(resource => resourceIds.push(resource.id))

      let event = {
        title: info.event.title,
        start: moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss'),
        end: moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss'),
        description: info.event.extendedProps.description,
        allDay: info.event.allDay,
        resourceIds,
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

          let event = {
            start: result.event.start,
            end: result.event.end,
            title: result.event.title,
            description: result.event.description,
            allDay: result.event.allDay,
          }

          const events = this.state.events.map(item => {
            if(item.id == info.event.id)
              return {...item, ...event}

            return item;
          });

          this.setState({
            eventId: '',
            eventResource: [],
            eventTitle: '',
            eventDescription: '',
            eventStart: '',
            eventEnd: '',
            eventEditing: false,
            eventAllDay: false,
            events
          })
        }
      })
      .catch(e => console.log(e));

    }
  }

  updateEventAfterDrop = info => {
    let item = this.state.events.filter(item => item.id == info.event.id)[0];
    let event = {
      title: item.title,
      start: moment(info.event.start).format('YYYY-MM-DDTHH:mm:ss'),
      end: info.event.end ? moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss') : moment(info.event.start).add(1, 'days').format('YYYY-MM-DDTHH:mm:ss'),
      description: item.description,
      allDay: info.event.allDay,
      resourceIds: item.resourceIds,
    }

    if(info.newResource && info.oldResource) {
      let resourceIds = item.resourceIds;
      const index = resourceIds.indexOf(info.oldResource.id);

      if(index != -1)
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

        let event = {
          start: result.event.start,
          end: result.event.end,
          title: result.event.title,
          description: result.event.description,
          allDay: result.event.allDay,
        }

        if(result.event.resourceIds)
          event.resourceIds = result.event.resourceIds

        const events = this.state.events.map(item => {
          if(item.id == info.event.id)
            return {...item, ...event}

          return item;
        });

        this.setState({
          eventId: '',
          eventResource: [],
          eventTitle: '',
          eventDescription: '',
          eventStart: '',
          eventEnd: '',
          eventEditing: false,
          eventAllDay: false,
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
       !this.state.eventResource.length)
      return;

    const event = {
      resourceIds: this.state.eventResource.map(resource => resource.id),
      title: this.state.eventTitle,
      description: this.state.eventDescription,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      allDay: this.state.eventAllDay,
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

        let event = {
          start: result.event.start,
          end: result.event.end,
          title: result.event.title,
          description: result.event.description,
          allDay: result.event.allDay,
        }

        if(result.event.resourceIds)
          event.resourceIds = result.event.resourceIds

        const events = this.state.events.map(item => {
          if(item.id == this.state.eventId)
            return {...item, ...event}

          return item;
        });

        this.setState({
          eventId: '',
          eventResource: [],
          eventTitle: '',
          eventDescription: '',
          eventStart: '',
          eventEnd: '',
          eventEditing: false,
          eventAllDay: false,
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
      eventStart: '',
      eventEnd: '',
      eventEditing: false,
      eventAllDay: false,
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
          eventStart: '',
          eventEnd: '',
          eventEditing: false,
          eventAllDay: false,
          events
        });
      }
    })
    .catch(e => console.log(e));
  }

  addEvent = e => {
    e.preventDefault();

    if(!this.state.eventTitle.trim().length ||
       !this.state.eventStart.trim().length ||
       !this.state.eventEnd.trim().length   ||
       !this.state.eventResource.length)
      return;

    const event = {
      resourceIds: this.state.eventResource.map(resource => resource.id),
      title: this.state.eventTitle,
      description: this.state.eventDescription,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      allDay: this.state.eventAllDay,
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
            eventTitle: '',
            eventDescription: '',
            eventStart: '',
            eventEnd: '',
            eventEditing: false,
            eventAllDay: false,
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

  fetchEvents = () => {
    const { userId } = this.props.app;
    const url = this.state.acl.settings.main.edit === true ? '/api/events' : `/api/events/resource/${userId}`;
    
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

  eventRender = info => {
    const typeView = info.view.type;
    if(typeView == 'timeGridWeek' ||
       typeView == 'timeGridDay'  ||
       typeView == 'timeGlistWeekridWeek' ||
       typeView == 'listWeek') {

      if(info.el) {

        let content;
        let description;

        if(typeView == 'listWeek')
          content = info.el.querySelector('.fc-list-item-title');
        else
          content = info.el.querySelector('.fc-content');

        if(!content)
          return;

        description = document.createElement('div');
        description.className = 'fc-description';
        description.innerHTML = info.event.extendedProps.description || '';
        content.appendChild(description);
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

function EventsForm() {
  return (
    <CalendarContext.Consumer>
      {context => (
        <form className="card" onSubmit={context.eventEditing ? context.updateEvent : context.addEvent}>
          <h5 className="card-header bg-white">{context.eventEditing ? 'Edit' : 'Add'} Event</h5>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="eventTitle">Title</label>
              <input 
                type="text" 
                className="form-control" 
                id="eventTitle" 
                name="eventTitle" 
                value={context.eventTitle} 
                onChange={context.handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventDescription">Description</label>
              <textarea 
                className="form-control" 
                id="eventDescription" 
                name="eventDescription" 
                value={context.eventDescription} 
                onChange={context.handleInputChange}
                rows="3"
              >
              </textarea>
            </div>
            <div className="form-group">
              <label htmlFor="eventResource">Resource</label>
              <Select
                placeholder=""
                isMulti
                id="eventResource"
                name="eventResource"
                onChange={(option) => context.handleSelectChange('eventResource', option)}
                options={context.resources}
                getOptionLabel={(option) => option.title}
                getOptionValue={(option) => option.id}
                value={context.eventResource}
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventStart">Start</label>
              <input 
                type="text" 
                className="form-control" 
                id="eventStart" 
                type="datetime-local"
                name="eventStart" 
                value={context.eventStart} 
                onChange={context.handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventEnd">End</label>
              <input 
                type="text" 
                className="form-control" 
                id="eventEnd" 
                type="datetime-local"
                name="eventEnd" 
                value={context.eventEnd} 
                onChange={context.handleInputChange} 
              />
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                value={context.eventAllDay}
                checked={context.eventAllDay}
                id="eventAllDay"
                name="eventAllDay"
                onChange={context.handleInputChange} 
              />
              <label className="form-check-label" htmlFor="eventAllDay">
                All day
              </label>
            </div>
            <input type="hidden" value={context.eventId} />
          </div>
          <div className="card-footer bg-white">
            <div className="btn-group">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={
                  !context.eventTitle.trim().length || 
                  !context.eventResource.length || 
                  !context.eventStart.trim().length || 
                  !context.eventEnd.trim().length
                }
              >
                {context.eventEditing ? 'Update' : 'Add'}
              </button>
              {context.eventEditing && <button type="button" className="btn btn-primary" onClick={context.handleDeleteEvent}>Delete</button>}
              {
                context.eventTitle.trim().length ||
                context.eventDescription.trim().length ||
                context.eventResource.length || 
                context.eventStart.trim().length ||
                context.eventEnd.trim().length 
                  ? <button type="button" className="btn btn-primary" onClick={context.handleCancelEditEvent}>Cancel</button>
                  : false
              }
            </div>
          </div>
        </form>
      )}
    </CalendarContext.Consumer>
  )
}

function Sidebar() {
  return (
    <div className="section section__left">
      <EventsForm />
    </div>
  )
}

function Content() {
  return (
    <div className="section section__right">
      <CalendarContext.Consumer>
        {context => (
          <div className="section__wrapper">
            <FullCalendar 
              schedulerLicenseKey='GPL-My-Project-Is-Open-Source'
              locale={ruLocale}
              height='parent'
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
                resourceTimelinePlugin,
                bootstrapPlugin
              ]}
              themeSystem='bootstrap'
              header={
                context.acl.settings.main.edit == true 
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
              defaultView={context.acl.settings.main.edit == true ? 'resourceTimelineMonth' : 'dayGridMonth'}
              businessHours={{
                startTime: '09:00',
                endTime: '19:00',
                daysOfWeek: [1, 2, 3, 4, 5]
              }}
              scrollTime={'09:00:00'}
              views={{
                resourceTimelineDay: {
                  selectable: context.acl.settings.main.edit == true ? true : false,
                },
                resourceTimelineWeek: {
                  selectable: context.acl.settings.main.edit == true ? true : false,
                },
                resourceTimelineMonth: {
                  selectable: context.acl.settings.main.edit == true ? true : false,
                }
              }}
              resourceRender={context.resourceRender}
              eventRender={context.eventRender}
              editable={context.acl.settings.main.edit == true ? true : false}
              nowIndicator={true}
              eventClick={context.handleEventClick}
              select={context.handleSelect}
              eventDrop={context.handleDrop}
              eventResize={context.handleResize}
              resources={context.resources}
              events={context.events}
            />
          </div>
        )}
      </CalendarContext.Consumer>
    </div>
  )
}

function Layout() {
  return (
    <div className="wrapper">
      <CalendarContext.Consumer>
        {context => (
          context.acl.settings.main.edit == true ? (
            <React.Fragment>
              <Sidebar />
              <Content />
            </React.Fragment>
          ) : (
            <Content />
          )
        )}
      </CalendarContext.Consumer>
    </div>
  )
}

export default Calendar;

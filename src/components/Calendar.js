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
      sourceTitle: '',
      sourceParent: '',
      eventId: '',
      eventTitle: '',
      eventResource: [],
      eventStart: '',
      eventEnd: '',
      eventAllDay: false,
      eventEditing: false,

      resources: [],
      events: [
        {
          id: '1',
          resourceIds: ['1'],
          title: 'The Title',
          start: '2019-07-05T12:00:00',
          end: '2019-07-05T13:00:00'
        },
        {
          id: '2',
          resourceIds: ['2'],
          title: 'The Title 2',
          start: '2019-07-05T16:00:00',
          end: '2019-07-05T17:00:00'
        },
        {
          id: '3',
          resourceIds: ['3', '2'],
          title: 'The Title 3',
          start: '2019-07-05T17:00:00',
          end: '2019-07-05T18:00:00'
        }
      ],

      handleEventClick: this.handleEventClick,
      handleSelect: this.handleSelect,
      handleInputChange: this.handleInputChange,
      handleDrop: this.handleDrop,
      updateEventAfterDrop: this.updateEventAfterDrop,
      updateEvent: this.updateEvent,
      handleCancelEditEvent: this.handleCancelEditEvent,
      addSource: this.addSource,
      addEvent: this.addEvent,
      fetchResources: this.fetchResources
    }
  }

  componentWillMount = () => {
    this.fetchResources();
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
      parentId: this.state.sourceParent,
      title: this.state.sourceTitle
    }

    fetch('/fc-test/api/resources', {
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

      this.setState(state => {
        return {
          resources: [...state.resources, result]
        }
      })
    })
    .catch(e => console.log(e));

    this.setState({
      sourceParent: '',
      sourceTitle: '',
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

  fetchResources = () => {
    fetch('/fc-test/api/resources')
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        this.setState(state => {
          return {
            resources: result
          }
        })
      })
      .catch(e => console.log(e));
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
          <h3>Add Resource</h3>
          <form onSubmit={context.addSource}>
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
              <input type="submit" />
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
              eventClick={calendar.handleEventClick}
              select={calendar.handleSelect}
              eventDrop={calendar.handleDrop}
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

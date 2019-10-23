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
import $ from "jquery";

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
      minEventEnd: '',
      eventEditing: false,
      eventAllDay: false,
      eventOverlap: true,
      eventBackground: false,
      eventOrder: {},
      error: '',

      acl: this.getAcl(),
      resources: [],
      orders: [],
      settings: this.getSettings(),

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
      handleMultipleSelectChange: this.handleMultipleSelectChange,
      handleSelectChange: this.handleSelectChange,
      selectOverlap: this.selectOverlap,

      calendarRef: this.calendarRef,
    }
  }

  calendarRef = React.createRef()

  fetchTimeout

  getAcl = () => {
    return this.props.app.user.acl.find(a => a.title === 'Calendar')
  }

  getSettings = () => {
    return this.props.app.user.settings.find(a => a.title === 'Calendar')
  }

  componentWillMount = () => {
    if(this.state.acl.settings.main.edit === true) {
      this.fetchResources();
      this.fetchOrders();
    }
  }

  componentDidMount = () => {
    this.props.app.setTitlePage()
    let calendarApi = this.calendarRef.current.getApi()
    this.fetchTimeout = setInterval(() => {
      if(this.state.acl.settings.main.edit === true) {
        this.fetchResources();
        this.fetchOrders();
      }
      calendarApi.refetchEvents();
    }, 60000)
  }

  componentWillUnmount = () => {
    clearInterval(this.fetchTimeout)
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
        minEventEnd: moment(info.event.start).add(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss'),
        eventEditing: true,
        eventAllDay: info.event.allDay,
        eventOrder: info.event.extendedProps.order,
        eventOverlap: info.event.overlap,
        eventBackground: info.event.rendering === 'background',
        error: '',
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
        minEventEnd: moment(info.start).add(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss'),
        eventEditing: false,
        eventId: '',
        eventAllDay: false,
        eventOrder: {},
        eventOverlap: true,
        eventBackground: false,
        error: '',
      });
    }
  }

  handleMultipleSelectChange = (name, value) => {
    this.setState({[name]: value || []});
  }

  handleSelectChange = (name, value) => {
    this.setState({[name]: value || {}});
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

    if(name === 'eventStart') {
      this.setState({
        [name]: value,
        minEventEnd: moment(value).add(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss'),
      });
    }

    else
      this.setState({[name]: value});
  }

  selectOverlap = event => {
    return event.overlap;
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
        order: info.event.extendedProps.order,
        overlap: info.event.overlap,
        rendering: info.event.rendering,
      }

      fetch(`/api/events/${info.event.id}`, {
        method: 'PUT',
        body: JSON.stringify(event),
        headers: {'content-type': 'application/json'}
      })
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          this.setState({error: result.error})
        }

        if(result.event) {
          info.event.setDates(result.event.start, result.event.end, {allDay: result.event.allDay})

          this.setState({
            eventId: '',
            eventResource: [],
            eventTitle: '',
            eventDescription: '',
            eventStart: '',
            eventEnd: '',
            minEventEnd: '',
            eventEditing: false,
            eventAllDay: false,
            eventOrder: {},
            eventOverlap: true,
            eventBackground: false,
            error: '',
          })
        }
      })
      .catch(e => console.log(e));

    }
  }

  updateEventAfterDrop = info => {
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
      order: info.event.extendedProps.order,
      overlap: info.event.overlap,
      rendering: info.event.rendering,
    }

    if(info.newResource && info.oldResource) {
      let resourceIds = event.resourceIds;
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
      if(result.error) {
        console.log(result.error);
        this.setState({error: result.error})
      }

      if(result.event) {
        info.event.setDates(result.event.start, result.event.end, {allDay: result.event.allDay})

        if(result.event.resourceIds)
          info.event.setResources(result.event.resourceIds)

        this.setState({
          eventId: '',
          eventResource: [],
          eventTitle: '',
          eventDescription: '',
          eventStart: '',
          eventEnd: '',
          minEventEnd: '',
          eventEditing: false,
          eventAllDay: false,
          eventOrder: {},
          eventOverlap: true,
          eventBackground: false,
          error: '',
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
       this.state.eventStart.trim() >= this.state.eventEnd.trim())
      return;

    const event = {
      resourceIds: this.state.eventResource.map(resource => resource.id),
      title: this.state.eventTitle,
      description: this.state.eventDescription,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      allDay: this.state.eventAllDay,
      order: this.state.eventOrder,
      overlap: this.state.eventOverlap,
      rendering: this.state.eventBackground,
    }

    fetch(`/api/events/${this.state.eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        this.setState({error: result.error})
      }

      if(result.event) {
        let calendarApi = this.calendarRef.current.getApi()
        const event = calendarApi.getEventById(this.state.eventId)
        event.setDates(result.event.start, result.event.end, {allDay: result.event.allDay})
        event.setProp('title', result.event.title)
        event.setProp('overlap', result.event.overlap)
        event.setProp('rendering', result.event.rendering)
        event.setExtendedProp('description', result.event.description)
        event.setExtendedProp('order', result.event.order)

        if(result.event.resourceIds)
          event.setResources(result.event.resourceIds)

        this.setState({
          eventId: '',
          eventResource: [],
          eventTitle: '',
          eventDescription: '',
          eventStart: '',
          eventEnd: '',
          minEventEnd: '',
          eventEditing: false,
          eventAllDay: false,
          eventOrder: {},
          eventOverlap: true,
          eventBackground: false,
          error: '',
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
      minEventEnd: '',
      eventEditing: false,
      eventAllDay: false,
      eventOrder: {},
      eventOverlap: true,
      eventBackground: false,
      error: '',
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
      if(result.error) {
        console.log(result.error);
        this.setState({error: result.error})
      }

      if(result.event) {
        this.setState({
          eventId: '',
          eventTitle: '',
          eventDescription: '',
          eventResource: [],
          eventStart: '',
          eventEnd: '',
          minEventEnd: '',
          eventEditing: false,
          eventAllDay: false,
          eventOrder: {},
          eventOverlap: true,
          eventBackground: false,
          error: '',
        });

        let calendarApi = this.calendarRef.current.getApi()
        const event = calendarApi.getEventById(result.event)
        event.remove()
      }
    })
    .catch(e => console.log(e));
  }

  addEvent = e => {
    e.preventDefault();

    if(!this.state.eventTitle.trim().length ||
       !this.state.eventStart.trim().length ||
       !this.state.eventEnd.trim().length   ||
       !this.state.eventResource.length     ||
       this.state.eventStart.trim() >= this.state.eventEnd.trim())
      return;

    const event = {
      resourceIds: this.state.eventResource.map(resource => resource.id),
      title: this.state.eventTitle,
      description: this.state.eventDescription,
      start: this.state.eventStart,
      end: this.state.eventEnd,
      allDay: this.state.eventAllDay,
      order: this.state.eventOrder,
      overlap: this.state.eventOverlap,
      rendering: this.state.eventBackground,
    }

    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        this.setState({error: result.error})
      }

      if(result.event) {
        this.setState(state => {
          return {
            eventId: '',
            eventResource: [],
            eventTitle: '',
            eventDescription: '',
            eventStart: '',
            eventEnd: '',
            minEventEnd: '',
            eventEditing: false,
            eventAllDay: false,
            eventOrder: {},
            eventOverlap: true,
            eventBackground: false,
            error: '',
          }
        })

        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.refetchEvents()
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
          this.setState({resources: result.filter(resource => !resource.hide)})
      })
      .catch(e => console.log(e));
  }

  fetchEvents = (info, successCallback, failCallback) => {
    const { id } = this.props.app.user;
    let { start, end } = info
    start = moment(start).format('YYYY-MM-DD')
    end = moment(end).format('YYYY-MM-DD')
    const url = this.state.acl.settings.main.edit === true ? `/api/events/start/${start}/end/${end}` : `/api/events/start/${start}/end/${end}/resource/${id}`;
    
    fetch(url)
      .then(responce => responce.json())
      .then(result => {
        if(result.error)
          console.log(result.error);

        if(result.events)
          successCallback(result.events)
      })
      .catch(e => {
        console.log(e)
        failCallback(e)
      });
  }

  fetchOrders = () => {    
    fetch('/api/orders')
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        if(result)
          this.setState({orders: result})
      })
      .catch(e => console.log(e));
  }

  eventRender = info => {
    const typeView = info.view.type;
    if(typeView == 'timeGridWeek' ||
       typeView == 'timeGridDay'  ||
       typeView == 'dayGridMonth' ||
       typeView == 'listWeek') {

      if(info.el) {

        let content;
        let description;

        if(typeView == 'listWeek')
          content = info.el.querySelector('.fc-list-item-title');
        
        else {
          content = info.el.querySelector('.fc-content');

          $(info.el).popover({
            container: info.el,
            trigger: 'hover',
            title: info.event.title,
            content: info.event.extendedProps.description || ''
          });
        }

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
                onChange={(option) => context.handleMultipleSelectChange('eventResource', option)}
                options={context.resources}
                getOptionLabel={(option) => option.title}
                getOptionValue={(option) => option.id}
                value={context.eventResource}
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventOrder">Order</label>
              <Select
                isClearable
                placeholder=""
                id="eventOrder"
                name="eventOrder"
                onChange={(option) => context.handleSelectChange('eventOrder', option)}
                options={context.orders}
                getOptionLabel={(option) => option.title}
                getOptionValue={(option) => option.id}
                value={context.eventOrder}
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
                required
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
                min={context.minEventEnd}
                value={context.eventEnd} 
                onChange={context.handleInputChange} 
                required
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
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                value={context.eventBackground}
                checked={context.eventBackground}
                id="eventBackground"
                name="eventBackground"
                onChange={context.handleInputChange} 
              />
              <label className="form-check-label" htmlFor="eventBackground">
                Background
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                value={context.eventOverlap}
                checked={context.eventOverlap}
                id="eventOverlap"
                name="eventOverlap"
                onChange={context.handleInputChange} 
              />
              <label className="form-check-label" htmlFor="eventOverlap">
                Overlap
              </label>
            </div>
            <input type="hidden" value={context.eventId} />
          </div>
          {context.error && (
            <div className="card-footer bg-white">
              <small className="text-danger">{context.error}</small>
            </div>
          )}
          <div className="card-footer bg-white">
            <div className="btn-group">
              {context.eventEditing && 
                <div className="btn-group">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={
                      !context.eventTitle.trim().length || 
                      !context.eventResource.length || 
                      !context.eventStart.trim().length || 
                      !context.eventEnd.trim().length ||
                      context.eventStart.trim() >= context.eventEnd.trim()
                    }
                  >
                    Update
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary dropdown-toggle dropdown-toggle-split" 
                    data-toggle="dropdown" 
                    aria-haspopup="true" 
                    aria-expanded="false"
                    disabled={
                      !context.eventTitle.trim().length || 
                      !context.eventResource.length || 
                      !context.eventStart.trim().length || 
                      !context.eventEnd.trim().length ||
                      context.eventStart.trim() >= context.eventEnd.trim()
                    }
                  >
                    <span className="sr-only">Toggle Dropdown</span>
                  </button>
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="#" onClick={context.addEvent}>Add</a>
                  </div>
                </div>
              }
              {!context.eventEditing && 
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={
                    !context.eventTitle.trim().length || 
                    !context.eventResource.length || 
                    !context.eventStart.trim().length || 
                    !context.eventEnd.trim().length ||
                    context.eventStart.trim() >= context.eventEnd.trim()
                  }
                >
                  Add
                </button>
              }
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
              ref={context.calendarRef}
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
              businessHours={
                !context.acl.settings.main.edit == true 
                ? {
                    ...context.settings.settings.businessHours, 
                    daysOfWeek: context.settings.settings.businessHours.daysOfWeek.map(day => day.id)
                  }
                : false
              }
              scrollTime={'09:00:00'}
              views={{
                resourceTimelineDay: {
                  selectable: context.acl.settings.main.edit == true ? true : false,
                  titleFormat: {
                    month: 'long',
                    year: 'numeric',
                    day: 'numeric',
                    weekday: 'short'
                  }
                },
                resourceTimelineWeek: {
                  selectable: context.acl.settings.main.edit == true ? true : false,
                },
                resourceTimelineMonth: {
                  selectable: context.acl.settings.main.edit == true ? true : false,
                }
              }}
              resourceGroupField='group'
              resourceOrder='group,title'
              eventLimit={true}
              resourceRender={context.resourceRender}
              eventRender={context.eventRender}
              editable={context.acl.settings.main.edit == true ? true : false}
              nowIndicator={true}
              eventClick={context.handleEventClick}
              select={context.handleSelect}
              eventDrop={context.handleDrop}
              eventResize={context.handleResize}
              resources={context.resources}
              events={context.fetchEvents}
              selectOverlap={context.selectOverlap}
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

import React from 'react';
import ReactDOM from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';

import './style.scss';

class Calendar extends React.Component {
  state = {
    resources: [
      {
        id: 'a',
        title: 'Room A'
      },
      {
        id: 'b',
        title: 'Room b'
      },
      {
        id: 'c',
        title: 'Room c'
      }
    ],
    events: [
      {
        id: '1',
        resourceId: 'a',
        title: 'The Title',
        start: '2019-07-04T12:00:00'
      },
      {
        id: '2',
        resourceId: 'a',
        title: 'The Title 2',
        start: '2019-07-04T16:00:00',
        end: '2019-07-04T17:00:00'
      },
      {
        id: '3',
        resourceIds: ['c'],
        title: 'The Title 3',
        start: '2019-07-04T17:00:00',
        end: '2019-07-04T18:00:00'
      }
    ]
  }

  handleDateClick = e => {
    const title = prompt('Введите название события');
    if(title.trim().length) {
      const event = {
        id: Date.now(),
        resourceId: e.resource.id,
        title,
        start: e.dateStr
      }

      this.setState((state) => {
        return {events: [...state.events, event]}
      });
    }
  }

  handleEventClick = e => {
    console.log(e, e.event.getResources());
  }

  render() {
    return (
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
          right:  'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth dayGridMonth,timeGridWeek,timeGridDay, listDay'
        }}
        nowIndicator={true}
        dateClick={this.handleDateClick}
        eventClick={this.handleEventClick}
        resources={this.state.resources}
        events={this.state.events}
      />
    );
  }
}

ReactDOM.render(
  <Calendar />,
  document.getElementById('root')
);
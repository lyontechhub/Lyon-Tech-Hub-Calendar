import * as ics from 'ics';
import { EventAttributes } from 'ics';

import { Calendar } from '../domain/Calendar';
import { CalendarEvent } from '../domain/CalendarEvent';

const fromEventAttributesToIcsExposedCalendar = (events: EventAttributes[]): Promise<string> =>
  new Promise((resolve, reject) =>
    ics.createEvents(events, (error, value) => {
      /* v8 ignore next 2 */
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }),
  );

const toEventAttributes = (calendarEvent: CalendarEvent): EventAttributes => ({
  productId: 'lyontechhub/ics',
  title: calendarEvent.fullTitle.get,
  start: (calendarEvent.date.start as Date).getTime(),
  end: (calendarEvent.date.end as Date).getTime(),
  location: calendarEvent.address,
  description: calendarEvent.description,
});

const toEventAttributesList = (calendar: Calendar): EventAttributes[] => calendar.map(toEventAttributes);

export const toIcsExposedCalendar = (calendar: Calendar): Promise<string> =>
  fromEventAttributesToIcsExposedCalendar(toEventAttributesList(calendar));

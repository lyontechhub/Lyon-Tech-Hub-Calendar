import { Event, EventData } from './IcsParser';
import { CalendarEvent, Interval } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';
import * as dateFns from 'date-fns';

const convertToCalendarEvent = (group: string)=> (data: EventData) => (id: string) => (date: Interval) => {
  return CalendarEvent.of({
    id: `${group}-${id}`,
    title: Name.of(data.title),
    description: data.description,
    group: Name.of(group),
    date: date,
    address: data.location || undefined,
    geo: data.geo || undefined,
    url: data.url || undefined,
  })
}

export const toCalendarEvents =
  (group: string) =>
  (event: Event): CalendarEvent[] => {
    if(event.type == 'single') {
      return [
        convertToCalendarEvent(group)(event.data)(event.id)(event.date)
      ];
    }
    else {
      const convert = convertToCalendarEvent(group)(event.data)
      return event.dates.map(date => {
        return convert(`${event.id}-${dateFns.formatISO(date.start as Date)}`)(date)
      })
    }
  }


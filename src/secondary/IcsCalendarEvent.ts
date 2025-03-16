import * as dateFns from 'date-fns';

import { CalendarEvent, Interval, DateOnly } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

import { Event, EventData } from './IcsParser';

const convertToCalendarEvent = (group: string) => (data: EventData) => (id: string) => (date: Interval) => {
  return CalendarEvent.of({
    id: `${group}-${id}`,
    title: Name.of(data.title),
    description: data.description,
    group: Name.of(group),
    date: date,
    address: data.location || undefined,
    geo: data.geo || undefined,
    url: data.url || undefined,
  });
};

export const toCalendarEvents =
  (group: string) =>
  (event: Event): CalendarEvent[] => {
    if (event.type == 'single') {
      return [convertToCalendarEvent(group)(event.data)(event.id)(event.date)];
    } else {
      const convert = convertToCalendarEvent(group)(event.data);
      const formatKey = (date: DateOnly | Date) => {
        if (date instanceof Date) {
          return dateFns.formatDate(date, 'yyyy-MM-dd');
        }
        return `${date.year}-${date.month}-${date.day}`;
      };
      return event.dates.map((date) => {
        return convert(`${event.id}-${formatKey(date.start)}`)(date);
      });
    }
  };

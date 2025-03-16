import { Event } from './IcsParser';
import { CalendarEvent } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

export const toCalendarEvents =
  (group: string) =>
  (event: Event): CalendarEvent[] => {
    if(event.type == 'single') {
      return [CalendarEvent.of({
        id: `${group}-${event.id}`,
        title: Name.of(event.data.title),
        description: event.data.description,
        group: Name.of(group),
        date: event.date,
        address: event.data.location || undefined,
        geo: event.data.geo || undefined,
        url: event.data.url || undefined,
      })];
    }

    throw new Error('not implemented')
  }


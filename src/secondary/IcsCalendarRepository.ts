import * as ical from 'node-ical';
import { VEvent } from 'node-ical';

import { Calendar } from '../domain/Calendar';
import { CalendarRepository } from '../domain/CalendarRepository';

import { toCalendarEvent } from './IcsCalendarEvent';

const icalToCalendarEvent = (group: string, text: string): Calendar => {
  const events = ical.sync.parseICS(text);
  const calendarEvents = Object.values(events).filter((event) => event.type === 'VEVENT') as VEvent[];
  return calendarEvents.map(toCalendarEvent(group));
};

const fetchToGroupText = ([group, ics]: [string, string]) =>
  fetch(ics).then(async (response) => [group, await response.text()] satisfies [string, string]);

export class IcsCalendarRepository implements CalendarRepository {
  constructor(private readonly icsList: Record<string, string>) {}

  async get(): Promise<Calendar> {
    return Promise.all(Object.entries(this.icsList).map(fetchToGroupText)).then((list) =>
      list.flatMap(([group, text]) => icalToCalendarEvent(group, text)),
    );
  }
}

import { Calendar } from '../domain/Calendar';
import { CalendarRepository } from '../domain/CalendarRepository';

import { toCalendarEvent } from './IcsCalendarEvent';
import { parse } from './IcsParser';

const icalToCalendarEvent = (group: string, text: string): Calendar => {
  const calendarEvents = parse(text, new Date());
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

import { Calendar } from '../domain/Calendar';
import { CalendarRepository } from '../domain/CalendarRepository';

import { toCalendarEvents } from './IcsCalendarEvent';
import { parse } from './IcsParser';

const icalToCalendarEvent = (group: string, text: string): Calendar => {
  const calendarEvents = parse(text, new Date());
  return calendarEvents.flatMap(toCalendarEvents(group));
};

const fetchToGroupText = ([group, ics]: [string, string]) =>
  fetch(ics)
    .then(async (response) => [group, await response.text()] satisfies [string, string])
    .catch((e) => {
      throw new Error(`Impossible to fetch ${ics}`, { cause: e });
    });

const dropAndLogRejected = (result: PromiseSettledResult<string[]>) => {
  if (result.status === 'rejected') {
    console.error(result.reason);
    return [];
  }
  return [result.value];
};

export class IcsCalendarRepository implements CalendarRepository {
  constructor(private readonly icsList: Record<string, string>) {}

  async get(): Promise<Calendar> {
    return Promise.allSettled(Object.entries(this.icsList).map(fetchToGroupText)).then((list) =>
      list.flatMap(dropAndLogRejected).flatMap(([group, text]) => icalToCalendarEvent(group, text)),
    );
  }
}

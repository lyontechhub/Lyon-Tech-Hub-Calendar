import { Calendar } from '../domain/Calendar';
import { CalendarRepository } from '../domain/CalendarRepository';
import { serialize } from '../primary/JsonCalendar';

import { toCalendarEvents } from './IcsCalendarEvent';
import { parse } from './IcsParser';

const icalToCalendarEvent = (group: string, text: string): Calendar => {
  const calendarEvents = parse(text, new Date());
  return calendarEvents.flatMap(toCalendarEvents(group));
};

const fetchToGroupText = ([group, ics]: [string, string]): Promise<[string, string]> =>
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

type FetchToGroupText = typeof fetchToGroupText
export class IcsCalendarRepository implements CalendarRepository {
  private readonly fetchToGroupText: FetchToGroupText

  constructor(private readonly icsList: Record<string, string>, _fetchToGroupText?: FetchToGroupText) {
    this.fetchToGroupText = _fetchToGroupText || fetchToGroupText
  }

  async get(): Promise<Calendar> {
    return Promise.allSettled(Object.entries(this.icsList).map(this.fetchToGroupText)).then((list) =>
      list.flatMap(dropAndLogRejected).flatMap(([group, text]) => icalToCalendarEvent(group, text)),
    );
  }

  async export(): Promise<string> {
    const events = await this.get()

    const skipEventsTitle = 'Migration du calendrier LTH';
    const exportedEvents = events.filter(event => !event.fullTitle.get.includes(skipEventsTitle))
    const eventsDto = serialize(exportedEvents)
    return JSON.stringify(eventsDto, null, ' ')
  }
}

import { Calendar } from '../domain/Calendar';
import { CalendarRepository } from '../domain/CalendarRepository';
import { serialize } from '../primary/JsonCalendar';

import { toCalendarEvents } from './IcsCalendarEvent';
import { parse } from './IcsParser';

const icalToCalendarEvent = (group: string, text: string): Calendar => {
  const calendarEvents = parse(text, new Date());
  return calendarEvents.flatMap(toCalendarEvents(group));
};

const fetchToText = (url: string): Promise<string> =>
  fetch(url)
    .then(async (response) => await response.text())
    .catch((e) => {
      throw new Error(`Impossible to fetch ${url}`, { cause: e });
    });

const dropAndLogRejected = (result: PromiseSettledResult<string[]>) => {
  if (result.status === 'rejected') {
    console.error(result.reason);
    return [];
  }
  return [result.value];
};

type FetchToText = typeof fetchToText
export class IcsCalendarRepository implements CalendarRepository {
  private readonly fetchToText: FetchToText

  constructor(private readonly icsList: Record<string, string>, _fetchToText?: FetchToText) {
    this.fetchToText = _fetchToText || fetchToText
  }

  async get(): Promise<Calendar> {
    const loadAllGroups = (icsList: Record<string, string>) =>
      Object.entries(icsList).map(([group, ics]) =>
        this.fetchToText(ics).then(result => [group, result])
      )

    return Promise.allSettled(loadAllGroups(this.icsList)).then((list) =>
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

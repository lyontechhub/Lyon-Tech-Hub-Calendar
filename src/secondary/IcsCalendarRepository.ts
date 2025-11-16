import { Calendar } from '../domain/Calendar';
import { CalendarRepository } from '../domain/CalendarRepository';
import { serialize } from '../primary/JsonCalendar';

import { toCalendarEvents } from './IcsCalendarEvent';
import { parse } from './IcsParser';

const icalToCalendarEvent = (group: string, text: string): Calendar => {
  const calendarEvents = parse(text, new Date());
  return calendarEvents.flatMap(toCalendarEvents(group));
};

const defaultFetchToText = (url: string): Promise<string> =>
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

export type Config = {
  lyonTechHub: string
  groups: string
  oldEvents: string
}
interface GroupConfig {
  tag: string
  url: string
}

type FetchToText = typeof defaultFetchToText
export class IcsCalendarRepository implements CalendarRepository {
  private readonly fetchToText: FetchToText

  constructor(private readonly config: Config, _fetchToText?: FetchToText) {
    this.fetchToText = _fetchToText || defaultFetchToText
  }

  async get(): Promise<Calendar> {
    const getAllGroups = async () => {
      const response = await this.fetchToText(this.config.groups)
      return JSON.parse(response) as GroupConfig[]
    }

    const loadAllGroups = (icsList: GroupConfig[]) =>
      icsList.map(group =>
        this.fetchToText(group.url).then(result => [group.tag, result])
      )

    return Promise.allSettled(loadAllGroups(await getAllGroups())).then((list) =>
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

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

function dropAndLogRejected<T>(result: PromiseSettledResult<T>): T[]{
  if (result.status === 'rejected') {
    console.error(result.reason);
    return [];
  }
  return [result.value];
}

export type Config = {
  googleLyonTechHub: string
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
        this.fetchToText(group.url).then(result => icalToCalendarEvent(group.tag, result))
      )
    const loadGoogleLyonTechHub = async () => {
      const response = await this.fetchToText(this.config.googleLyonTechHub)
      const skipEventsTitle = 'Migration du calendrier LTH';
      return icalToCalendarEvent('LyonTechHub', response)
        .filter(event => !event.fullTitle.get.includes(skipEventsTitle))
    }
    const loadAllIcs = async () => {
      const groups = loadAllGroups(await getAllGroups());
      const lth = loadGoogleLyonTechHub()
      return groups.concat(lth)
    }

    return Promise.allSettled(await loadAllIcs()).then((list) =>
      list.flatMap(dropAndLogRejected<Calendar>).flatMap(c => c),
    );
  }

  async export(): Promise<string> {
    const events = await this.get()
    const eventsDto = serialize(events)
    return JSON.stringify(eventsDto, null, ' ')
  }
}

import * as ical from 'node-ical';
import { VEvent } from 'node-ical';

type SingleEvent = {
  type: string
  id: string
  start: Date
  end: Date
  data: EventData
}
type EventData = {
  title: string
  description: string
  url: String | null
  location: string | null
  geo: Geo | null
}
type Geo = {
  lat: number
  lon: number
}

function formatUrl(event: VEvent): String | null {
  const url = event.url as any
  if(url === null || url === undefined) return null;
  if(typeof url == 'string') return url;
  if(url instanceof Object && typeof url.val == 'string') return url.val;

  throw new Error(`Invalid url for event ${event.uid} => ${event.url}`);
}

function formatGeo(event: VEvent): Geo | null {
  const geo = event.geo
  if(geo === null || geo === undefined) return null;
  if(geo instanceof Object && typeof geo.lat == 'number' && typeof geo.lon == 'number') return geo;

  throw new Error(`Invalid geo for event ${event.uid} => ${event.geo}`);
}

const parseEvent = (event: VEvent): SingleEvent[] => {
  return [{
    type: 'single',
    id: event.uid,
    start: event.start,
    end: event.end,
    data: {
      title: event.summary,
      description: event.description,
      url: formatUrl(event),
      location: event.location || null,
      geo: formatGeo(event),
    },
  }]
}

export function parse(content: string, now: Date) {
  const calendar = ical.sync.parseICS(content)
  const events = Object.values(calendar).filter((event) => event.type === 'VEVENT') as VEvent[]

  return events.flatMap(parseEvent)
}

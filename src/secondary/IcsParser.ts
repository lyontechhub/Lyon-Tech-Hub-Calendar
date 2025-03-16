import * as dateFns from 'date-fns';
import { getTimezoneOffset } from 'date-fns-tz';
import * as ical from 'node-ical';
import { VEvent } from 'node-ical';

import { Interval, DateOnly, Geo } from '../domain/CalendarEvent';

export type Event = RecurrentEvent | SingleEvent;
export type RecurrentEvent = {
  type: 'recurrent';
  id: string;
  dates: Interval[];
  data: EventData;
};
export type SingleEvent = {
  type: 'single';
  id: string;
  date: Interval;
  data: EventData;
};
export type EventData = {
  title: string;
  description: string;
  url: string | null;
  location: string | null;
  geo: Geo | null;
};

function tryToExtractUrl(event: VEvent): string | null {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const url = event.url as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (url === null || url === undefined) return null;
  if (typeof url == 'string') return url;
  if (url instanceof Object && typeof url.val == 'string') return url.val;

  throw new Error(`Invalid url for event ${event.uid} => ${event.url}`);
}

function tryToExtractGeo(event: VEvent): Geo | null {
  const geo = event.geo;
  if (geo === null || geo === undefined) return null;
  if (geo instanceof Object && typeof geo.lat == 'number' && typeof geo.lon == 'number') return geo;

  throw new Error(`Invalid geo for event ${event.uid} => ${event.geo}`);
}

function extractEventData(event: ical.VEvent): EventData {
  return {
    title: event.summary,
    description: event.description || '',
    url: tryToExtractUrl(event),
    location: event.location || null,
    geo: tryToExtractGeo(event),
  };
}

function toDateOnly(date: ical.DateWithTimeZone, end: boolean): DateOnly {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() - (end ? 1 : 0) };
}

function extractInterval(event: VEvent): Interval {
  if (event.datetype === 'date') {
    return { start: toDateOnly(event.start, false), end: toDateOnly(event.end, true) };
  }
  return { start: event.start, end: event.end };
}

const parseEvent =
  (limitMax: Date) =>
  (event: VEvent): Event => {
    if (event.rrule) {
      const excludeDates = event.exdate ? Object.values(event.exdate).map((d) => dateFns.startOfDay(d as Date)) : [];
      const rrule = event.rrule;
      const fixDate = (date: Date) => {
        // Fix to correct the time according to the timezone documented in the libs readme. The question is why doesn't the libs do this directly??
        if (rrule.origOptions.tzid) {
          const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tz = rrule.origOptions.tzid;

          const localComputeTimezoneOffset = getTimezoneOffset(localTimezone, date);
          const computeOffset = getTimezoneOffset(tz, date);
          const originOffset = getTimezoneOffset(tz, event.start);

          const deltaOffsetTimezoneError = computeOffset - localComputeTimezoneOffset;
          const deltaOffsetOfOrigin = computeOffset - originOffset;

          const deltaOffset = deltaOffsetOfOrigin - deltaOffsetTimezoneError;
          return dateFns.addMilliseconds(date, -deltaOffset);
        } else {
          return dateFns.addHours(date, date.getHours() - (event.start.getTimezoneOffset() - date.getTimezoneOffset()) / 60);
        }
      };
      return {
        type: 'recurrent',
        id: event.uid,
        dates: event.rrule
          .between(dateFns.addDays(event.start, -1), limitMax)
          .filter((d) => !excludeDates.some((exclude) => dateFns.isEqual(dateFns.startOfDay(d), exclude)))
          .map((date) => {
            const start = fixDate(date);
            const duration = dateFns.differenceInMilliseconds(event.end, event.start);
            return { start, end: dateFns.addMilliseconds(start, duration) };
          }),
        data: extractEventData(event),
      };
    }

    return {
      type: 'single',
      id: event.uid,
      date: extractInterval(event),
      data: extractEventData(event),
    };
  };

export function parse(content: string, now: Date): Event[] {
  const calendar = ical.sync.parseICS(content);
  const events = Object.values(calendar).filter((event) => event.type === 'VEVENT') as VEvent[];

  const limitMax = dateFns.addYears(now, 1);
  return events.map(parseEvent(limitMax));
}

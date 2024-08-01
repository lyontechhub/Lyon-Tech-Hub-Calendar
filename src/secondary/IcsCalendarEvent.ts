import { VEvent } from 'node-ical';

import { CalendarEvent } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

export const toCalendarEvent =
  (group: string) =>
  (vEvent: VEvent): CalendarEvent =>
    CalendarEvent.of({
      title: Name.of(vEvent.summary),
      description: vEvent.description,
      group: Name.of(group),
      start: vEvent.start,
      end: vEvent.end,
      address: vEvent.location,
    });

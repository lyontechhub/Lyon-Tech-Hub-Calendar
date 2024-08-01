import * as ical from 'node-ical';
import { VEvent } from 'node-ical';
import { describe, it, expect } from 'vitest';

import { toCalendarEvent } from './IcsCalendarEvent';

function makeVEvent(body: string) {
  const icalEvents = Object.values(ical.sync.parseICS(body));
  const vEvent = icalEvents.at(0) as VEvent;
  return vEvent;
}

describe('IcsCalendarEvent', () => {
  it('should convert minimal event to CalendarEvent', () => {
    const vEvent = makeVEvent(`
BEGIN:VEVENT
SUMMARY:Title
UID:901AC34F-5C83-4ACC-8619-95C9CE39DF95
DTSTART:20240101T000000Z
DTEND:20240101T010000Z
END:VEVENT
    `);

    const calendarEvent = toCalendarEvent('minimal')(vEvent);

    expect(calendarEvent.fullTitle.get).toBe('[minimal] Title');
    expect(calendarEvent.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(calendarEvent.end).toEqual(new Date('2024-01-01T01:00:00.000Z'));
    expect(calendarEvent.address).toBeUndefined();
  });

  it('should convert full event to CalendarEvent', () => {
    const vEvent = makeVEvent(`
BEGIN:VEVENT
SUMMARY:Title
UID:901AC34F-5C83-4ACC-8619-95C9CE39DF95
DTSTART:20240101T000000Z
DTEND:20240101T010000Z
LOCATION:26 Rue Montorgueil 75001 Paris
DESCRIPTION:Lorem ipsum dolor sit amet\\, consectetur adipiscing elit. Donec i
 d commodo nulla. Aenean suscipit urna nec enim imperdiet\\, id vulputate er
 os facilisis.
END:VEVENT
    `);

    const calendarEvent = toCalendarEvent('full')(vEvent);

    expect(calendarEvent.fullTitle.get).toBe('[full] Title');
    expect(calendarEvent.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(calendarEvent.end).toEqual(new Date('2024-01-01T01:00:00.000Z'));
    expect(calendarEvent.description).toEqual(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id commodo nulla. Aenean suscipit urna nec enim imperdiet, id vulputate eros facilisis.',
    );
    expect(calendarEvent.address).toBe('26 Rue Montorgueil 75001 Paris');
  });
});

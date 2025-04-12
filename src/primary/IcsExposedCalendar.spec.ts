import { describe, it, expect } from 'vitest';

import { CalendarEvent } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

import { toIcsExposedCalendar } from './IcsExposedCalendar';

describe('IcsExposedCalendar', () => {
  it('should convert minimal to ICS', async () => {
    const exposedCalendar = await toIcsExposedCalendar([
      CalendarEvent.of({
        id: 'IdA',
        date: { start: new Date('2024-02-02T12:00:00.000Z'), end: new Date('2024-02-02T13:00:00.000Z') },
        title: Name.of('Exposed title'),
        group: Name.of('minimal'),
      }),
    ]);

    expect(exposedCalendar).toContain('SUMMARY:[minimal] Exposed title');
    expect(exposedCalendar).toContain('DTSTART:20240202T120000Z');
    expect(exposedCalendar).toContain('DTEND:20240202T130000Z');
  });

  it('should convert full to ICS', async () => {
    const exposedCalendar = await toIcsExposedCalendar([
      CalendarEvent.of({
        id: 'IdA',
        date: { start: new Date('2024-02-02T12:00:00.000Z'), end: new Date('2024-02-02T13:00:00.000Z') },
        title: Name.of('Exposed title'),
        group: Name.of('full'),
        description: 'Description',
        address: '22 Rue Delambre 75014 Paris',
        geo: { lat: 86.5, lon: 10.6 },
        url: 'https://example.com',
      }),
    ]);

    expect(exposedCalendar).toContain('SUMMARY:[full] Exposed title');
    expect(exposedCalendar).toContain('DTSTART:20240202T120000Z');
    expect(exposedCalendar).toContain('DTEND:20240202T130000Z');
    expect(exposedCalendar).toContain('LOCATION:22 Rue Delambre 75014 Paris');
    expect(exposedCalendar).toContain('DESCRIPTION:Description');
    expect(exposedCalendar).toContain('GEO:86.5;10.6');
    expect(exposedCalendar).toContain('URL:https://example.com');
  });

  it('should convert full day event to ICS', async () => {
    const exposedCalendar = await toIcsExposedCalendar([
      CalendarEvent.of({
        id: 'IdA',
        date: { start: { year: 2024, month: 2, day: 3 }, end: { year: 2024, month: 2, day: 3 } },
        title: Name.of('Exposed title'),
        group: Name.of('full'),
        description: 'Description',
        address: '22 Rue Delambre 75014 Paris',
      }),
    ]);

    expect(exposedCalendar).toContain('DTSTART;VALUE=DATE:20240203');
    expect(exposedCalendar).toContain('DTEND;VALUE=DATE:20240204');
  });
});

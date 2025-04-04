import { describe, it, expect } from 'vitest';

import { toCalendarEvents } from './IcsCalendarEvent';
import { Event } from './IcsParser';

describe('IcsCalendarEvent', () => {
  it('should convert minimal event to CalendarEvent', () => {
    const event: Event = {
      type: 'single',
      id: 'idA',
      date: { start: new Date('2024-01-01T00:00:00.000Z'), end: new Date('2024-01-01T01:00:00.000Z') },
      data: {
        title: 'Title',
        description: ``,
        url: null,
        location: null,
        geo: null,
      },
    };

    const calendarEvents = toCalendarEvents('minimal')(event);

    expect(calendarEvents).length(1);
    const calendarEvent = calendarEvents[0];
    expect(calendarEvent.fullTitle.get).toBe('[minimal] Title');
    expect(calendarEvent.id).toBe('minimal-idA');
    expect(calendarEvent.date.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(calendarEvent.date.end).toEqual(new Date('2024-01-01T01:00:00.000Z'));
    expect(calendarEvent.description).toEqual('');
    expect(calendarEvent.address).toBeUndefined();
    expect(calendarEvent.geo).toBeUndefined();
    expect(calendarEvent.url).toBeUndefined();
  });

  it('should convert full event to CalendarEvent', () => {
    const event: Event = {
      type: 'single',
      id: '901AC34F-5C83-4ACC-8619-95C9CE39DF95',
      date: { start: new Date('2024-01-01T00:00:00.000Z'), end: new Date('2024-01-01T01:00:00.000Z') },
      data: {
        title: 'Title',
        description: `Comme chaque année`,
        url: 'https://www.example.com',
        location: "EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France",
        geo: { lat: 45.7318991, lon: 4.948133 },
      },
    };

    const calendarEvents = toCalendarEvents('full')(event);

    expect(calendarEvents).length(1);
    const calendarEvent = calendarEvents[0];
    expect(calendarEvent.fullTitle.get).toBe('[full] Title');
    expect(calendarEvent.id).toBe('full-901AC34F-5C83-4ACC-8619-95C9CE39DF95');
    expect(calendarEvent.date.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(calendarEvent.date.end).toEqual(new Date('2024-01-01T01:00:00.000Z'));
    expect(calendarEvent.description).toEqual('Comme chaque année');
    expect(calendarEvent.address).toBe("EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France");
    expect(calendarEvent.geo).toStrictEqual({ lat: 45.7318991, lon: 4.948133 });
    expect(calendarEvent.url).toBe('https://www.example.com');
  });

  it('should convert recurrent event to single event', () => {
    const event: Event = {
      type: 'recurrent',
      id: '901AC34F-5C83-4ACC-8619-95C9CE39DF95',
      dates: [
        { start: new Date('2024-01-01T00:00:00.000Z'), end: new Date('2024-01-01T01:00:00.000Z') },
        { start: new Date('2024-01-03T00:00:00.000Z'), end: new Date('2024-01-03T01:00:00.000Z') },
      ],
      data: {
        title: 'Title',
        description: `Comme chaque année`,
        url: 'https://www.example.com',
        location: "EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France",
        geo: { lat: 45.7318991, lon: 4.948133 },
      },
    };

    const calendarEvents = toCalendarEvents('full')(event);

    expect(calendarEvents).length(2);

    calendarEvents.forEach((calendarEvent) => {
      expect(calendarEvent.fullTitle.get).toBe('[full] Title');
      expect(calendarEvent.description).toEqual('Comme chaque année');
      expect(calendarEvent.address).toBe("EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France");
      expect(calendarEvent.geo).toStrictEqual({ lat: 45.7318991, lon: 4.948133 });
      expect(calendarEvent.url).toBe('https://www.example.com');
    });

    const calendarEvent1 = calendarEvents[0];
    expect(calendarEvent1.id).toBe('full-901AC34F-5C83-4ACC-8619-95C9CE39DF95-2024-01-01');
    expect(calendarEvent1.date.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(calendarEvent1.date.end).toEqual(new Date('2024-01-01T01:00:00.000Z'));

    const calendarEvent2 = calendarEvents[1];
    expect(calendarEvent2.id).toBe('full-901AC34F-5C83-4ACC-8619-95C9CE39DF95-2024-01-03');
    expect(calendarEvent2.date.start).toEqual(new Date('2024-01-03T00:00:00.000Z'));
    expect(calendarEvent2.date.end).toEqual(new Date('2024-01-03T01:00:00.000Z'));
  });

  it('should convert recurrent event to single event with full day event', () => {
    const event: Event = {
      type: 'recurrent',
      id: '901AC34F-5C83-4ACC-8619-95C9CE39DF95',
      dates: [
        { start: { year: 2024, month: 5, day: 20 }, end: { year: 2024, month: 5, day: 20 } },
        { start: { year: 2024, month: 6, day: 20 }, end: { year: 2024, month: 6, day: 20 } },
      ],
      data: {
        title: 'Title',
        description: `Comme chaque année`,
        url: 'https://www.example.com',
        location: "EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France",
        geo: { lat: 45.7318991, lon: 4.948133 },
      },
    };

    const calendarEvents = toCalendarEvents('full')(event);

    expect(calendarEvents).length(2);

    const calendarEvent1 = calendarEvents[0];
    expect(calendarEvent1.id).toBe('full-901AC34F-5C83-4ACC-8619-95C9CE39DF95-2024-5-20');
    expect(calendarEvent1.date.start).toEqual({ year: 2024, month: 5, day: 20 });
    expect(calendarEvent1.date.end).toEqual({ year: 2024, month: 5, day: 20 });

    const calendarEvent2 = calendarEvents[1];
    expect(calendarEvent2.id).toBe('full-901AC34F-5C83-4ACC-8619-95C9CE39DF95-2024-6-20');
    expect(calendarEvent2.date.start).toEqual({ year: 2024, month: 6, day: 20 });
    expect(calendarEvent2.date.end).toEqual({ year: 2024, month: 6, day: 20 });
  });
});

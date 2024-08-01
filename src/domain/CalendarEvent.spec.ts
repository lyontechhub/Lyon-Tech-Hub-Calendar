import { describe, it, expect } from 'vitest';

import { CalendarEvent, CalendarEventBuilder } from './CalendarEvent';
import { Name } from './Name';

const expectForCalendarEvent = (minimal: CalendarEvent) => {
  expect(minimal.fullTitle.get).toBe('[Group] Title');
  expect(minimal.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  expect(minimal.end).toEqual(new Date('2024-01-01T01:00:00.000Z'));
};

const makeMinimalCalendar = (override: Partial<CalendarEventBuilder> = {}) =>
  CalendarEvent.of({
    title: Name.of('Title'),
    group: Name.of('Group'),
    start: new Date('2024-01-01T00:00:00.000Z'),
    end: new Date('2024-01-01T01:00:00.000Z'),
    ...override,
  });

const makeFull = () =>
  makeMinimalCalendar({
    description: 'Description',
    address: 'Address',
  });

describe('CalendarEvent', () => {
  it('should build minimal', () => {
    const minimal = makeMinimalCalendar();

    expectForCalendarEvent(minimal);
    expect(minimal.description).toBeUndefined();
    expect(minimal.address).toBeUndefined();
  });

  it('should build full', () => {
    const full = makeFull();

    expectForCalendarEvent(full);
    expect(full.description).toBe('Description');
    expect(full.address).toBe('Address');
  });
});

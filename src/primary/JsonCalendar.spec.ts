import { describe, it, expect } from 'vitest';

import { CalendarEvent } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

import { deserialize, serialize } from './JsonCalendar';

const sample = [
  CalendarEvent.of({
    id: 'IdA',
    date: { start: new Date('2024-02-02T12:00:00.000Z'), end: new Date('2024-02-02T13:00:00.000Z') },
    title: Name.of('Exposed title'),
    group: Name.of('minimal'),
    description: 'blabal bla',
    address: "15 rue de l'arbre",
    geo: { lat: 12.256, lon: 5.123 },
    url: 'https://example.com',
  }),
  CalendarEvent.of({
    id: 'IdB',
    date: { start: { year: 2025, month: 5, day: 25 }, end: { year: 2025, month: 5, day: 26 } },
    title: Name.of('Exposed title'),
    group: Name.of('minimal'),
  }),
];

describe('JsonCalendar', () => {
  it('should serialize and deserialize', async () => {
    const s1 = serialize(sample);
    const d1 = deserialize(s1);
    const s2 = serialize(d1);

    expect(s1).toEqual(s2);
    expect(JSON.stringify(sample)).toEqual(JSON.stringify(d1));
  });
});

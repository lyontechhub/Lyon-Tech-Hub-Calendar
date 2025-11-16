import { readFileSync } from 'node:fs';

import { describe, beforeEach, it, expect, vi } from 'vitest';

import { CalendarEvent, CalendarEventBuilder } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';
import { serialize, deserialize } from '../primary/JsonCalendar';

import { Config, IcsCalendarRepository } from './IcsCalendarRepository';

const defaultIcs: string = readFileSync(__dirname + '/samples/repositoryTest.ics', 'utf8')
const config: Config = {
  googleLyonTechHub: 'https://example.com/lth',
  groups: 'https://example.com/groups',
  oldEvents: 'https://example.com/old',
}

describe('IcsCalendarEvent', () => {
  const now = new Date('2025-02-15T10:11:12Z')
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  describe('get should', () => {
    it('return all events of all groups', async () => {
      const repository = new IcsCalendarRepository(config, url => {
        if(url == 'https://example.com/groups') return Promise.resolve(JSON.stringify([
          { tag: 'groupA', url: 'https://example.com/group_a' },
          { tag: 'groupB', url: 'https://example.com/group_b' },
        ]))
        if(url == 'https://example.com/group_a') return Promise.resolve(defaultIcs)
        if(url == 'https://example.com/group_b') return Promise.resolve(defaultIcs.replace('event_306666704', 'event_9999'))
        if(url == 'https://example.com/lth') return Promise.resolve(defaultIcs.replace('event_306666704', 'event_666'))
        if(url == 'https://example.com/old') return Promise.resolve('[]')

        throw `Invalid url ${url}`
      })

      const result = await repository.get()

      const expected: CalendarEventBuilder[] = [
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-19T20:00:00.000Z'),
            start: new Date('2025-03-19T18:00:00.000Z'),
          },
          group: Name.of('groupA'),
          id: "groupA-event_306666704@meetup.com",
          title: Name.of('Event B'),
          description: '',
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-20T20:30:00.000Z'),
            start: new Date('2025-03-20T17:30:00.000Z'),
          },
          group: Name.of('groupA'),
          id: "groupA-event_306104038@meetup.com",
          title: Name.of('Event A'),
          description: '',
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-19T20:00:00.000Z'),
            start: new Date('2025-03-19T18:00:00.000Z'),
          },
          group: Name.of('groupB'),
          id: "groupB-event_9999@meetup.com",
          title: Name.of('Event B'),
          description: '',
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-20T20:30:00.000Z'),
            start: new Date('2025-03-20T17:30:00.000Z'),
          },
          group: Name.of('groupB'),
          id: "groupB-event_306104038@meetup.com",
          title: Name.of('Event A'),
          description: '',
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-19T20:00:00.000Z'),
            start: new Date('2025-03-19T18:00:00.000Z'),
          },
          group: Name.of('LyonTechHub'),
          id: "LyonTechHub-event_666@meetup.com",
          title: Name.of('Event B'),
          description: '',
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-20T20:30:00.000Z'),
            start: new Date('2025-03-20T17:30:00.000Z'),
          },
          group: Name.of('LyonTechHub'),
          id: "LyonTechHub-event_306104038@meetup.com",
          title: Name.of('Event A'),
          description: '',
        },
      ]
      expect(serialize(result)).toEqual(serialize(expected.map(CalendarEvent.of)));
    })

    it('exclude migration event of google', async () => {
      const repository = new IcsCalendarRepository(config, url => {
        if(url == 'https://example.com/groups') return Promise.resolve(JSON.stringify([
          { tag: 'groupA', url: 'https://example.com/group_a' },
        ]))
        if(url == 'https://example.com/group_a') return Promise.resolve(defaultIcs.replace('Event A', 'Migration du calendrier LTH'))
        if(url == 'https://example.com/lth') return Promise.resolve(defaultIcs.replace('Event A', 'Migration du calendrier LTH'))
        if(url == 'https://example.com/old') return Promise.resolve('[]')

        throw `Invalid url ${url}`
      })

      const events = await repository.get()

      expect(events.map(e => e.id)).toEqual([
        "groupA-event_306666704@meetup.com",
        "groupA-event_306104038@meetup.com",
        "LyonTechHub-event_306666704@meetup.com",
      ]);
    })

    it('append old events', async () => {
      const oldEvents: CalendarEventBuilder[] = [
        {
          createdAt: new Date('2024-03-20T01:00:00.000Z'),
          updatedAt: new Date('2024-03-20T02:00:00.000Z'),
          date: {
            end: new Date('2024-03-20T20:30:00.000Z'),
            start: new Date('2024-03-20T17:30:00.000Z'),
          },
          group: Name.of('groupA'),
          id: "groupA-event_old1",
          title: Name.of('Event A'),
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2024-03-21T20:30:00.000Z'),
            start: new Date('2024-03-21T17:30:00.000Z'),
          },
          group: Name.of('groupC'),
          id: "groupC-event_old2",
          title: Name.of('Event B'),
        },
      ]
      const repository = new IcsCalendarRepository(config, url => {
        if(url == 'https://example.com/groups') return Promise.resolve(JSON.stringify([
          { tag: 'groupA', url: 'https://example.com/group_a' },
        ]))
        if(url == 'https://example.com/group_a') return Promise.resolve(defaultIcs)
        if(url == 'https://example.com/lth') return Promise.resolve('')
        if(url == 'https://example.com/old') return Promise.resolve(JSON.stringify(serialize(oldEvents.map(CalendarEvent.of))))

        throw `Invalid url ${url}`
      })

      const events = await repository.get()

      const expected: CalendarEventBuilder[] = [
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-19T20:00:00.000Z'),
            start: new Date('2025-03-19T18:00:00.000Z'),
          },
          group: Name.of('groupA'),
          id: "groupA-event_306666704@meetup.com",
          title: Name.of('Event B'),
          description: '',
        },
        {
          createdAt: now,
          updatedAt: now,
          date: {
            end: new Date('2025-03-20T20:30:00.000Z'),
            start: new Date('2025-03-20T17:30:00.000Z'),
          },
          group: Name.of('groupA'),
          id: "groupA-event_306104038@meetup.com",
          title: Name.of('Event A'),
          description: '',
        },
        ...oldEvents,
      ]
      expect(serialize(events)).toEqual(serialize(expected.map(CalendarEvent.of)));
    })

    it('ignore old events in the futur', async () => {
      const now = new Date('2025-02-15T10:11:12Z')
      vi.setSystemTime(now)
      const defaultOldEvents: CalendarEventBuilder = {
        createdAt: new Date('2024-03-20T01:00:00.000Z'),
        updatedAt: new Date('2024-03-20T02:00:00.000Z'),
        date: {
          start: new Date('2025-02-15T10:11:12Z'),
          end: new Date('2025-03-21T20:30:00.000Z'),
        },
        group: Name.of('groupC'),
        id: "groupC-event_old2",
        title: Name.of('Event B'),
      };
      const oldEvents: CalendarEventBuilder[] = [
        { ...defaultOldEvents,
          date: {
            start: new Date('2024-03-20T17:30:00.000Z'),
            end: new Date('2024-03-20T20:30:00.000Z'),
          },
          id: "groupA-event_old1",
        },
        { ...defaultOldEvents,
          date: {
            start: new Date('2025-02-15T10:11:12Z'),
            end: new Date('2024-03-20T20:30:00.000Z'),
          },
          id: "groupA-event_old2",
        },
        { ...defaultOldEvents,
          date: {
            start: new Date('2025-02-15T20:11:12Z'),
            end: new Date('2024-03-20T20:30:00.000Z'),
          },
          id: "groupA-event_old3",
        },
        { ...defaultOldEvents,
          date: {
            start: new Date('2025-02-16T10:11:12Z'),
            end: new Date('2024-03-20T20:30:00.000Z'),
          },
          id: "groupA-event_old4",
        },
        { ...defaultOldEvents,
          date: {
            start: { year: 2024, month: 3, day: 20 },
            end: { year: 2024, month: 3, day: 20 },
          },
          id: "groupA-event_old5",
        },
        { ...defaultOldEvents,
          date: {
            start: { year: 2025, month: 2, day: 15 },
            end: { year: 2024, month: 3, day: 20 },
          },
          id: "groupA-event_old6",
        },
        { ...defaultOldEvents,
          date: {
            start: { year: 2025, month: 2, day: 16 },
            end: { year: 2024, month: 3, day: 20 },
          },
          id: "groupA-event_old7",
        },
      ]
      const repository = new IcsCalendarRepository(config, url => {
        if(url == 'https://example.com/groups') return Promise.resolve(JSON.stringify([
          { tag: 'groupA', url: 'https://example.com/group_a' },
        ]))
        if(url == 'https://example.com/group_a') return Promise.resolve(defaultIcs)
        if(url == 'https://example.com/lth') return Promise.resolve('')
        if(url == 'https://example.com/old') return Promise.resolve(JSON.stringify(serialize(oldEvents.map(CalendarEvent.of))))

        throw `Invalid url ${url}`
      })

      const events = await repository.get()

      expect(events.map(e => e.id)).toEqual([
        "groupA-event_306666704@meetup.com",
        "groupA-event_306104038@meetup.com",
        "groupA-event_old1",
        "groupA-event_old2",
        "groupA-event_old5",
        "groupA-event_old6",
      ]);
    })
  })

  describe('export should', () => {
    it('return json stringify of all events', async () => {
      const repository = new IcsCalendarRepository(config, url => {
        if(url == 'https://example.com/groups') return Promise.resolve(JSON.stringify([
          { tag: 'groupA', url: 'https://example.com/group_a' },
        ]))
        if(url == 'https://example.com/group_a') return Promise.resolve(defaultIcs)
        if(url == 'https://example.com/lth') return Promise.resolve('')
        if(url == 'https://example.com/old') return Promise.resolve('[]')

        throw `Invalid url ${url}`
      })
      const events = await repository.get()

      const result = await repository.export()

      expect(deserialize(JSON.parse(result))).toEqual(events);
    })
  })
})

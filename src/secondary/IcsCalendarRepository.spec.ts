import { readFileSync } from 'node:fs';

import { describe, beforeEach, it, expect, vi } from 'vitest';

import { CalendarEvent, CalendarEventBuilder } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';
import { serialize, deserialize } from '../primary/JsonCalendar';

import { IcsCalendarRepository } from './IcsCalendarRepository';

const defaultIcs: string = readFileSync(__dirname + '/samples/repositoryTest.ics', 'utf8')

describe('IcsCalendarEvent', () => {
  const now = new Date('2025-10-15T10:11:12Z')
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  describe('get should', () => {
    it('return all events of all groups', async () => {
      const repository = new IcsCalendarRepository({
        groupA: 'https://example.com/group_a',
        groupB: 'https://example.com/group_b',
      }, ([group, url]) => {
        if(url == 'https://example.com/group_a') return Promise.resolve([group, defaultIcs])
        if(url == 'https://example.com/group_b') return Promise.resolve([group, defaultIcs.replace('event_306666704', 'event_9999')])

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
      ]
      expect(serialize(result)).toEqual(serialize(expected.map(CalendarEvent.of)));
    })
  })

  describe('export should', () => {
    it('return json stringify of all events', async () => {
      const repository = new IcsCalendarRepository({
        groupA: 'https://example.com/group_a',
      }, ([group, url]) => {
        if(url == 'https://example.com/group_a') return Promise.resolve([group, defaultIcs])

        throw `Invalid url ${url}`
      })
      const events = await repository.get()

      const result = await repository.export()

      expect(deserialize(JSON.parse(result))).toEqual(events);
    })

    it('exclude migration event', async () => {
      const repository = new IcsCalendarRepository({
        groupA: 'https://example.com/group_a',
      }, ([group, url]) => {
        if(url == 'https://example.com/group_a') return Promise.resolve([group, defaultIcs.replace('Event A', 'Migration du calendrier LTH')])

        throw `Invalid url ${url}`
      })

      const result = await repository.export()

      const events = deserialize(JSON.parse(result))
      expect(events).has.length(1);
    })
  })
})

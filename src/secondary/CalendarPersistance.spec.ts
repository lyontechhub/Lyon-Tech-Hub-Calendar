import { createClient } from '@supabase/supabase-js';
import { describe, it, expect } from 'vitest';

import { CalendarEvent } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

import { CalendarPersistance, Database } from './CalendarPersistance';

describe('CalendarPersistance', () => {
  it('should save', async () => {
    const client = createClient<Database>(process.env['SUPABASE_URL']!, process.env['SUPABASE_KEY']!);
    const response = await client.from('events').insert({ id: 1 });
    console.log(response);

    const calendar = [
      CalendarEvent.of({
        id: 'id',
        title: Name.of('Title'),
        start: new Date('2024-01-01T00:00:00.000Z'),
        end: new Date('2024-01-01T01:00:00.000Z'),
        group: Name.of('group'),
      }),
    ];
    const calendarPeristance = new CalendarPersistance(client);

    calendarPeristance.save(calendar);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { calendarGenerator } from './CalendarGenerator';
import { fakeStaticIcsServer } from './FakeStaticIcsServer.fixture';

const alpha = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:First
DTSTART:20010101T000000Z
DTEND:20010101T010000Z
LOCATION:1 Rue Paul Klee 75013 France
UID:79764934-C485-4F33-BB00-F155AF81BA1B
END:VEVENT
END:VCALENDAR`;

const beta = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:One
DTSTART:20020101T000000Z
DTEND:20020101T010000Z
LOCATION:16 Rue des Tournelles 75004 Paris
UID:7E67DD3F-D73D-4D5B-93AD-459238E2C22E
END:VEVENT
END:VCALENDAR`;

describe('Generator', () => {
  const server = fakeStaticIcsServer(3042, { alpha, beta });
  beforeAll(server.start);
  afterAll(server.stop);

  it('should generate ICS calendar from multiple groups', async () => {
    const result = await calendarGenerator({
      Alpha: 'http://localhost:3042/alpha.ics',
      Beta: 'http://localhost:3042/beta.ics',
    });

    expect(result).toContain('PRODID:lyontechhub/ics');
    expect(result).toContain('SUMMARY:[Alpha] First');
    expect(result).toContain('SUMMARY:[Beta] One');
  });
});

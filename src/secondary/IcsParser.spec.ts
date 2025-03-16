import * as fs from 'fs';
import * as path from 'path';

import { describe, it, expect } from 'vitest';

import { parse, RecurrentEvent, SingleEvent } from './IcsParser';

const getSample = (name: string): string => fs.readFileSync(path.resolve(__dirname, 'samples', name + '.ics'), 'utf-8');

const now = new Date();

describe('IcsParser.parse should', () => {
  it('extract standard event', () => {
    const content = `BEGIN:VCALENDAR
VERSION:2.0
TZID:Europe/Paris
BEGIN:VEVENT
UID:event_306666704@meetup.com
SEQUENCE:1
DTSTAMP:20250315T195506Z
DTSTART;TZID=Europe/Paris:20250319T190000
DTEND;TZID=Europe/Paris:20250319T210000
SUMMARY:[En ligne] Forum ouvert
DESCRIPTION:BlaBla\\n\\n1. Bli
 bli
STATUS:CONFIRMED
CREATED:20250311T175449Z
LAST-MODIFIED:20250311T175449Z
CLASS:PUBLIC
END:VEVENT
BEGIN:VTIMEZONE
TZID:Europe/Paris
BEGIN:STANDARD
DTSTART:20241027T020000
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20250330T030000
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
END:DAYLIGHT
END:VTIMEZONE
END:VCALENDAR`;

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: 'event_306666704@meetup.com',
        date: { start: new Date('2025-03-19T18:00:00.000Z'), end: new Date('2025-03-19T20:00:00.000Z') },
        data: {
          title: '[En ligne] Forum ouvert',
          description: `BlaBla

1. Blibli`,
          url: null,
          location: null,
          geo: null,
        },
      },
    ]);
  });

  it('extract url event', () => {
    const content = `
BEGIN:VEVENT
UID:606@aldil.org
DTSTART;TZID=Europe/Paris:20250327T183000
DTEND;TZID=Europe/Paris:20250327T200000
DTSTAMP:20240926T190211Z
URL:https://www.aldil.org/events/reunion-du-ca-44/
SUMMARY:Réunion du CA
DESCRIPTION:Réunion administrative
ATTACH;FMTTYPE=image/jpeg:https://www.aldil.org/wp-content/uploads/2018/11
 /ALDIL_only_R2.png
CATEGORIES:Réunion
END:VEVENT`;

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: '606@aldil.org',
        date: { start: new Date('2025-03-27T17:30:00.000Z'), end: new Date('2025-03-27T19:00:00.000Z') },
        data: {
          title: 'Réunion du CA',
          description: `Réunion administrative`,
          url: 'https://www.aldil.org/events/reunion-du-ca-44/',
          location: null,
          geo: null,
        },
      },
    ]);
  });

  it('support url in object', () => {
    const content = `
BEGIN:VEVENT
UID:event_306666704@meetup.com
SEQUENCE:1
DTSTAMP:20250315T195506Z
DTSTART;TZID=Europe/Paris:20250319T190000
DTEND;TZID=Europe/Paris:20250319T210000
SUMMARY:[En ligne] Forum ouvert
DESCRIPTION:BlaBla
URL;VALUE=URI:https://www.meetup.com/software-craftsmanship-lyon/events/30
 6666704/
STATUS:CONFIRMED
CREATED:20250311T175449Z
LAST-MODIFIED:20250311T175449Z
CLASS:PUBLIC
END:VEVENT`;

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: 'event_306666704@meetup.com',
        date: { start: new Date('2025-03-19T18:00:00.000Z'), end: new Date('2025-03-19T20:00:00.000Z') },
        data: {
          title: '[En ligne] Forum ouvert',
          description: `BlaBla`,
          url: 'https://www.meetup.com/software-craftsmanship-lyon/events/306666704/',
          location: null,
          geo: null,
        },
      },
    ]);
  });

  it('support recurrent event', () => {
    const content = `
BEGIN:VEVENT
DTSTART;TZID=Europe/Paris:20240109T190000
DTEND;TZID=Europe/Paris:20240109T210000
RRULE:FREQ=MONTHLY;BYDAY=2TU
EXDATE;TZID=Europe/Paris:20240213T190000
EXDATE;TZID=Europe/Paris:20240409T190000
EXDATE;TZID=Europe/Paris:20240910T190000
EXDATE;TZID=Europe/Paris:20241008T190000
EXDATE;TZID=Europe/Paris:20241210T190000
EXDATE;TZID=Europe/Paris:20250114T190000
EXDATE;TZID=Europe/Paris:20250211T190000
DTSTAMP:20250315T195944Z
UID:38slc1nh3ssaq09b5ac3tv7gpo_R20240109T180000@google.com
CREATED:20190410T082134Z
DESCRIPTION:https://www.meetup.com/fr-FR/humantalks-lyon/events/
LAST-MODIFIED:20250311T191900Z
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Human Talks
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:NONE
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
END:VALARM
END:VEVENT`;
    const now = new Date(2025, 1, 2);

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'recurrent',
        id: '38slc1nh3ssaq09b5ac3tv7gpo_R20240109T180000@google.com',
        dates: [
          { start: new Date('2024-01-09T18:00:00.000Z'), end: new Date('2024-01-09T20:00:00.000Z') },
          { start: new Date('2024-03-12T18:00:00.000Z'), end: new Date('2024-03-12T20:00:00.000Z') },
          { start: new Date('2024-05-14T17:00:00.000Z'), end: new Date('2024-05-14T19:00:00.000Z') },
          { start: new Date('2024-06-11T17:00:00.000Z'), end: new Date('2024-06-11T19:00:00.000Z') },
          { start: new Date('2024-07-09T17:00:00.000Z'), end: new Date('2024-07-09T19:00:00.000Z') },
          { start: new Date('2024-08-13T17:00:00.000Z'), end: new Date('2024-08-13T19:00:00.000Z') },
          { start: new Date('2024-11-12T18:00:00.000Z'), end: new Date('2024-11-12T20:00:00.000Z') },
          { start: new Date('2025-03-11T18:00:00.000Z'), end: new Date('2025-03-11T20:00:00.000Z') },
          { start: new Date('2025-04-08T17:00:00.000Z'), end: new Date('2025-04-08T19:00:00.000Z') },
          { start: new Date('2025-05-13T17:00:00.000Z'), end: new Date('2025-05-13T19:00:00.000Z') },
          { start: new Date('2025-06-10T17:00:00.000Z'), end: new Date('2025-06-10T19:00:00.000Z') },
          { start: new Date('2025-07-08T17:00:00.000Z'), end: new Date('2025-07-08T19:00:00.000Z') },
          { start: new Date('2025-08-12T17:00:00.000Z'), end: new Date('2025-08-12T19:00:00.000Z') },
          { start: new Date('2025-09-09T17:00:00.000Z'), end: new Date('2025-09-09T19:00:00.000Z') },
          { start: new Date('2025-10-14T17:00:00.000Z'), end: new Date('2025-10-14T19:00:00.000Z') },
          { start: new Date('2025-11-11T18:00:00.000Z'), end: new Date('2025-11-11T20:00:00.000Z') },
          { start: new Date('2025-12-09T18:00:00.000Z'), end: new Date('2025-12-09T20:00:00.000Z') },
          { start: new Date('2026-01-13T18:00:00.000Z'), end: new Date('2026-01-13T20:00:00.000Z') },
        ],
        data: {
          title: 'Human Talks',
          description: `https://www.meetup.com/fr-FR/humantalks-lyon/events/`,
          url: null,
          location: null,
          geo: null,
        },
      },
    ]);
  });

  it('support recurrent event without exclude date', () => {
    const content = `
BEGIN:VEVENT
DTSTART;TZID=Europe/Paris:20240109T190000
DTEND;TZID=Europe/Paris:20240109T210000
RRULE:FREQ=MONTHLY;BYDAY=2TU
DTSTAMP:20250315T195944Z
UID:38slc1nh3ssaq09b5ac3tv7gpo_R20240109T180000@google.com
CREATED:20190410T082134Z
DESCRIPTION:https://www.meetup.com/fr-FR/humantalks-lyon/events/
LAST-MODIFIED:20250311T191900Z
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Human Talks
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:NONE
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
END:VALARM
END:VEVENT`;
    const now = new Date(2025, 1, 2);

    const calendarEvent = parse(content, now);

    expect(calendarEvent).length(1);
    expect((calendarEvent[0] as RecurrentEvent).dates).length(25);
  });

  it('extract location event', () => {
    const content = `
BEGIN:VEVENT
UID:628@aldil.org
DTSTART;TZID=Europe/Paris:20250321T100000
DTEND;TZID=Europe/Paris:20250323T200000
DTSTAMP:20250309T220455Z
URL:https://www.aldil.org/events/salon-primevere-3/
SUMMARY:Salon Primevère
DESCRIPTION:Comme chaque année
ATTACH;FMTTYPE=image/jpeg:https://www.aldil.org/wp-content/uploads/2024/02
 /primevere-2024.png
CATEGORIES:Primevère,Salon - Convention
LOCATION:EUREXPO LYON\\, Boulevard de l'Europe\\, CHASSIEU\\, 69680\\, Auvergne
 -Rhône-Alpes\\, France
GEO:45.7318991;4.9481330
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=Boulevard de l'Europe\\, CHA
 SSIEU\\, 69680\\, Auvergne-Rhône-Alpes\\, France;X-APPLE-RADIUS=100;X-TITLE=
 EUREXPO LYON:geo:45.7318991,4.9481330
END:VEVENT`;

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: '628@aldil.org',
        date: { start: new Date('2025-03-21T09:00:00.000Z'), end: new Date('2025-03-23T19:00:00.000Z') },
        data: {
          title: 'Salon Primevère',
          description: `Comme chaque année`,
          url: 'https://www.aldil.org/events/salon-primevere-3/',
          location: "EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France",
          geo: { lat: 45.7318991, lon: 4.948133 },
        },
      },
    ]);
  });

  it('detect full day', () => {
    const content = `
BEGIN:VEVENT
DTSTART;VALUE=DATE:20240409
DTEND;VALUE=DATE:20240410
DTSTAMP:20250315T195944Z
UID:1734128e-e4031cff-e22f-4506-b1b6-23082c597ecc
CREATED:20240314T080647Z
DESCRIPTION:https://www.helloasso.com/associations/hackyourjob-community-ly
 on/evenements/unconf-avril-2024
LAST-MODIFIED:20240314T080647Z
LOCATION:L'augusterie\\, 39 rue Alexandre Boutin 69100 Villeurbanne
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:[HYJ] Unconf avril 2024
TRANSP:TRANSPARENT
END:VEVENT`;

    const calendarEvent = parse(content, now);

    expect((calendarEvent[0] as SingleEvent).date).toStrictEqual({
      start: { year: 2024, month: 4, day: 9 },
      end: { year: 2024, month: 4, day: 9 },
    });
  });

  it('extract events of google', () => {
    const content = getSample('google');
    const now = new Date(2025, 1, 2);

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: '1734128e-e4031cff-e22f-4506-b1b6-23082c597ecc',
        date: { start: { year: 2024, month: 4, day: 9 }, end: { year: 2024, month: 4, day: 9 } },
        data: {
          title: '[HYJ] Unconf avril 2024',
          description: 'https://www.helloasso.com/associations/hackyourjob-community-lyon/evenements/unconf-avril-2024',
          url: null,
          location: `L'augusterie, 39 rue Alexandre Boutin 69100 Villeurbanne`,
          geo: null,
        },
      },
      {
        type: 'single',
        id: '5q9fdptdbnp0drg660phqe6i7q@google.com',
        date: { start: new Date('2024-03-25T18:00:00.000Z'), end: new Date('2024-03-25T20:00:00.000Z') },
        data: {
          title: '[SwCrafters] [CraftTalk] Le TDD : du Kata à la Production',
          description:
            'For full details, including the address, and to RSVP see: https://www.meetup.com/fr-FR/software-craftsmanship-lyon/events/299402173',
          url: null,
          location: `L'augusterie, 39 Rue Alexandre Boutin · Villeurbanne`,
          geo: null,
        },
      },
      {
        type: 'recurrent',
        id: '38slc1nh3ssaq09b5ac3tv7gpo@google.com',
        dates: [
          { start: new Date('2019-04-09T17:00:00.000Z'), end: new Date('2019-04-09T19:00:00.000Z') },
          { start: new Date('2019-05-14T17:00:00.000Z'), end: new Date('2019-05-14T19:00:00.000Z') },
          { start: new Date('2019-06-11T17:00:00.000Z'), end: new Date('2019-06-11T19:00:00.000Z') },
          { start: new Date('2019-07-09T17:00:00.000Z'), end: new Date('2019-07-09T19:00:00.000Z') },
          { start: new Date('2019-09-10T17:00:00.000Z'), end: new Date('2019-09-10T19:00:00.000Z') },
          { start: new Date('2020-01-14T18:00:00.000Z'), end: new Date('2020-01-14T20:00:00.000Z') },
        ],
        data: {
          title: 'Human Talks',
          description: ``,
          url: null,
          location: null,
          geo: null,
        },
      },
      {
        type: 'recurrent',
        id: '38slc1nh3ssaq09b5ac3tv7gpo_R20240109T180000@google.com',
        dates: [
          { start: new Date('2024-01-09T18:00:00.000Z'), end: new Date('2024-01-09T20:00:00.000Z') },
          { start: new Date('2024-03-12T18:00:00.000Z'), end: new Date('2024-03-12T20:00:00.000Z') },
          { start: new Date('2024-05-14T17:00:00.000Z'), end: new Date('2024-05-14T19:00:00.000Z') },
          { start: new Date('2024-06-11T17:00:00.000Z'), end: new Date('2024-06-11T19:00:00.000Z') },
          { start: new Date('2024-07-09T17:00:00.000Z'), end: new Date('2024-07-09T19:00:00.000Z') },
          { start: new Date('2024-08-13T17:00:00.000Z'), end: new Date('2024-08-13T19:00:00.000Z') },
          { start: new Date('2024-11-12T18:00:00.000Z'), end: new Date('2024-11-12T20:00:00.000Z') },
          { start: new Date('2025-03-11T18:00:00.000Z'), end: new Date('2025-03-11T20:00:00.000Z') },
          { start: new Date('2025-04-08T17:00:00.000Z'), end: new Date('2025-04-08T19:00:00.000Z') },
          { start: new Date('2025-05-13T17:00:00.000Z'), end: new Date('2025-05-13T19:00:00.000Z') },
          { start: new Date('2025-06-10T17:00:00.000Z'), end: new Date('2025-06-10T19:00:00.000Z') },
          { start: new Date('2025-07-08T17:00:00.000Z'), end: new Date('2025-07-08T19:00:00.000Z') },
          { start: new Date('2025-08-12T17:00:00.000Z'), end: new Date('2025-08-12T19:00:00.000Z') },
          { start: new Date('2025-09-09T17:00:00.000Z'), end: new Date('2025-09-09T19:00:00.000Z') },
          { start: new Date('2025-10-14T17:00:00.000Z'), end: new Date('2025-10-14T19:00:00.000Z') },
          { start: new Date('2025-11-11T18:00:00.000Z'), end: new Date('2025-11-11T20:00:00.000Z') },
          { start: new Date('2025-12-09T18:00:00.000Z'), end: new Date('2025-12-09T20:00:00.000Z') },
          { start: new Date('2026-01-13T18:00:00.000Z'), end: new Date('2026-01-13T20:00:00.000Z') },
        ],
        data: {
          title: 'Human Talks',
          description: `https://www.meetup.com/fr-FR/humantalks-lyon/events/`,
          url: null,
          location: null,
          geo: null,
        },
      },
    ]);
  });

  it('extract events of meetup', () => {
    const content = getSample('meetup');

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: 'event_306666704@meetup.com',
        date: { start: new Date('2025-03-19T18:00:00.000Z'), end: new Date('2025-03-19T20:00:00.000Z') },
        data: {
          title: '[En ligne] Forum ouvert',
          description: `BlaBla

1. Blibli`,
          url: 'https://www.meetup.com/software-craftsmanship-lyon/events/306666704/',
          location: null,
          geo: null,
        },
      },
      {
        type: 'single',
        id: 'event_306104038@meetup.com',
        date: { start: new Date('2025-03-20T17:30:00.000Z'), end: new Date('2025-03-20T20:30:00.000Z') },
        data: {
          title: '🍻 Super Apéro PHP chez WanadevDigital 🥤',
          description: `Antenne AFUP Lyon`,
          url: 'https://www.meetup.com/afup-lyon-php/events/306104038/',
          location: null,
          geo: null,
        },
      },
    ]);
  });

  it('extract events of wordpress', () => {
    const content = getSample('wordpress');

    const calendarEvent = parse(content, now);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: '630@aldil.org',
        date: { start: new Date('2025-03-18T17:30:00.000Z'), end: new Date('2025-03-18T19:00:00.000Z') },
        data: {
          title: 'Réunion du CA',
          description: `Réunion administrative

Réservé aux adhérent·e·s et invité·e·s

Réunion intermédiaire. (à confirmer)

A distance avec BigBlueButton (lien fourni aux membres et aux invité•e•s).`,
          url: 'https://www.aldil.org/events/reunion-du-ca-48/',
          location: null,
          geo: null,
        },
      },
      {
        type: 'single',
        id: '592@aldil.org',
        date: { start: new Date('2025-03-20T18:00:00.000Z'), end: new Date('2025-03-20T20:00:00.000Z') },
        data: {
          title: 'Jeudi du graphisme : Illustrations personnalisables',
          description: `Illustrer vos supports visuels avec des mises en scène sur mesure

Comment optimiser l'utilisation du site undraw.co pour trouver desillustrations personnalisables directement sur le site ou encore plus subtilement avec Inkscape.
GRATUIT

Atelier animé les étudiant•e•s de la Licence Colibre, partenaire de l'ALDIL.


`,
          url: 'https://www.aldil.org/events/jeudi-du-graphisme-2025-03/',
          location: 'Maison pour tous / Salle des Rancy, 249 rue Vendôme, LYON, 69003, Auvergne-Rhône-Alpes, France',
          geo: { lat: 45.7559745, lon: 4.8477739 },
        },
      },
      {
        type: 'single',
        id: '628@aldil.org',
        date: { start: new Date('2025-03-21T09:00:00.000Z'), end: new Date('2025-03-23T19:00:00.000Z') },
        data: {
          title: 'Salon Primevère',
          description: `Comme chaque année, l’ALDIL sera présente sur l’espace Numérique Libre du salon Primevère pour faire connaitre les logiciels libres par l'échange sur le stand et par les conférences proposées tout au long du salon.

OUVERTURE
Vendredi 11h - 21h
Samedi 10h - 20h
Dimanche 10h - 18h



Le programme du pôle numérique de #PrimevereSalon 2025 est en ligne : https://www.salonprimevere.org/programmation/theme/numerique

Pas de tente de conférence dédiée cette année, mais des interventions tout de même. Notamment de @Framasoft.



&nbsp;

Plus d'infos sur https://www.salonprimevere.org/`,
          url: 'https://www.aldil.org/events/salon-primevere-3/',
          location: "EUREXPO LYON, Boulevard de l'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France",
          geo: { lat: 45.7318991, lon: 4.948133 },
        },
      },
      {
        type: 'single',
        id: '606@aldil.org',
        date: { start: new Date('2025-03-27T17:30:00.000Z'), end: new Date('2025-03-27T19:00:00.000Z') },
        data: {
          title: 'Réunion du CA',
          description: `Réunion administrative

Réservé aux adhérent·e·s et invité·e·s

Une fois par mois, le conseil d'administration (CA) de l'ALDIL se réunit pour faire le bilan des activités passées et préparer celles à venir.
C'est aussi un moment propice pour inviter d'éventuels partenaires ou futurs adhérents à nous rencontrer.

A distance avec BigBlueButton (lien fourni aux membres et aux invité•e•s).`,
          url: 'https://www.aldil.org/events/reunion-du-ca-44/',
          location: null,
          geo: null,
        },
      },
    ]);
  });
});

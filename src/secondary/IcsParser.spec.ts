import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { parse } from './IcsParser';

const getSample = (name: string): string => fs.readFileSync(path.resolve(__dirname, 'samples', name + '.ics'), 'utf-8')

let now = new Date()

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
END:VCALENDAR`

    const calendarEvent = parse(content);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: 'event_306666704@meetup.com',
        title: '[En ligne] Forum ouvert',
        description: `BlaBla

1. Blibli`,
        start: new Date('2025-03-19T18:00:00.000Z'),
        end: new Date('2025-03-19T20:00:00.000Z'),
        url: null,
        location: null,
        geo: null,
      }
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
END:VEVENT`

    const calendarEvent = parse(content);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: '606@aldil.org',
        title: 'Réunion du CA',
        description: `Réunion administrative`,
        start: new Date('2025-03-27T17:30:00.000Z'),
        end: new Date('2025-03-27T19:00:00.000Z'),
        url: 'https://www.aldil.org/events/reunion-du-ca-44/',
        location: null,
        geo: null,
      }
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
END:VEVENT`

    const calendarEvent = parse(content);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: 'event_306666704@meetup.com',
        title: '[En ligne] Forum ouvert',
        description: `BlaBla`,
        start: new Date('2025-03-19T18:00:00.000Z'),
        end: new Date('2025-03-19T20:00:00.000Z'),
        url: 'https://www.meetup.com/software-craftsmanship-lyon/events/306666704/',
        location: null,
        geo: null,
      }
    ]);
  });

  // it('extract events of google', () => {
  //   const content = getSample('google')

  //   const calendarEvent = parse(content);

  //   expect(calendarEvent).toBe('[minimal] Title');
  // });

  it('extract events of meetup', () => {
    const content = getSample('meetup')

    const calendarEvent = parse(content);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: 'event_306666704@meetup.com',
        title: '[En ligne] Forum ouvert',
        description: `BlaBla

1. Blibli`,
        start: new Date('2025-03-19T18:00:00.000Z'),
        end: new Date('2025-03-19T20:00:00.000Z'),
        url: 'https://www.meetup.com/software-craftsmanship-lyon/events/306666704/',
        location: null,
        geo: null,
      },
      {
        type: 'single',
        id: 'event_306104038@meetup.com',
        title: '🍻 Super Apéro PHP chez WanadevDigital 🥤',
        description: `Antenne AFUP Lyon`,
        start: new Date('2025-03-20T17:30:00.000Z'),
        end: new Date('2025-03-20T20:30:00.000Z'),
        url: 'https://www.meetup.com/afup-lyon-php/events/306104038/',
        location: null,
        geo: null,
      },
    ]);
  });

  it('extract events of wordpress', () => {
    const content = getSample('wordpress')

    const calendarEvent = parse(content);

    expect(calendarEvent).toStrictEqual([
      {
        type: 'single',
        id: '630@aldil.org',
        title: 'Réunion du CA',
        description: `Réunion administrative

Réservé aux adhérent·e·s et invité·e·s

Réunion intermédiaire. (à confirmer)

A distance avec BigBlueButton (lien fourni aux membres et aux invité•e•s).`,
        start: new Date('2025-03-18T17:30:00.000Z'),
        end: new Date('2025-03-18T19:00:00.000Z'),
        url: 'https://www.aldil.org/events/reunion-du-ca-48/',
        location: null,
        geo: null,
      },
      {
        type: 'single',
        id: '592@aldil.org',
        title: 'Jeudi du graphisme : Illustrations personnalisables',
        description: `Illustrer vos supports visuels avec des mises en scène sur mesure

Comment optimiser l'utilisation du site undraw.co pour trouver desillustrations personnalisables directement sur le site ou encore plus subtilement avec Inkscape.
GRATUIT

Atelier animé les étudiant•e•s de la Licence Colibre, partenaire de l'ALDIL.


`,
        start: new Date('2025-03-20T18:00:00.000Z'),
        end: new Date('2025-03-20T20:00:00.000Z'),
        url: 'https://www.aldil.org/events/jeudi-du-graphisme-2025-03/',
        location: 'Maison pour tous / Salle des Rancy, 249 rue Vendôme, LYON, 69003, Auvergne-Rhône-Alpes, France',
        geo: { lat: 45.7559745, lon: 4.8477739 },
      },
      {
        type: 'single',
        id: '628@aldil.org',
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
        start: new Date('2025-03-21T09:00:00.000Z'),
        end: new Date('2025-03-23T19:00:00.000Z'),
        url: 'https://www.aldil.org/events/salon-primevere-3/',
        location: 'EUREXPO LYON, Boulevard de l\'Europe, CHASSIEU, 69680, Auvergne-Rhône-Alpes, France',
        geo: { lat: 45.7318991, lon: 4.9481330 },
      },
      {
        type: 'single',
        id: '606@aldil.org',
        title: 'Réunion du CA',
        description: `Réunion administrative

Réservé aux adhérent·e·s et invité·e·s

Une fois par mois, le conseil d'administration (CA) de l'ALDIL se réunit pour faire le bilan des activités passées et préparer celles à venir.
C'est aussi un moment propice pour inviter d'éventuels partenaires ou futurs adhérents à nous rencontrer.

A distance avec BigBlueButton (lien fourni aux membres et aux invité•e•s).`,
        start: new Date('2025-03-27T17:30:00.000Z'),
        end: new Date('2025-03-27T19:00:00.000Z'),
        url: 'https://www.aldil.org/events/reunion-du-ca-44/',
        location: null,
        geo: null,
      },
    ]);
  });
});

import { serialize } from './primary/JsonCalendar';
import { IcsCalendarRepository } from './secondary/IcsCalendarRepository';

const config = process.argv.at(2);

if (config === undefined) {
  console.error('Please add a config as argument');
  process.exit(1);
}

const icsCalendarRepository = new IcsCalendarRepository(JSON.parse(config));
icsCalendarRepository
  .get()
  .then((events) => {
    const skipEventsTitle = 'Migration du calendrier LTH';
    console.log(JSON.stringify(serialize(events.filter((event) => event.title.get !== skipEventsTitle))));
    return process.exit(0);
  })
  .catch((error) => {
    console.error('Something goes wrong:', error);
    return process.exit(1);
  });

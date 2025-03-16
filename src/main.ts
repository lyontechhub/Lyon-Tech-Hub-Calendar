import { calendarGenerator } from './CalendarGenerator';

const config = process.argv.at(2);

if (config === undefined) {
  console.error('Please add a config as argument');
  process.exit(1);
}

calendarGenerator(JSON.parse(config))
  .then((content) => {
    console.log(content);
    return process.exit(0);
  })
  .catch((error) => {
    console.error('Something goes wrong:', error);
    return process.exit(1);
  });

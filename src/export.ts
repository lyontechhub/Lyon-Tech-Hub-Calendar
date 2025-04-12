import fs from 'fs';

import { toIcsExposedCalendar } from './primary/IcsExposedCalendar';

const storeFile = process.argv.at(2);

if (storeFile === undefined) {
  console.error('Please add a store file as argument');
  process.exit(1);
}

const calendar = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
toIcsExposedCalendar(calendar)
  .then((content) => {
    console.log(content);
    return process.exit(0);
  })
  .catch((error) => {
    console.error('Something goes wrong:', error);
    return process.exit(1);
  });

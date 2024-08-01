import { IcsCalendar } from './primary/IcsCalendar';
import { IcsCalendarRepository } from './secondary/IcsCalendarRepository';

export const calendarGenerator = (icsList: Record<string, string>): Promise<string> => {
  const icsCalendarRepository = new IcsCalendarRepository(icsList);

  const calendarIcs = new IcsCalendar(icsCalendarRepository);

  return calendarIcs.get();
};

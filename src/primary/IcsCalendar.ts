import { CalendarRepository } from '../domain/CalendarRepository';

import { toIcsExposedCalendar } from './IcsExposedCalendar';

export class IcsCalendar {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  get(): Promise<string> {
    return this.calendarRepository.get().then(toIcsExposedCalendar);
  }
}

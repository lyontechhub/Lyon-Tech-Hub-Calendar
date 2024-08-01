import { Calendar } from './Calendar';

export interface CalendarRepository {
  get(): Promise<Calendar>;
}

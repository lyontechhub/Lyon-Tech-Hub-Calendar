import { Name } from './Name';

export type CalendarEventBuilder = {
  id: string;
  title: Name;
  group: Name;
  start: Date;
  description?: string;
  end: Date;
  address?: string;
};

export class CalendarEvent {
  readonly id: string;
  readonly #title: Name;
  readonly #group: Name;
  readonly start: Date;
  readonly end: Date;
  readonly description?: string;
  readonly address?: string;

  private constructor(builder: CalendarEventBuilder) {
    this.#title = builder.title;
    this.#group = builder.group;
    this.id = builder.id;
    this.start = builder.start;
    this.end = builder.end;
    this.description = builder.description;
    this.address = builder.address;
  }

  get fullTitle(): Name {
    return Name.of(`[${this.#group.get}] ${this.#title.get}`);
  }

  static of(builder: CalendarEventBuilder) {
    return new CalendarEvent(builder);
  }
}

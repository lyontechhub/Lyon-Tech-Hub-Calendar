import { Calendar } from '../domain/Calendar';
import { CalendarEvent, DateOnly, Geo, Interval, IntervalDateOnly, IntervalDateTime } from '../domain/CalendarEvent';
import { Name } from '../domain/Name';

export interface EventDto {
  id: string;
  title: string;
  group: string;
  date: IntervalDto;
  description?: string;
  address?: string;
  geo?: Geo;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface IntervalDto {
  kind: string;
  start: string | DateOnly;
  end: string | DateOnly;
}

function serializeInterval(value: Interval): IntervalDto {
  return {
    kind: value.start instanceof Date ? 'IntervalDateTime' : 'IntervalDateOnly',
    start: value.start instanceof Date ? value.start.toISOString() : value.start,
    end: value.end instanceof Date ? value.end.toISOString() : value.end,
  };
}
function deserializeInterval(value: IntervalDto): Interval {
  if (value.kind === 'IntervalDateOnly') {
    return { start: value.start, end: value.end } as IntervalDateOnly;
  } else {
    return { start: new Date(value.start as string), end: new Date(value.end as string) } as IntervalDateTime;
  }
}

export function serialize(calendar: Calendar): EventDto[] {
  return calendar.map((e) => {
    const builder = e.toBuilder();
    return {
      id: e.id,
      title: builder.title.get,
      group: builder.group.get,
      date: serializeInterval(builder.date),
      description: builder.description,
      address: builder.address,
      geo: builder.geo,
      url: builder.url,
      createdAt: builder.createdAt?.toISOString(),
      updatedAt: builder.updatedAt?.toISOString(),
    };
  });
}
export function deserialize(calendar: EventDto[]): Calendar {
  return calendar.map((dto) => {
    return CalendarEvent.of({
      id: dto.id,
      title: Name.of(dto.title),
      group: Name.of(dto.group),
      date: deserializeInterval(dto.date),
      description: dto.description,
      address: dto.address,
      geo: dto.geo,
      url: dto.url,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    });
  });
}

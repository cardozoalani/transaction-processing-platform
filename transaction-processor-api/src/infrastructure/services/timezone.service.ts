import { ITimeZoneService } from './timezone.service.interface';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export class TimeZoneService implements ITimeZoneService {
  public getLocalHour(date: Date, timezone: string): number {
    const zonedDate = toZonedTime(date, timezone);
    return parseInt(formatInTimeZone(zonedDate, timezone, 'HH'), 10);
  }
}

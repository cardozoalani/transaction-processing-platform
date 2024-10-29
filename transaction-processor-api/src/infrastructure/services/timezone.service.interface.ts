export interface ITimeZoneService {
  getLocalHour(date: Date, timezone: string): number;
}

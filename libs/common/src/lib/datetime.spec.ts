import { DateTime } from './datetime';
import dayjs from 'dayjs';

describe('DateTime', () => {
  let dateTime: DateTime;

  beforeEach(() => {
    dateTime = new DateTime();
  });

  it('should return the current date and time for now()', () => {
    const now = dateTime.now();
    expect(now.isSame(dayjs(), 'second')).toBe(true);
  });

  it('should return the start of the day for today()', () => {
    const today = dateTime.today();
    expect(today.isSame(dayjs().startOf('day'))).toBe(true);
  });
});
import dayjs from 'dayjs';

export class DateTime {
  now(): dayjs.Dayjs {
    return dayjs();
  }
  today(): dayjs.Dayjs {
    return dayjs().startOf('D');
  }
}

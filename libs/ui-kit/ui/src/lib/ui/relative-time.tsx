import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ComponentPropsWithoutRef, FC, PropsWithRef } from 'react';

const ONE_SECOND = 1;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_MONTH = ONE_DAY * 30;
const ONE_YEAR = ONE_MONTH * 12;

export type RelativeTimeFormat = 'auto' | 'micro' | 'elapsed';
export type RelativeTimeTense = 'auto' | 'past' | 'future';
export type RelativeTimePrecision =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year';
export type RelativeTimeTimeZoneName = 'long' | 'short';

/**
 * Props for the RelativeTime component.
 */
interface RelativeTimeProps {
  /**
   * The date to display as a relative time.
   */
  date: Date;
  /**
   * The format with which to display the relative date.
   * @default 'auto'
   */
  format?: RelativeTimeFormat;
  /**
   * The tense to use when displaying the relative date.
   * @default 'auto'
   */
  tense?: RelativeTimeTense;
  /**
   * The precision to display relative dates with.
   * @default 'second'
   */
  precision?: RelativeTimePrecision;
  /**
   * Prefix to use when displaying a localized date.
   * @default 'on'
   */
  prefix?: string;
  /**
   * The format with which to display the time zone name.
   */
  timeZoneName: RelativeTimeTimeZoneName;
}

const RelativeTime: FC<
  PropsWithRef<RelativeTimeProps> & ComponentPropsWithoutRef<'span'>
> = ({
  date,
  format = 'auto',
  tense = 'auto',
  precision = 'second',
  prefix = 'on',
  timeZoneName = 'short',
  ...props
}) => {
  const locale = 'en-US';

  return <span {...props}>{getRelativeTime(date)}</span>;
};

const getRelativeTime = (date: Date): string => {
  dayjs.extend(relativeTime);
  return dayjs(date).fromNow();
};

export default RelativeTime;

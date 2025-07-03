import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Manila') // Default timezone
const defaultFormat = 'YYYY-MM-DD HH:mm:ss'

export function getCurrentDateTime(
  format: string | boolean = false,
  timezone: string | null = null,
): string | number | Date {
  if (timezone) {
    dayjs.tz.setDefault(timezone)
  }
  const datetime = dayjs.tz()
  if (format === 'unix') {
    return datetime.unix()
  } else {
    const formatString = typeof format === 'boolean' ? defaultFormat : format
    return datetime.format(formatString)
  }
}

export function validateTimzezone(timezone: string): boolean {
  return dayjs().tz(timezone).isValid()
}

export function getCurrentUTCHourDateTime(datetimeString: string | null = null): string {
  const baseTime = datetimeString ? dayjs.utc(datetimeString, defaultFormat) : dayjs.utc()

  return baseTime.startOf('hour').format(defaultFormat)
}

export function formatUTCDate(
  datetimeString: string | null = null,
  format: string = 'YYYY-MM-DD',
): string {
  const baseTime = datetimeString ? dayjs.utc(datetimeString, defaultFormat) : dayjs.utc()
  return baseTime.format(format)
}

export function convertUTCToTimezone(utcDatetime: string, timezone: string): dayjs.Dayjs {
  return dayjs.utc(utcDatetime).tz(timezone)
}

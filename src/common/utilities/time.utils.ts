
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { logger } from '../../logger/logger';
import { DateStringFormat, DurationType } from "../../domain.types/miscellaneous/time.types";

//////////////////////////////////////////////////////////////////////////////////////////////////////

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);
dayjs.extend(weekday);
dayjs.extend(duration);
dayjs.extend(calendar);

//////////////////////////////////////////////////////////////////////////////////////////////////////

export class TimeUtils {

    static timestamp = (date: Date): string => {
        return date.getTime().toString();
    };

    static formatDate = (date): string => {
        const d = new Date(date);
        const month = ('00' + (d.getMonth() + 1).toString()).slice(-2);
        const day = ('00' + d.getDate().toString()).slice(-2);
        const year = d.getFullYear();
        return [year, month, day].join('-');
    };

    static formatDateToYYMMDD = (date: Date): string => {
        const padZero = (num: number, size: number) => String(num).padStart(size, '0');

        const year = date.getFullYear() % 100; // Get last 2 digits of the year
        const month = padZero(date.getMonth() + 1, 2); // Months are 0-indexed
        const day = padZero(date.getDate(), 2);

        return `${year}${month}${day}`;
    };

    static getAgeFromBirthDate = (birthdate: Date, onlyYears = false): string => {
        if (birthdate === null) {
            return '';
        }
        const bd = birthdate.getTime();
        const milsecs = Date.now() - bd;

        const milsecInYear = 365 * 24 * 3600 * 1000;
        const milsecsInMonth = 30 * 24 * 3600 * 1000;

        const years = Math.floor(milsecs / milsecInYear);
        const remainder = milsecs % milsecInYear;
        const months = Math.floor(remainder / milsecsInMonth);

        let age = years > 0 ? years.toString() + ' years' : '';
        if (onlyYears) {
            if (age.length === 0) {
                return '0 years';
            }
            return age;
        }
        age = age + (months > 0 ? ' and ' + months.toString() + ' months' : '');
        return age;
    };

    static getDateString = (date: Date, format: DateStringFormat): string => {

        if (format === DateStringFormat.YYYY_MM_DD) {
            return date.toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    };

    static addDuration = (date: Date, durationValue: number, durationType: DurationType, utc = false): Date => {

        var date_ = utc === true ? dayjs(date).utc() : dayjs(date);
        var newDate_ = date_;

        if (durationType === DurationType.Milisecond) {
            newDate_ = date_.add(durationValue, 'milliseconds');
        }
        if (durationType === DurationType.Second) {
            newDate_ = date_.add(durationValue, 'seconds');
        }
        if (durationType === DurationType.Minute) {
            newDate_ = date_.add(durationValue, 'minutes');
        }
        if (durationType === DurationType.Hour) {
            newDate_ = date_.add(durationValue, 'hours');
        }
        if (durationType === DurationType.Day) {
            newDate_ = date_.add(durationValue, 'days');
        }
        if (durationType === DurationType.Week) {
            newDate_ = date_.add(durationValue, 'weeks');
        }
        if (durationType === DurationType.Month) {
            newDate_ = date_.add(durationValue, 'months');
        }
        if (durationType === DurationType.Year) {
            newDate_ = date_.add(durationValue, 'years');
        }

        var str = newDate_.format();
        return new Date(str);
    };

    static subtractDuration = (date: Date, durationValue: number, durationType: DurationType, utc = false): Date => {

        var date_ = utc === true ? dayjs(date).utc() : dayjs(date);
        var newDate_ = dayjs().utc();

        if (durationType === DurationType.Milisecond) {
            newDate_ = date_.subtract(durationValue, 'milliseconds');
        }
        if (durationType === DurationType.Second) {
            newDate_ = date_.subtract(durationValue, 'seconds');
        }
        if (durationType === DurationType.Minute) {
            newDate_ = date_.subtract(durationValue, 'minutes');
        }
        if (durationType === DurationType.Hour) {
            newDate_ = date_.subtract(durationValue, 'hours');
        }
        if (durationType === DurationType.Day) {
            newDate_ = date_.subtract(durationValue, 'days');
        }
        if (durationType === DurationType.Week) {
            newDate_ = date_.subtract(durationValue, 'weeks');
        }
        if (durationType === DurationType.Month) {
            newDate_ = date_.subtract(durationValue, 'months');
        }
        if (durationType === DurationType.Year) {
            newDate_ = date_.subtract(durationValue, 'years');
        }

        var str = newDate_.format();
        return new Date(str);
    };

    static isBefore = (first: Date, second: Date): boolean => {
        return dayjs(first).isBefore(dayjs(second));
    };

    static isAfter = (first: Date, second: Date): boolean => {
        return dayjs(first).isAfter(dayjs(second));
    };

    static durationFromString = (str: string, durationType: DurationType): number => {

        var durationInHours = 0;
        var tokens = str.toLowerCase().split(":");

        for (var i = 0; i < tokens.length; i++) {

            var x = tokens[i];

            if (x.includes("h")) {
                x = x.replace("h", "");
                var hours = parseInt(x);
                durationInHours += hours;
            }
            if (x.includes("d")) {
                x = x.replace("d", "");
                var days = parseInt(x);
                durationInHours += (days * 24);
            }
            if (x.includes("w")) {
                x = x.replace("w", "");
                var weeks = parseInt(x);
                durationInHours += (weeks * 24 * 7);
            }
            if (x.includes("m")) {
                x = x.replace("m", "");
                var months = parseInt(x);
                durationInHours += (months * 24 * 30);
            }
        }

        if (durationType === DurationType.Milisecond) {
            return durationInHours * 60 * 60 * 1000;
        }
        if (durationType === DurationType.Second) {
            return durationInHours * 60 * 60;
        }
        if (durationType === DurationType.Minute) {
            return durationInHours * 60;
        }
        if (durationType === DurationType.Hour) {
            return durationInHours;
        }
        if (durationType === DurationType.Day) {
            return durationInHours / 24.0;
        }
        if (durationType === DurationType.Week) {
            return durationInHours / (24.0 * 7);
        }
        if (durationType === DurationType.Month) {
            return durationInHours / (24.0 * 30);
        }
        if (durationType === DurationType.Year) {
            return durationInHours / (24.0 * 365);
        }
        return durationInHours;
    };

    static getTimezoneOffsets = (timezoneOffsetStr: string, durationType: DurationType): number => {

        var offsetTmp = timezoneOffsetStr;
        var offsetMinutes = 0;

        if (timezoneOffsetStr.includes('+')) {
            offsetTmp = offsetTmp.replace('+', '-');
        }
        else if (!timezoneOffsetStr.includes('-')) {
            offsetTmp = offsetTmp.replace(' ', '');
            offsetTmp = '-' + offsetTmp;
        }
        else if (timezoneOffsetStr.includes('-')) {
            offsetTmp = offsetTmp.replace('-', '+');
        }

        if (timezoneOffsetStr.includes(':')) {
            var tokens = offsetTmp.split(":");
            var offset_hours = parseInt(tokens[0]);
            var offset_minutes = parseInt(tokens[1]);
            if (offset_hours < 0) {
                offset_minutes = -1 * offset_minutes;
            }
            offsetMinutes = (offset_hours * 60) + offset_minutes;
        }
        else {
            var len = offsetTmp.length;
            var min = offsetTmp.substring(len - 2, len);
            var hr = offsetTmp.substring(0, len - 2);
            var offset_hours = parseInt(hr);
            var offset_minutes = parseInt(min);
            if (offset_hours < 0) {
                offset_minutes = -1 * offset_minutes;
            }
            offsetMinutes = (offset_hours * 60) + offset_minutes;
        }

        if (durationType === DurationType.Milisecond) {
            return offsetMinutes * 60 * 1000;
        }
        if (durationType === DurationType.Second) {
            return offsetMinutes * 60 ;
        }
        if (durationType === DurationType.Minute) {
            return offsetMinutes;
        }
        if (durationType === DurationType.Hour) {
            return offsetMinutes / 60.0;
        }
        if (durationType === DurationType.Day) {
            return offsetMinutes / (24.0 * 60);
        }
        if (durationType === DurationType.Week) {
            return offsetMinutes / (24.0 * 60 * 7);
        }
        if (durationType === DurationType.Month) {
            return offsetMinutes / (24.0 * 60 * 30);
        }
        if (durationType === DurationType.Year) {
            return offsetMinutes / (24.0 * 60 * 365);
        }
        return offsetMinutes;
    };

    static strToUtc = (dateStr: string, timeZoneOffsetMinutes?: number): Date => {

        if (timeZoneOffsetMinutes !== undefined) {
            var d = new Date(dateStr + 'T00:00:00.000Z').getTime();
            var correction = d + (timeZoneOffsetMinutes * 60000);
            var corrected = (new Date()).setTime(correction);
            return new Date(corrected);
        }
        else {
            var d = new Date(dateStr + 'T00:00:00.000Z').getTime();
            var corrected = (new Date()).setTime(d);
            return new Date(corrected);
        }
    };

    static format = (date: Date, formatTemplate: string): string => {
        return dayjs(date).format(formatTemplate);
    };

    static startOf = (date: Date, durationType: DurationType): Date => {

        if (durationType === DurationType.Second) {
            return dayjs(date)
                .startOf('second')
                .toDate();
        }
        if (durationType === DurationType.Minute) {
            return dayjs(date)
                .startOf('minute')
                .toDate();
        }
        if (durationType === DurationType.Hour) {
            return dayjs(date)
                .startOf('hour')
                .toDate();
        }
        if (durationType === DurationType.Day) {
            return dayjs(date)
                .startOf('day')
                .toDate();
        }
        if (durationType === DurationType.Week) {
            return dayjs(date)
                .startOf('week')
                .toDate();
        }
        if (durationType === DurationType.Month) {
            return dayjs(date)
                .startOf('month')
                .toDate();
        }
        if (durationType === DurationType.Year) {
            return dayjs(date)
                .startOf('year')
                .toDate();
        }
        return date;
    };

    static endOf = (date: Date, durationType: DurationType): Date => {

        if (durationType === DurationType.Second) {
            return dayjs(date)
                .endOf('second')
                .toDate();
        }
        if (durationType === DurationType.Minute) {
            return dayjs(date)
                .endOf('minute')
                .toDate();
        }
        if (durationType === DurationType.Hour) {
            return dayjs(date)
                .endOf('hour')
                .toDate();
        }
        if (durationType === DurationType.Day) {
            return dayjs(date)
                .endOf('day')
                .toDate();
        }
        if (durationType === DurationType.Week) {
            return dayjs(date)
                .endOf('week')
                .toDate();
        }
        if (durationType === DurationType.Month) {
            return dayjs(date)
                .endOf('month')
                .toDate();
        }
        if (durationType === DurationType.Year) {
            return dayjs(date)
                .endOf('year')
                .toDate();
        }
        return date;
    };

    static daysInMonthContainingDate = (date: Date): number => {
        return dayjs(date).daysInMonth();
    };

    static getDateWithTimezone = (dateStr: string, timezoneOffset: string) => {
        var todayStr = new Date().toISOString();
        var str = dateStr ? dateStr.split('T')[0] : todayStr.split('T')[0];
        var offsetMinutes = TimeUtils.getTimezoneOffsets(timezoneOffset, DurationType.Minute);
        return TimeUtils.strToUtc(str, offsetMinutes);
    };

    /**
     * Compare two timestamps and check if they are within the given threshold.
     *
     * @param timestamp1 - The first timestamp to compare
     * @param timestamp2 - The second timestamp to compare
     * @param thresholdInMin - The maximum allowable time difference in minutes
     * @returns True if the timestamps are within the threshold, otherwise false
     */
    static compareTimestamps = (
        timestamp1: Date,
        timestamp2: Date,
        thresholdInMin = 5
    ): boolean => {
        if (timestamp1 == null || timestamp2 == null) {
            logger.error("Both timestamps must be valid.");
            return false;
        }
        const dt1 = new Date(timestamp1);
        const dt2 = new Date(timestamp2);

        // Convert timestamps to milliseconds
        const time1 = dt1.getTime();
        const time2 = dt2.getTime();

        // Calculate absolute difference in milliseconds
        const diffInMs = Math.abs(time1 - time2);

        // Convert threshold into milliseconds based on the unit
        const threshold: number = 1000 * 60 * thresholdInMin; // Default to minutes

        // switch (unit) {
        //     case 'ms': // Milliseconds
        //         thresholdInMs = threshold;
        //         break;
        //     case 's': // Seconds
        //         thresholdInMs = threshold * 1000;
        //         break;
        //     case 'm': // Minutes
        //         thresholdInMs = threshold * 1000 * 60;
        //         break;
        //     case 'h': // Hours
        //         thresholdInMs = threshold * 1000 * 60 * 60;
        //         break;
        //     case 'd': // Days
        //         thresholdInMs = threshold * 1000 * 60 * 60 * 24;
        //         break;
        //     case 'w': // Weeks
        //         thresholdInMs = threshold * 1000 * 60 * 60 * 24 * 7;
        //         break;
        //     case 'mo': // Months
        //         thresholdInMs = threshold * 1000 * 60 * 60 * 24 * 30;
        //         break;
        //     case 'y': // Years
        //         thresholdInMs = threshold * 1000 * 60 * 60 * 24 * 365;
        //         break;
        //     default:
        //         logger.error("Unsupported unit. Use 'ms', 's', 'min', 'h', or 'd'.");
        // }

        // Check if the difference is within the threshold
        return diffInMs <= threshold;
    };

}

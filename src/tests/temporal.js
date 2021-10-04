import {
  Instant,
  Duration,
  PlainDate,
  PlainDateTime,
  PlainTime,
} from '#native';

Duration.from({ weeks: 4, months: 2 }).total({
  unit: 'day',
  relativeTo: '1900-01-01',
});

//Instant.fromEpochSeconds(1389121656).toZonedDateTimeISO('UTC').toPlainDate();
//console.log(JSON.stringify());

const date = Instant.fromEpochMicroseconds(1515154156411514n)
  .toZonedDateTimeISO('UTC')
  .toPlainDate();

const timestamp = Instant.from(date.toZonedDateTime('UTC')).epochMicroseconds;

console.log({ date, timestamp });

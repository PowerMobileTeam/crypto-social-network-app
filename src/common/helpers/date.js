import moment from 'moment-timezone';

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export default function formatDate(timestamp, format = 'datetime', timezone='') {
  let options;

  switch (format) {
    case 'date':
      options = 'MMM DD, YYYY';
      break;
    case 'time':
      options = 'hh:mm';
      break;
    case 'datetime':
    default:
      options = 'MMM DD, YYYY, HH:mm';
  }
  let date = moment(timestamp * 1000);

  if (timezone) date.tz(timezone);

  return date.format(options);

  // const months = [
  //   'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  // ]

  // let min = ('' + t.getMinutes()).length == 1 ? '0' + t.getMinutes(): t.getMinutes();
  // return months[t.getMonth()] + ' ' + t.getDate() + ', ' + t.getFullYear()
  //   + ' ' + t.getHours() + ':' + min;
}

import moment from "moment";

function timeSince(dateTime) {
  return moment(dateTime).fromNow();
}

export { timeSince }

function daysDifference(dateTime) {
  return moment().diff(dateTime, 'days');
}

export { daysDifference }
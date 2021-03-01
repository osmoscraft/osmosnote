export function getLocalTimestamp(date: Date) {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? "+" : "-";

  return (
    date.getFullYear() +
    "-" +
    toAbsTwoDigit(date.getMonth() + 1) +
    "-" +
    toAbsTwoDigit(date.getDate()) +
    "T" +
    toAbsTwoDigit(date.getHours()) +
    ":" +
    toAbsTwoDigit(date.getMinutes()) +
    ":" +
    toAbsTwoDigit(date.getSeconds()) +
    dif +
    toAbsTwoDigit(tzo / 60) +
    ":" +
    toAbsTwoDigit(tzo % 60)
  );
}

function toAbsTwoDigit(num: number) {
  var norm = Math.floor(Math.abs(num));
  return norm.toString().padStart(2, "0");
}

export function formatDateForInput(date = new Date()) {
  const parsedDate = date instanceof Date ? new Date(date) : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const timezoneOffsetMs = parsedDate.getTimezoneOffset() * 60 * 1000;
  return new Date(parsedDate.getTime() - timezoneOffsetMs)
    .toISOString()
    .slice(0, 10);
}

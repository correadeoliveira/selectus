const calendarFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});
export function calendarParts(date: Date) {
  return Object.fromEntries(
    calendarFormatter
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
}
export function addMonth(date: Date, anchorDay?: number) {
  const p = calendarParts(date);
  const next = new Date(Date.UTC(p.year, p.month, 1));
  const day = Math.min(
    anchorDay || p.day,
    new Date(
      Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
    ).getUTCDate(),
  );
  const target = Date.UTC(
    next.getUTCFullYear(),
    next.getUTCMonth(),
    day,
    p.hour,
    p.minute,
    p.second,
    date.getUTCMilliseconds(),
  );
  let result = target;
  for (let i = 0; i < 2; i++) {
    const actual = calendarParts(new Date(result));
    const asUTC = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
      date.getUTCMilliseconds(),
    );
    result += target - asUTC;
  }
  return new Date(result);
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(dateTime: Date) {
  return DATE_TIME_FORMATTER.format(dateTime);
}

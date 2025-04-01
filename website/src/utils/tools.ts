const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function convertUtcToLocal(utcDateString: string) {
  const utcDate = new Date(utcDateString);
  return utcDate.toLocaleString(undefined, {
    timeZone: userTimeZone,
    hour12: false,
  });
}

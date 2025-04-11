const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function convertUtcToLocal(utcDateString: string) {
  const utcDate = new Date(utcDateString);
  return utcDate.toLocaleString(undefined, {
    timeZone: userTimeZone,
    hour12: false,
  });
}

export const formatToCapitalCase = (value: string) => {
  if (value.includes("-")) {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("-");
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

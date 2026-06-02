const schoolTimeZone = () => process.env.SCHOOL_TIMEZONE || "Africa/Algiers";

export const dateKey = (date = new Date()) => {
  if (typeof date === "string") {
    return date;
  }

  const parts = new Intl.DateTimeFormat("en", {
    timeZone: schoolTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
};

export const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateKey(date);
};

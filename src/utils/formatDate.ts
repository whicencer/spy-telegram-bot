export function formatDate(timestamp: number) {
  const date = new Date(timestamp);

  const year = date.toLocaleString("default", { year: "numeric" });
  const month = date.toLocaleString("default", { month: "2-digit" });
  const day = date.toLocaleString("default", { day: "2-digit" });
  const hour = date.toLocaleString("default", { hour: "2-digit" });
  const minutes = date.toLocaleString("default", { minute: "2-digit" });
  const seconds = date.toLocaleString("default", { second: "2-digit" });

  return `${day}.${month}.${year} ${hour}:${minutes}:${seconds}`;
}
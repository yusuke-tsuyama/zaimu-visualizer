export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("zaimu-visualizer-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("zaimu-visualizer-session-id", id);
  }
  return id;
}

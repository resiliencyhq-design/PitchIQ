const ignoredConsolePatterns = [
  /favicon\.ico/i,
  /developer mode enabled/i,
];

export function monitorBrowserHealth(page) {
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (ignoredConsolePatterns.some((pattern) => pattern.test(text))) return;
    errors.push(`console: ${text}`);
  });

  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    const firstParty = ["127.0.0.1", "localhost"].includes(url.hostname);
    if (!firstParty) return;
    errors.push(`requestfailed: ${request.method()} ${url.pathname} ${request.failure()?.errorText || "unknown"}`);
  });

  return {
    assertClean(expect) {
      expect(errors, errors.join("\n")).toEqual([]);
    },
    getErrors() {
      return [...errors];
    },
  };
}

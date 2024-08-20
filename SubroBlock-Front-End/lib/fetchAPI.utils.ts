export const isJsonResponse = (response: Response) => response.headers.get("Content-Type")?.includes("application/json");

export const tryParseErrorMessage = (error: any): string => { /* eslint-disable-line  @typescript-eslint/no-explicit-any */
  try {
    if (!error) return "Unknown error occurred";

    if (typeof error === "string") return error;

    if (error instanceof Error) return error.message;

    // default error
    if (error.error)
      return tryParseErrorMessage(error.error);

    // arrays of errors, e.g.:
    // 1. 401 access token expired
    if (typeof error.messages === "object" && error.messages.length) return tryParseErrorMessage(error.messages[0]);

    if (error.message) return `${error.message}`;

    if (error.code) return `${error.code}`;

    // if object with keys, use first value as error message
    if (typeof error === "object")
      return tryParseErrorMessage(Object.keys(error)[0]);

    return "Unknown error occurred";
  } catch (e) {
    console.error("tryParseErrorMessage error", e);
    return "Unknown error occurred";
  }
}

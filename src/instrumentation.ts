import type { Instrumentation } from "next";

// Next calls this for every server error it captures: rendering, route handlers, actions, proxy.
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  console.error("[server-error]", {
    message: error instanceof Error ? error.message : String(error),
    cause: error instanceof Error ? error.cause : undefined,
    route: context.routePath,
    kind: context.routeType,
    request: `${request.method} ${request.path}`,
  });
};

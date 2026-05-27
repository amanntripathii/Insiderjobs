// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

Sentry.init({
  dsn: "https://da554d7d4aa533cdf53e3e34829953cc@o4511457647984640.ingest.us.sentry.io/4511460344135680",
  integartions: [
    nodeProfilingIntegration(),
    Sentry.mongooseIntegration()
  ],
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
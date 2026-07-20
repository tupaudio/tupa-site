// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  framework: {
    name: "next",
    version: "16.2.10",
  },
  runtime: "nodejs",
  cloudflare: {
    compatibility_flags: ["nodejs_compat"],
  },
});
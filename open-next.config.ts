// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  framework: {
    name: "next",
    version: "16.2.10",
  },
  // IMPORTANTE: Configuração para funcionar no Cloudflare Workers
  runtime: "nodejs",
  // Desabilita features que não funcionam no Workers
  build: {
    command: "next build --webpack",
  },
  // Configuração específica para Cloudflare
  cloudflare: {
    // Usa o modo de compatibilidade
    compatibility_flags: ["nodejs_compat"],
    // Permite acesso a variáveis de ambiente
    envVars: [
      "MERCADO_PAGO_ACCESS_TOKEN",
      "SITE_URL",
      "RESEND_API_KEY",
      "WHATSAPP_TOKEN",
      // ... todas as variáveis que você usa
    ],
  },
});
import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad para TODAS las páginas.
 * - X-Frame-Options / frame-ancestors: nadie puede incrustar la app en otro sitio (clickjacking).
 * - nosniff: el navegador no adivina tipos de archivo.
 * - Referrer-Policy / Permissions-Policy: no se filtra información ni se pide hardware.
 * - HSTS: obliga a usar HTTPS cuando el sitio ya se sirve por HTTPS (el navegador lo ignora en http).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

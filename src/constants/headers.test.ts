import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { EGRESS_ALLOWLIST } from "./egress"

const headers = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../public/_headers"),
  "utf8",
)

describe("Cloudflare Pages _headers", () => {
  it("pins HSTS, isolation, and the egress CSP", () => {
    expect(headers).toContain("Strict-Transport-Security: max-age=15552000; includeSubDomains")
    expect(headers).toContain("Cross-Origin-Opener-Policy: same-origin")
    expect(headers).toContain("Cross-Origin-Resource-Policy: same-origin")
    expect(headers).toContain("X-Frame-Options: DENY")
  })

  it("allowlists every declared egress origin in connect-src", () => {
    for (const entry of EGRESS_ALLOWLIST) {
      expect(headers).toContain(entry.origin)
    }
  })

  it("does not cache the service worker", () => {
    expect(headers).toMatch(/\/sw\.js\s+Cache-Control: no-cache, no-store, must-revalidate/)
  })

  it("caches hashed Vite assets immutably", () => {
    expect(headers).toMatch(/\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/)
  })
})

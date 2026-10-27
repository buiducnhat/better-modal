/**
 * Dev-mode check that is safe in browsers where `process` is undefined
 * (native ESM / CDN usage) and still replaceable by bundler `define`.
 */
export const isDev = (): boolean =>
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

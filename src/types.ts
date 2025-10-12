/**
 * Identity.
 */
export type Identity<T> = T;

/**
 * Flatten.
 */
export type Flatten<T> = Identity<{[k in keyof T]: T[k]}>;

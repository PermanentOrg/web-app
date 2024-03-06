// Sourced from this Stack Overflow answer by user Titian Cernicova-Dragomir:
// https://stackoverflow.com/a/49402091
export type KeysOfUnion<T> = T extends T ? keyof T : never;

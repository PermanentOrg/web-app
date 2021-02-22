export function timeout(t: number = 0) {
  return new Promise(resolve => setTimeout(resolve, t));
}
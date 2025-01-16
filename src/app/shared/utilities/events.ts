export function isKeyEventFromBody(event: KeyboardEvent) {
  return (
    event.target &&
    (event.target as HTMLElement).nodeName.toLowerCase() === 'body'
  );
}

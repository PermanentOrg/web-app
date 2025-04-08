export function buildUrlWithParams(
  baseUrl: string,
  queryParams: Record<string, any>,
): string {
  const params = new URLSearchParams();

  const buildParam = (key: string, value: any) => {
    if (Array.isArray(value)) {
      value.forEach((v, index) => {
        if (typeof v === 'object' && v !== null) {
          Object.entries(v).forEach(([k, val]) =>
            params.append(`${key}[${index}][${k}]`, String(val)),
          );
        } else {
          params.append(`${key}[]`, String(v));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, val]) =>
        params.append(`${key}[${k}]`, String(val)),
      );
    } else {
      params.append(key, String(value));
    }
  };

  Object.entries(queryParams).forEach(([key, value]) => buildParam(key, value));

  return `${baseUrl}?${params.toString()}`;
}

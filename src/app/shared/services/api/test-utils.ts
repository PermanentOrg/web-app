function buildParam(
  params: URLSearchParams,
  [paramKey, paramValue]: [string, any],
): URLSearchParams {
  if (Array.isArray(paramValue)) {
    paramValue.forEach((arrayItem, index) => {
      if (typeof arrayItem === 'object' && arrayItem !== null) {
        Object.entries(arrayItem).forEach(([objectKey, objectValue]) => {
          params.append(
            `${paramKey}[${index}][${objectKey}]`,
            String(objectValue),
          );
        });
      } else {
        params.append(`${paramKey}[]`, String(arrayItem));
      }
    });
  } else if (typeof paramValue === 'object' && paramValue !== null) {
    Object.entries(paramValue).forEach(([objectKey, objectValue]) => {
      params.append(`${paramKey}[${objectKey}]`, String(objectValue));
    });
  } else {
    params.append(paramKey, String(paramValue));
  }

  return params;
}

export function buildUrlWithParams(
  baseUrl: string,
  queryParams: Record<string, any>,
): string {
  const params = Object.entries(queryParams).reduce(
    (accumulatedParams, entry) => buildParam(accumulatedParams, entry),
    new URLSearchParams(),
  );

  return `${baseUrl}?${params.toString()}`;
}

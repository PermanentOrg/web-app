import { environment } from '@root/environments/environment';

export const shareUrlBuilder = (
  itemType: 'record' | 'folder',
  token: string,
  itemId: string,
) => {
  const urlDict = {
    local: 'https://local.permanent.org/share',
    staging: 'https://staging.permanent.org/share',
    dev: 'https://dev.permanent.org/share',
    prod: 'https://prod.permanent.org/share',
  };

  const baseUrl = urlDict[environment.environment];

  const url = new URL(baseUrl);

  url.searchParams.set('itemType', itemType);
  url.searchParams.set('token', token);
  url.searchParams.set('itemId', itemId);

  return url.toString();
};

import { environment } from '@root/environments/environment';

export const shareUrlBuilder = (payload: {
  itemType: 'record' | 'folder';
  token: string;
  itemId: string;
}) => {
  const urlDict = {
    local: 'https://local.permanent.org/share',
    staging: 'https://staging.permanent.org/share',
    dev: 'https://dev.permanent.org/share',
    prod: 'https://prod.permanent.org/share',
  };

  const baseUrl = urlDict[environment.environment];

  const url = new URL(
    `${baseUrl}/view/v2-file-list/${payload.itemType}/${payload.token}/${payload.itemId}`,
  );

  return url.toString();
};

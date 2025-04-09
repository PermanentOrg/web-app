import { Injectable } from '@angular/core';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { firstValueFrom } from 'rxjs';
import { StelaItems } from '@root/utils/stela-items';
import { ShareLink, ShareLinkPayload } from '../models/share-link';

@Injectable({
  providedIn: 'root',
})
export class ShareLinksApiService {
  constructor(private http: HttpV2Service) {}

  public async getShareLinksById(shareLinkIds: number[]): Promise<ShareLink[]> {
    const response = await firstValueFrom(
      this.http.get<StelaItems<ShareLink>>(
        'v2/share-links',
        { shareLinkIds },
        null,
        { authToken: false },
      ),
    );
    return response[0].items;
  }

  public async getShareLinksByToken(
    shareTokens: string[],
  ): Promise<ShareLink[]> {
    const response = await firstValueFrom(
      this.http.get<StelaItems<ShareLink>>(
        'v2/share-links',
        { shareTokens },
        null,
        { authToken: false },
      ),
    );
    return response[0].items;
  }

  public async generateShareLink({
    itemId,
    itemType,
  }: {
    itemId: string;
    itemType: 'record' | 'folder';
  }): Promise<ShareLink> {
    const response = await firstValueFrom(
      this.http.post<ShareLinkPayload>(
        'v2/share-links',
        { itemId, itemType },
        null,
        { authToken: false },
      ),
    );

    return response[0].data;
  }
  public async deleteShareLink(shareLinkId: string) {
    await firstValueFrom(
      this.http.delete(`v2/share-links/${shareLinkId}`, {}, null),
    );
  }
}

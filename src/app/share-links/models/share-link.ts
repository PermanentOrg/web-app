export interface ShareLink {
  id: string;
  itemId: string;
  itemType: 'folder' | 'record';
  token: string;
  permissionsLevel: 'contributor' | 'editor' | 'manager' | 'owner' | 'viewer';
  accessRestrictions: 'account' | 'approval' | 'none';
  maxUses: number | null;
  usesExpended: number | null;
  expirationTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareLinkPayload {
  data: ShareLink;
}

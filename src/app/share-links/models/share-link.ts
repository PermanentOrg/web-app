export interface ShareLink {
  id: string;
  itemId: string;
  itemType: 'folder' | 'record';
  token: string;
  permissionsLevel: 'contributor' | 'editor' | 'manager' | 'owner' | 'viewer';
  accessRestrictions: 'account' | 'approval' | 'none';
  autoApproveToggle?: number;
  maxUses: number | null;
  usesExpended: number | null;
  expirationTimestamp?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorAccount: {
    id: string;
    name: string;
  };
}

export interface ShareLinkPayload {
  data: ShareLink;
}

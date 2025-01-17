export enum AccessRole {
  Viewer,
  Contributor,
  Editor,
  Curator,
  Manager,
  Owner,
}

export type AccessRoleType =
  | 'access.role.viewer'
  | 'access.role.contributor'
  | 'access.role.editor'
  | 'access.role.curator'
  | 'access.role.manager'
  | 'access.role.owner';

export function checkMinimumAccess(
  accessRole: AccessRoleType,
  minimumAccess: AccessRole,
) {
  return getAccessAsEnum(accessRole) >= minimumAccess;
}

export function getAccessAsEnum(accessRole: AccessRoleType): AccessRole {
  switch (accessRole) {
    case 'access.role.viewer':
      return AccessRole.Viewer;
    case 'access.role.editor':
      return AccessRole.Editor;
    case 'access.role.contributor':
      return AccessRole.Contributor;
    case 'access.role.curator':
      return AccessRole.Curator;
    case 'access.role.manager':
      return AccessRole.Manager;
    case 'access.role.owner':
      return AccessRole.Owner;
  }
}

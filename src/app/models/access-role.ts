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

export type PermissionsLevel =
	| 'contributor'
	| 'editor'
	| 'manager'
	| 'owner'
	| 'viewer';

// Mapping for share link permissions. Note the stela share link API
// mistakenly returns "manager" where it should use "curator" -- see
// https://github.com/PermanentOrg/stela/issues/540
export const ACCESS_ROLE_TO_PERMISSIONS_LEVEL: Record<
	AccessRoleType,
	PermissionsLevel
> = {
	'access.role.viewer': 'viewer',
	'access.role.editor': 'editor',
	'access.role.contributor': 'contributor',
	'access.role.curator': 'manager',
	'access.role.manager': 'manager',
	'access.role.owner': 'owner',
};

export const PERMISSIONS_LEVEL_TO_ACCESS_ROLE: Record<
	PermissionsLevel,
	AccessRoleType
> = {
	viewer: 'access.role.viewer',
	editor: 'access.role.editor',
	contributor: 'access.role.contributor',
	manager: 'access.role.curator',
	owner: 'access.role.owner',
};

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

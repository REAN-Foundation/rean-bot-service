import { logger } from "../logger/logger";

///////////////////////////////////////////////////////////////////////////////////////

export interface RolePermission {
    id            : string;
    RoleId        : string;
    RoleName      : string;
    PermissionId  : string;
    PermissionName: string;
    TenantId      : string;
}

///////////////////////////////////////////////////////////////////////////////////////

export class RolePermissionsCache {

    private permissions: RolePermission[];

    constructor() {
        this.permissions = [];
    }

    add = async (value: RolePermission): Promise<void> => {
        try {
            this.permissions.push(value);
        } catch (error) {
            logger.error('Error setting role permissions cache: ' + error.message);
        }
    };

    hasPermissionForRole = async (roleName: string, permissionName: string): Promise<boolean> => {
        try {
            return this.permissions.some(p => p.RoleName === roleName && p.PermissionName === permissionName);
        } catch (error) {
            logger.error('Error getting role permissions from cache: ' + error.message);
            return false;
        }
    };

    clear = async (): Promise<void> => {
        try {
            this.permissions = [];
        } catch (error) {
            logger.error('Error clearing role permissions cache: ' + error.message);
        }
    };

    size = async (): Promise<number> => {
        try {
            return this.permissions.length;
        } catch (error) {
            logger.error('Error getting size of role permissions cache: ' + error.message);
            return 0;
        }
    };

}

///////////////////////////////////////////////////////////////////////////////////////

export const rolePermissionsCache = new RolePermissionsCache();

///////////////////////////////////////////////////////////////////////////////////////

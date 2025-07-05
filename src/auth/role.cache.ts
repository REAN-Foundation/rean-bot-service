import { logger } from "../logger/logger";

///////////////////////////////////////////////////////////////////////////////////////

export interface Role {
    id: string;
    Name: string;
    Description: string;
    TenantId: string;
    IsSystemRole: boolean;
}

///////////////////////////////////////////////////////////////////////////////////////

export class RoleCache {

    private roles: Role[];

    constructor() {
        this.roles = [];
    }

    add = async (value: Role): Promise<void> => {
        try {
            this.roles.push(value);
        } catch (error) {
            logger.error('Error setting role cache: ' + error.message);
        }
    };

    getById = async (id: string): Promise<Role | undefined> => {
        try {
            return this.roles.find(r => r.id === id);
        } catch (error) {
            logger.error('Error getting role from cache: ' + error.message);
            return undefined;
        }
    };

    getByName = async (name: string): Promise<Role | undefined> => {
        try {
            return this.roles.find(r => r.Name === name);
        } catch (error) {
            logger.error('Error checking role in cache: ' + error.message);
            return undefined;
        }
    };

    delete = async (id: string): Promise<boolean> => {
        try {
            this.roles = this.roles.filter(r => r.id !== id);
        } catch (error) {
            logger.error('Error deleting role from cache: ' + error.message);
            return false;
        }
    };

    clear = async (): Promise<void> => {
        try {
            this.roles = [];
        } catch (error) {
            logger.error('Error clearing role cache: ' + error.message);
        }

    };

    size = async (): Promise<number> => {
        try {
            return this.roles.length;
        } catch (error) {
            logger.error('Error getting size of role cache: ' + error.message);
            return 0;
        }
    };

}
///////////////////////////////////////////////////////////////////////////////////////

export const roleCache = new RoleCache();

///////////////////////////////////////////////////////////////////////////////////////

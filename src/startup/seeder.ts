import * as fs from "fs";
import { logger } from "../logger/logger";
import * as ServiceConfiguration from '../../service.config.json';
import { Roles } from "../master.data/roles";
import { RolePermissions } from "../master.data/role.permissions";
import { uuid } from "../domain.types/miscellaneous/system.types";
import { roleCache } from "../auth/role.cache";
import { rolePermissionsCache } from "../auth/role.permissions.cache";
import {
    getDefaultTenant,
    getExistingCustomRolesForTenant,
    getExistingPermissions,
    getExistingRolePermissions,
    getSystemRoles,
    getAllRoles
} from "../modules/integrations/user.roles.utilities";
import { TestDataSeeder } from "../startup/test.data.seeder";
import { NavigationPermissions } from "../master.data/navigation.permissions";
import { RoleNavigationPermissions } from "../master.data/navigation.role.permissions";

//////////////////////////////////////////////////////////////////////////////

export class Seeder {

    public static seed = async (): Promise<void> => {
        try {
            logger.info('🌾 Seeding service data...');
            await createTempFolders();
            const tenant = await getDefaultTenant();
            await seedRoles(tenant.id);
            await seedPermissions(tenant.id);
            await seedRolePermissions(tenant.id);
            await seedNavigationPermissions(tenant.id);
            await seedRoleNavigationPermissions(tenant.id);
            await cacheRoles(tenant.id);
            await cacheRolePermissions(tenant.id);

            await seedMasterData();

            await TestDataSeeder.seed(tenant.id);

        } catch (error) {
            logger.error(`❌ Error seeding service data: ${error.message}`);
        }
    };

}

//////////////////////////////////////////////////////////////////////////////

const getPermissionsToSeed = () => {
    const allPermissions = RolePermissions.flatMap(role => role.Permissions);
    const uniquePermissions = [...new Set(allPermissions)];
    return uniquePermissions;
};

const createTempFolders = async (): Promise<void> => {
    try {
        const folders = ServiceConfiguration.TemporaryFolders;
        const downloadFolder = folders.DownloadFolder;
        if (!fs.existsSync(downloadFolder)) {
            fs.mkdirSync(downloadFolder, { recursive: true });
        }
        logger.info(`⬇️  Download folder created at: ${downloadFolder}`);
        const uploadFolder = folders.UploadFolder;
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }
        logger.info(`⬆️  Upload folder created at: ${uploadFolder}`);
        const logFolder = folders.LogFolder;
        if (!fs.existsSync(logFolder)) {
            fs.mkdirSync(logFolder, { recursive: true });
        }
        logger.info(`📂 Log folder created at: ${logFolder}`);
    } catch (error) {
        logger.error(`❌ Error creating temp folders: ${error.message}`);
    }
};

const seedRoles = async (tenantId: uuid) => {
    try {
        const existingRoles = await getExistingCustomRolesForTenant(tenantId);

        const rolesToCreate = Roles.filter(
            role => !existingRoles.some(existingRole =>
                existingRole.Name === role.Name && existingRole.TenantId === tenantId
            )
        );
        if (rolesToCreate.length > 0) {
            const baseUrl = process.env.USER_SERVICE_BASE_URL;
            for await (const role of rolesToCreate) {
                const createModel = {
                    Name         : role.Name,
                    Description  : role.Description,
                    TenantId     : tenantId,
                    IsSystemRole : false,
                };
                const response = await fetch(`${baseUrl}/api/v1/roles`, {
                    method  : 'POST',
                    body    : JSON.stringify(createModel),
                    headers : {
                        'Content-Type' : 'application/json',
                        'x-api-key'    : process.env.INTERNAL_API_KEY
                    }
                });
                const data = await response.json();
                logger.info(`✅ Role created: ${data.Data?.Role?.Name}`);
            }
        }
    } catch (error) {
        logger.error(`❌ Error seeding roles: ${error.message}`);
    }
};

const seedPermissions = async (tenantId: uuid) => {
    try {
        const permissionsToBeSeeded = getPermissionsToSeed();
        const existingPermissions = await getExistingPermissions(tenantId);

        const permissionsToCreate = permissionsToBeSeeded.filter(
            permission => !existingPermissions.some(existingPermission =>
                existingPermission.Name === permission && existingPermission.TenantId === tenantId
            )
        );
        if (permissionsToCreate.length > 0) {
            const baseUrl = process.env.USER_SERVICE_BASE_URL;
            for await (const permission of permissionsToCreate) {
                const response = await fetch(`${baseUrl}/api/v1/permissions`, {
                    method : 'POST',
                    body   : JSON.stringify({
                        Name     : permission,
                        TenantId : tenantId,
                    }),
                    headers : {
                        'Content-Type' : 'application/json',
                        'x-api-key'    : process.env.INTERNAL_API_KEY
                    }
                });
                const data = await response.json();
                const p = data.Data?.Permission;
                logger.info(`✅ Permission created: ${p?.Name}`);
            }
        }
    } catch (error) {
        logger.error(`❌ Error seeding permissions: ${error.message}`);
    }
};

const seedNavigationPermissions = async (tenantId: uuid) => {
    try {
        const navigationPermissionsToBeSeeded = NavigationPermissions;
        const existingPermissions = await getExistingPermissions(tenantId);

        const permissionsToCreate = navigationPermissionsToBeSeeded.filter(
            permission => !existingPermissions.some(existingPermission =>
                existingPermission.Name === permission && existingPermission.TenantId === tenantId
            )
        );

        if (permissionsToCreate.length > 0) {
            const baseUrl = process.env.USER_SERVICE_BASE_URL;
            for (const permission of permissionsToCreate) {
                const response = await fetch(`${baseUrl}/api/v1/permissions`, {
                    method : 'POST',
                    body   : JSON.stringify({
                        Name     : permission,
                        TenantId : tenantId,
                    }),
                    headers : {
                        'Content-Type' : 'application/json',
                        'x-api-key'    : process.env.INTERNAL_API_KEY
                    }
                });
                const data = await response.json();
                const p = data.Data?.Permission;
                logger.info(`✅ Navigation permission created: ${p?.Name}`);
            }
        }
    } catch (error) {
        logger.error(`❌ Error seeding navigation permissions: ${error.message}`);
    }
};

const seedRolePermissions = async (tenantId: uuid) => {
    try {
        const roles = await getExistingCustomRolesForTenant(tenantId);
        const permissions = await getExistingPermissions(tenantId);
        const existingRolePermissions = await getExistingRolePermissions(tenantId);
        const rolePermissionsToCreate = [];

        for (const rp of RolePermissions) {
            const role = roles.find(r => r.Name === rp.Role);
            if (role) {
                for (const permission of rp.Permissions) {
                    const p = permissions.find(p => p.Name === permission);
                    if (p) {
                        if (!existingRolePermissions.some(rp => rp.RoleId === role.id && rp.PermissionId === p.id)) {
                            rolePermissionsToCreate.push({
                                RoleId       : role.id,
                                PermissionId : p.id
                            });
                            logger.info(`✅ Role permission created: ${rp.Role} - ${p.Name}`);
                        }
                    }
                }
            }
        }
        if (rolePermissionsToCreate.length > 0) {
            const baseUrl = process.env.USER_SERVICE_BASE_URL;
            for (const rp of rolePermissionsToCreate) {
                const response = await fetch(`${baseUrl}/api/v1/role-permissions/${rp.RoleId}/permissions/${rp.PermissionId}`, {
                    method  : 'POST',
                    headers : {
                        'Content-Type' : 'application/json',
                        'x-api-key'    : process.env.INTERNAL_API_KEY
                    }
                });
                const data = await response.json();
                const createdRolePermission = data.Data?.RolePermission;
                logger.info(`✅ Role permission created: ${createdRolePermission?.RoleId} - ${createdRolePermission?.PermissionId}`);
            }
        }
    } catch (error) {
        logger.error(`❌ Error seeding role permissions: ${error.message}`);
    }
};

const seedRoleNavigationPermissions = async (tenantId: uuid) => {
    try {
        const roles = await getAllRoles(tenantId);
        const permissions = await getExistingPermissions(tenantId);
        const existingRolePermissions = await getExistingRolePermissions(tenantId);
        const rolePermissionsToCreate = [];

        for (const rp of RoleNavigationPermissions) {
            const role = roles.find(r => r.Name === rp.Role);
            if (role) {
                for (const permission of rp.Permissions) {
                    const p = permissions.find(p => p.Name === permission);
                    if (p) {
                        if (!existingRolePermissions.some(rp => rp.RoleId === role.id && rp.PermissionId === p.id)) {
                            rolePermissionsToCreate.push({
                                RoleId       : role.id,
                                PermissionId : p.id
                            });
                            logger.info(`✅ Role navigation permission created: ${rp.Role} - ${p.Name}`);
                        }
                    }
                }
            }
        }

        if (rolePermissionsToCreate.length > 0) {
            const baseUrl = process.env.USER_SERVICE_BASE_URL;
            for (const rp of rolePermissionsToCreate) {
                const response = await fetch(`${baseUrl}/api/v1/role-permissions/${rp.RoleId}/permissions/${rp.PermissionId}`, {
                    method  : 'POST',
                    headers : {
                        'Content-Type' : 'application/json',
                        'x-api-key'    : process.env.INTERNAL_API_KEY
                    }
                });
                const data = await response.json();
                const createdRolePermission = data.Data?.RolePermission;
                logger.info(`✅ Role navigation permission created: ${createdRolePermission?.RoleId} - ${createdRolePermission?.PermissionId}`);
            }
        }
    } catch (error) {
        logger.error(`❌ Error seeding role navigation permissions: ${error.message}`);
    }
};

const cacheRoles = async (tenantId: uuid) => {
    const customRoles = await getExistingCustomRolesForTenant(tenantId);
    const systemRoles = await getSystemRoles();
    const roles = [...customRoles, ...systemRoles];
    for (const role of roles) {
        await roleCache.add({
            id           : role.id,
            Name         : role.Name,
            Description  : role.Description,
            TenantId     : role.TenantId,
            IsSystemRole : role.IsSystemRole
        });
    }
};

const cacheRolePermissions = async (tenantId: uuid) => {
    const rolePermissions = await getExistingRolePermissions(tenantId);
    for (const rp of rolePermissions) {
        await rolePermissionsCache.add({
            id             : rp.id,
            RoleId         : rp.RoleId,
            RoleName       : rp.RoleName,
            PermissionId   : rp.PermissionId,
            PermissionName : rp.PermissionName,
            TenantId       : rp.TenantId
        });
    }
};

//////////////////////////////////////////////////////////////////////////////

const seedMasterData = async () => {
    // await seedTemplatesForReports();
};

//////////////////////////////////////////////////////////////////////////////

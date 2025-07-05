import { logger } from "../../logger/logger";
import { uuid } from "../../domain.types/miscellaneous/system.types";

///////////////////////////////////////////////////////////////////////////////////////////////

export const getDefaultTenant = async () => {
    try {
        //Call user-service api endpoint to get default tenant
        const baseUrl = process.env.USER_SERVICE_BASE_URL;
        const response = await fetch(`${baseUrl}/api/v1/tenants/by-code/default`, {
            headers : {
                'Content-Type' : 'application/json',
                'x-api-key'    : process.env.INTERNAL_API_KEY
            }
        });
        const data = await response.json();
        const tenant = data.Data?.Tenant;
        return tenant;
    } catch (error) {
        logger.error(`❌ Error fetching default tenant: ${error.message}`);
        throw error;
    }
};

export const getExistingCustomRolesForTenant = async (tenantId: uuid) => {
    //Call user-service api endpoint to get existing roles
    const baseUrl = process.env.USER_SERVICE_BASE_URL;
    const response = await fetch(`${baseUrl}/api/v1/roles/search?tenantId=${tenantId}&isSystemRole=false`, {
        headers : {
            'Content-Type' : 'application/json',
            'x-api-key'    : process.env.INTERNAL_API_KEY
        }
    });
    const data = await response.json();
    const roles = data.Data.Roles.Items;
    return roles;
};

export const getSystemRoles = async () => {
    const baseUrl = process.env.USER_SERVICE_BASE_URL;
    const response = await fetch(`${baseUrl}/api/v1/roles/search?isSystemRole=true`, {
        headers : {
            'Content-Type' : 'application/json',
            'x-api-key'    : process.env.INTERNAL_API_KEY
        }
    });
    const data = await response.json();
    const roles = data.Data.Roles.Items;
    return roles;
};

export const getAllRoles = async (tenantId: uuid) => {
    const customRoles = await getExistingCustomRolesForTenant(tenantId);
    const systemRoles = await getSystemRoles();
    return [...customRoles, ...systemRoles];
};

export const getExistingPermissions = async (tenantId: uuid) => {
    //Call user-service api endpoint to get existing permissions
    const baseUrl = process.env.USER_SERVICE_BASE_URL;
    const response = await fetch(`${baseUrl}/api/v1/permissions/search?tenantId=${tenantId}&itemsPerPage=1000`, {
        headers : {
            'Content-Type' : 'application/json',
            'x-api-key'    : process.env.INTERNAL_API_KEY
        }
    });
    const data = await response.json();
    const permissions = data.Data.Permissions.Items;
    return permissions;
};

export const getExistingRolePermissions = async (tenantId: uuid) => {
    //Call user-service api endpoint to get existing role permissions
    const baseUrl = process.env.USER_SERVICE_BASE_URL;
    const responseCustomRoles = await fetch(`${baseUrl}/api/v1/role-permissions/tenants/${tenantId}`, {
        headers : {
            'Content-Type' : 'application/json',
            'x-api-key'    : process.env.INTERNAL_API_KEY
        }
    });
    const dataCustomRoles = await responseCustomRoles.json();
    const customRolePermissions = dataCustomRoles.Data.RolePermissions;

    //System role permissions
    const responseSystemRoles = await fetch(`${baseUrl}/api/v1/role-permissions/system-role-permissions`, {
        headers : {
            'Content-Type' : 'application/json',
            'x-api-key'    : process.env.INTERNAL_API_KEY
        }
    });
    const dataSystemRoles = await responseSystemRoles.json();
    const systemRolePermissions = dataSystemRoles.Data?.RolePermissions;
    return [...customRolePermissions, ...systemRolePermissions];
};

export const getUserByEmail = async (email: string) => {
    try {
        const baseUrl = process.env.USER_SERVICE_BASE_URL;
        const response = await fetch(`${baseUrl}/api/v1/users/search?email=${email}`, {
            headers : {
                'Content-Type' : 'application/json',
                'x-api-key'    : process.env.INTERNAL_API_KEY
            }
        });
        const data = await response.json();
        const user = data.Data.Users.Items.length > 0 ? data.Data.Users.Items[0] : null;
        return user;
    } catch (error) {
        logger.error(`❌ Error fetching user by email: ${error.message}`);
        throw error;
    }
};

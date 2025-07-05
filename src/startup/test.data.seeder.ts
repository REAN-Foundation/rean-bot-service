import * as fs from "fs";
import { logger } from "../logger/logger";
import { uuid } from "../domain.types/miscellaneous/system.types";
import {
    getAllRoles,
    getUserByEmail
} from "../modules/integrations/user.roles.utilities";

//////////////////////////////////////////////////////////////////////////////

export class TestDataSeeder {

    public static seed = async (tenantId: uuid): Promise<void> => {
        try {
            const isProduction = process.env.NODE_ENV === 'production';
            if (!isProduction) {
                logger.info('Seeding test data...');
                // await seedTestCustomers(tenantId);
                // await seedTestManufacturingVendors(tenantId);
                // await seedTestSuppliers(tenantId);
                // await seedTestUsers(tenantId);
                // await seedTestProjects(tenantId);
            }
        } catch (error) {
            logger.error(error.message);
        }
    };

}

const readJsonFile = async (filePath: string) => {
    const file = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(file);
};

const seedTestUsers = async (tenantId: uuid) => {
    try {

        const usersToSeed = await readJsonFile('test.data/users.json');
        logger.info('Seeding test users...');
        const allRoles = await getAllRoles(tenantId);

        if (usersToSeed.length > 0) {
            const baseUrl = process.env.USER_SERVICE_BASE_URL;
            for await (const user of usersToSeed) {
                const existingUser = await getUserByEmail(user.Email);
                if (existingUser != null) {
                    logger.info(`User already exists: ${user.Email}`);
                    continue;
                }
                const thisUserRole = allRoles.find(role => role.Name === user.Role);
                const createModel = {
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    Email: user.Email,
                    Password: user.Password,
                    RoleId: thisUserRole?.id,
                    TenantId: tenantId,
                };
                const response = await fetch(`${baseUrl}/api/v1/users`, {
                    method: 'POST',
                    body: JSON.stringify(createModel),
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.INTERNAL_API_KEY
                    }
                });
                const data = await response.json();
                logger.info(JSON.stringify(data, null, 2));
            }
        }
    } catch (error) {
        logger.error(`Error seeding test users: ${error.message}`);
    }
};

import { logger } from "../../../logger/logger";
import { ApiError } from "../../../common/handlers/error.handler";
import { Tenant } from '../../../domain.types/tenant.types';

//////////////////////////////////////////////////////////////////////////////////////

const REAN_BACKEND_API_URL = process.env.REAN_BACKEND_API_URL;
const REAN_BACKEND_API_KEY = process.env.REAN_BACKEND_API_KEY;

//////////////////////////////////////////////////////////////////////////////////////

export const getAllTenants = async (): Promise<Tenant[]> => {
    try {

        const headers = {};
        headers['Content-Type'] = 'application/json';
        headers['x-api-key'] = REAN_BACKEND_API_KEY;
        const url = REAN_BACKEND_API_URL + '/tenants/search?pageIndex=0&itemsPerPage=1000';

        const res = await fetch(url, {
            method : 'GET',
            headers
        });
        const response = await res.json();

        if (response.Status === 'failure' || response.HttpCode !== 200) {
            logger.info(`status code: ${response.HttpCode}`);
            logger.info(`error message: ${response.Message}`);
            return [];
        }
        const records = response.Data.TenantRecords;
        return records.map(x => {
            return {
                id   : x.TenantId,
                name : x.TenantName,
            };
        });
    }
    catch (err) {
        const errmsg = `Error retrieving person roles: ${err.message}`;
        logger.info(errmsg);
        throw new ApiError(500, errmsg);
    }
};

import type { PersonRole } from "../../domain.types/user.types";
import { ApiError } from "../../common/handlers/error.handler";
import { logger } from "../../logger/logger";

/////////////////////////////////////////////////////////////////////

const REAN_BACKEND_API_URL = process.env.REAN_BACKEND_API_URL;
const REAN_BACKEND_API_KEY = process.env.REAN_BACKEND_API_KEY;

/////////////////////////////////////////////////////////////////////

export const getPersonRoles = async (): Promise<PersonRole[]> => {
    try {

        const headers = {};
        headers['Content-Type'] = 'application/json';
        headers['x-api-key'] = REAN_BACKEND_API_KEY;
        const url = REAN_BACKEND_API_URL + '/types/person-roles';

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
        return response.Data.PersonRoleTypes;
    }
    catch (err) {
        const errmsg = `Error retrieving person roles: ${err.message}`;
        logger.info(errmsg);
        throw new ApiError(500, errmsg);
    }
};

export const getPersonRoleById = (PersonRoles: PersonRole[], roleId) => {
    // logger.info(`Person roles = ${JSON.stringify(PersonRoles, null, 2)}`);
    // logger.info(`Person roles = ${JSON.stringify(PersonRoles, null, 2)}`);
    const role = PersonRoles.find(x => x.id === roleId);
    logger.info(`role: ${JSON.stringify(role, null, 2)}`);
    return role.RoleName;
};

export const getGenderTypes = async () : Promise<string[]> => {

    try {

        const headers = {};
        headers['Content-Type'] = 'application/json';
        headers['x-api-key'] = REAN_BACKEND_API_KEY;
        const url = REAN_BACKEND_API_URL + '/types/genders';
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

        return response.Data.GenderTypes;
    }
    catch (err) {
        const errmsg = `Error retrieving gender types: ${err.message}`;
        logger.info(errmsg);
        throw new ApiError(500, errmsg);
    }
};

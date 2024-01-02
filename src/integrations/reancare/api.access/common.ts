import chalk from 'chalk';
import { logger } from "../../../logger/logger";
import { ApiError } from "../../../common/handlers/error.handler";
import { uuid } from '../../../types/miscellaneous/system.types';
import { LoginSessionCache } from "../login.session.cache";

/////////////////////////////////////////////////////////////////////////
const REAN_BACKEND_API_KEY = process.env.REAN_BACKEND_API_KEY;
/////////////////////////////////////////////////////////////////////////

export const get_ = async (tenantId: string, url: string) => {
    const session = await LoginSessionCache.get(tenantId);
    const AccessToken = session?.AccessToken;
    //logger.info(`AccessToken = ${AccessToken}`);
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    headers['Authorization'] = `Bearer ${AccessToken}`;
    const res = await fetch(url, {
        method : 'GET',
        headers
    });
    const response = await res.json();
    if (response.Status === 'failure') {
        if (response.HttpCode === 404) {
            logger.error(chalk.red(`get_ response message: 404 - ${response.Message}`));
            return null;
        }
        else if (response.HttpCode !== 200) {
            logger.error(chalk.red(`get_ response message: ${response.Message}`));
            throw new ApiError(response.HttpCode, response.Message);
        }
    }
    logger.info(chalk.green(`get_ response message: ${response.Message}`));
    return response.Data;
};

export const post_ = async (tenantId: string, url: string, bodyObj: unknown) => {
    const session = await LoginSessionCache.get(tenantId);
    const AccessToken = session?.AccessToken;
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    headers['Authorization'] = `Bearer ${AccessToken}`;
    const body = JSON.stringify(bodyObj);
    const res = await fetch(url, {
        method : 'POST',
        body,
        headers
    });
    const response = await res.json();
    if (response.Status === 'failure' ||
    (response.HttpCode !== 201 && response.HttpCode !== 200)) {
        logger.info(chalk.red(`post_ response message: ${response.Message}`));
        throw new ApiError(response.HttpCode, response.Message);
    }
    logger.info(chalk.green(`post_ response message: ${response.Message}`));
    return response.Data;
};

export const put_ = async (tenantId: string, url: string, bodyObj: unknown) => {
    const session = await LoginSessionCache.get(tenantId);
    const AccessToken = session?.AccessToken;
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    headers['Authorization'] = `Bearer ${AccessToken}`;
    const body = JSON.stringify(bodyObj);
    logger.info(`body = ${body}`);
    const res = await fetch(url, {
        method : 'PUT',
        body,
        headers
    });
    const response = await res.json();
    if (response.Status === 'failure' || (response.HttpCode !== 200 && response.HttpCode !== 201) ) {
        logger.info(chalk.red(`put_ response message: ${response.Message}`));
        throw new ApiError(response.HttpCode, response.Message);
    }
    logger.info(chalk.green(`put_ response message: ${response.Message}`));
    return response.Data;
};

export const delete_ = async (tenantId: uuid, url: string) => {
    const session = await LoginSessionCache.get(tenantId);
    const AccessToken = session?.AccessToken;
    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    headers['Authorization'] = `Bearer ${AccessToken}`;
    const res = await fetch(url, {
        method : 'DELETE',
        headers
    });
    const response = await res.json();
    logger.info(response.Message);
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        logger.info(chalk.red(`delete_ response message: ${response.Message}`));
        throw new ApiError(response.HttpCode, response.Message);
    }
    logger.info(chalk.green(`delete_ response message: ${response.Message}`));
    return response.Data;
};

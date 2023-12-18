import chalk from 'chalk';
import { delete_, get_, post_, put_ } from "./common";
import { logger } from "../../../logger/logger";
import { ApiError } from "../../../common/handlers/error.handler";
import { uuid } from "../../../domain.types/miscellaneous/system.types";

//////////////////////////////////////////////////////////////////////////////////////

const REAN_BACKEND_API_URL = process.env.REAN_BACKEND_API_URL;
const REAN_BACKEND_API_KEY = process.env.REAN_BACKEND_API_KEY;

//////////////////////////////////////////////////////////////////////////////////////

export interface LoginModel {
    TenantId?       : uuid;
    UserId?         : uuid;
    ExternalUserId ?: string;
    UserName?       : string;
    RoleId?         : number;
    Purpose?        : string;
    Otp?            : string;
    Password?       : string;
    LoginRoleId?    : number;
}

export interface UserRegistrationModel {
    TenantId?       : uuid;
    ExternalUserId ?: string;
    Phone?          : string;
    Email?          : string;
    UserName?       : string;
    FirstName?      : string;
    LastName?       : string;
    RoleId?         : number;
}

//////////////////////////////////////////////////////////////////////////////////////

export const sendOtp = async (tenantId: uuid, phone: string, loginRoleId: number) => {

    const model: LoginModel = getOtpModel(tenantId, phone, loginRoleId);
    logger.info(JSON.stringify(model, null, 2));

    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    const body = JSON.stringify(model);
    const url = REAN_BACKEND_API_URL + '/users/generate-otp';

    const res = await fetch(url, {
        method : 'POST',
        body,
        headers
    });
    const response = await res.json();
    if (response.Status === 'failure') {
        if (response.HttpCode === 404) {
            logger.error(chalk.red(`Send OTP response message: 404 - ${response.Message}`));
            return null;
        }
        else if (response.HttpCode !== 200) {
            logger.error(chalk.red(`Send OTP response message: ${response.Message}`));
            throw new ApiError(response.HttpCode, response.Message);
        }
    }
    logger.info(chalk.green(`Send OTP response message: ${response.Message}`));

    return response;
};

const getOtpModel = (tenantId: uuid, phone: string, loginRoleId: number): LoginModel => {
    if (phone === null || phone === undefined) {
        throw new Error('Phone number is required');
    }

    var phone_ = phone.trim();
    if (!phone_.startsWith('+')) {
        phone_ = '+' + phone_;
    }

    const loginModel: LoginModel = {
        TenantId    : tenantId,
        UserName    : phone_,
        LoginRoleId : loginRoleId ?? 2,
        Purpose     : 'Login'
    };

    return loginModel;
};

////////////////////////////////////////////////////////////////////////////////////

export const registerUser = async (
    tenantId       : uuid,
    ExternalUserId?: string,
    loginRoleId   ?: number,
    phone         ?: string,
    firstName     ?: string,
    lastName      ?: string,
    // email         ?: string,
) => {

    const registrationModel: UserRegistrationModel = getRegistrationModel(
        tenantId,
        ExternalUserId,
        loginRoleId,
        phone,
        firstName,
        lastName
    );

    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    const body = JSON.stringify(registrationModel);
    const url = REAN_BACKEND_API_URL + '/patients';

    const res = await fetch(url, {
        method : 'POST',
        body,
        headers
    });
    const response = await res.json();
    if (response.Status === 'failure') {
        if (response.HttpCode === 404) {
            logger.error(chalk.red(`User registration response message: 404 - ${response.Message}`));
            return null;
        }
        else if (response.HttpCode !== 201 && response.HttpCode !== 200) {
            logger.error(chalk.red(`User registration failed: ${response.Message}`));
            throw new ApiError(response.HttpCode, response.Message);
        }
    }
    else if (!response.Data) {
        logger.error(chalk.red(`User registration failed: ${response.Message}`));
        throw new ApiError(response.HttpCode, response.Message);
    }
    logger.info(chalk.green(`User registration response message: ${response.Message}`));

    return response.Data;
};

export const getRegistrationModel = (
    tenantId: uuid,
    externalUserId: string,
    loginRoleId: number,
    phone: string,
    firstName: string,
    lastName: string,
)
    : UserRegistrationModel => {

    const registrationModel: UserRegistrationModel = {
        TenantId       : tenantId,
        Phone          : phone,
        RoleId         : loginRoleId ?? 2,
        ExternalUserId : externalUserId,
        FirstName      : firstName,
        LastName       : lastName,
    };
    return registrationModel;
};

////////////////////////////////////////////////////////////////////////////////////

export const loginWithOtp = async (
    tenantId: uuid,
    otp: string,
    phone: string,
    loginRoleId: number) => {

    const model: LoginModel = getOtpLoginModel(tenantId, otp, phone, loginRoleId);
    logger.info(JSON.stringify(model, null, 2));

    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    const body = JSON.stringify(model);
    const url = REAN_BACKEND_API_URL + '/users/login-with-otp';

    logger.info(body);
    logger.info(url);
    logger.info(JSON.stringify(headers, null, 2));

    const res = await fetch(url, {
        method : 'POST',
        body,
        headers
    });
    const response = await res.json();
    return response;
};

const getOtpLoginModel = (
    tenantId: uuid,
    otp: string,
    phone: string,
    loginRoleId: number): LoginModel => {

    if (phone === null || phone === undefined) {
        throw new Error('Phone number is required');
    }

    var phone_ = phone.trim();
    if (!phone_.startsWith('+')) {
        phone_ = '+' + phone_;
    }

    if (otp === null || otp === undefined) {
        throw new Error('OTP is required');
    }

    const loginModel: LoginModel = {
        TenantId    : tenantId,
        UserName    : phone_,
        Otp         : otp,
        LoginRoleId : loginRoleId ?? 2,
        Purpose     : 'Login'
    };

    return loginModel;
};

////////////////////////////////////////////////////////////////////////////////////

export const loginWithPassword = async (
    tenantId: uuid,
    password: string,
    userName: string,
    loginRoleId: number) => {

    const model: LoginModel = getPasswordLoginModel(tenantId, password, userName, loginRoleId);
    logger.info(JSON.stringify(model, null, 2));

    const headers = {};
    headers['Content-Type'] = 'application/json';
    headers['x-api-key'] = REAN_BACKEND_API_KEY;
    const body = JSON.stringify(model);
    const url = REAN_BACKEND_API_URL + '/users/login-with-password';

    logger.info(body);
    logger.info(url);
    logger.info(JSON.stringify(headers, null, 2));

    const res = await fetch(url, {
        method : 'POST',
        body,
        headers
    });
    const response = await res.json();

    if (response.Status === 'failure') {
        if (response.HttpCode === 404) {
            logger.error(chalk.red(`User login response message: 404 - ${response.Message}`));
            return null;
        }
        else if (response.HttpCode !== 200) {
            logger.error(chalk.red(`User login response message: ${response.Message}`));
            throw new ApiError(response.HttpCode, response.Message);
        }
    }
    logger.info(chalk.green(`User login response message: ${response.Message}`));

    return response;
};

const getPasswordLoginModel = (
    tenantId: uuid,
    userName: string,
    password: string,
    loginRoleId: number): LoginModel => {

    if (userName === null || userName === undefined) {
        throw new Error('User name is required');
    }

    var userName_ = userName.trim();

    if (password === null || password === undefined) {
        throw new Error('Password is required');
    }

    const loginModel: LoginModel = {
        TenantId    : tenantId,
        UserName    : userName_,
        Password    : password,
        LoginRoleId : loginRoleId,
        Purpose     : 'Login'
    };

    return loginModel;
};

////////////////////////////////////////////////////////////////////////////////////

export const logout = async (sessionId: string) => {
    const url = REAN_BACKEND_API_URL + `/users/logout`;
    return await post_(sessionId, url, {});
};

////////////////////////////////////////////////////////////////////////////////////

export const getUserById = async (sessionId: string, userId: string) => {
    const url = REAN_BACKEND_API_URL + `/patients/${userId}`;
    return await get_(sessionId, url);
};

///////////////////////////////////////////////////////////////////////////////////////////

export const updateProfile = async (
    sessionId: string,
    userId: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    phone: string,
    organization: string,
    location: string
) => {
    const otherInformationData = {
        Org      : organization,
        Location : location
    };
    const otherInformation  = JSON.stringify(otherInformationData);
    const body = {
        FirstName        : firstName,
        LastName         : lastName,
        BirthDate        : birthDate,
        Phone            : phone,
        OtherInformation : otherInformation
    };
    logger.info(JSON.stringify(body, null, 2));
    const url = REAN_BACKEND_API_URL + `/patients/${userId}`;
    return await put_(sessionId, url, body);
};

export const updateProfileImage = async (
    sessionId: string,
    userId: string,
    profileImageResourceId: string,
) => {
    const body = {
        ImageResourceId : profileImageResourceId,
    };
    logger.info(profileImageResourceId);
    const url = REAN_BACKEND_API_URL + `/patients/${userId}`;
    return await put_(sessionId, url, body);
};

///////////////////////////////////////////////////////////////////////////////////////////

export const deleteAccount = async (sessionId: string, userId: string) => {
    const url = REAN_BACKEND_API_URL + `/patients/${userId}`;
    return await delete_(sessionId, url);
};

///////////////////////////////////////////////////////////////////////////////////////////

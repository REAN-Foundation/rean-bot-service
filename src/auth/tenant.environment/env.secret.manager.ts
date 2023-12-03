/* eslint-disable @typescript-eslint/no-unused-vars */
import AWS from 'aws-sdk';
import { logger } from '../../logger/logger';
import { EnvVariableCache } from './env.variable.cache';

///////////////////////////////////////////////////////////////////////////////////////////////

export class EnvSecretsManager {

    public static _tenantsList: string[] = [];

    public static _useCache = process.env.USE_ENV_CACHE === 'true' ? true : false;

    public static get tenants(): string[] {
        return this._tenantsList;
    }

    public static populateEnvVariables = async () => {
        if  (process.env.ENVIRONMENT === 'LOCAL'){
            await this.populateEnvVariables_Local();
        }
        else {
            await this.populateEnvVariables_AWSSecretsManager();
        }
    };

    public static getCrossAccountCredentials = async() => {

        return new Promise((resolve, reject) => {
            const sts = new AWS.STS();
            const timestamp = (new Date()).getTime();
            const params = {
                RoleArn         : process.env.ROLE_ARN,
                RoleSessionName : `be-descriptibe-here-${timestamp}`
            };
            sts.assumeRole(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        accessKeyId     : data.Credentials.AccessKeyId,
                        secretAccessKey : data.Credentials.SecretAccessKey,
                        sessionToken    : data.Credentials.SessionToken,
                    });
                }
            });
        });
    };

    public static getSecrets = async () => {

        const responseCredentials: any = await this.getCrossAccountCredentials();
        const region = process.env.region;
        const secretNameList = process.env.SECRET_NAME_LIST.split(',');
        const secretObjectList = [];

        const client = new AWS.SecretsManager(
            {
                region          : region,
                accessKeyId     : responseCredentials.accessKeyId,
                secretAccessKey : responseCredentials.secretAccessKey,
                sessionToken    : responseCredentials.sessionToken
            });

        // For the list of secrets, get the respective values and store as list of objects
        let error: any = undefined;
        for (const ele of secretNameList) {
            const responseSecretValue = await client.getSecretValue({ SecretId: ele })
                .promise()
                .catch(err => (error = err));
            const secretStringToObj = JSON.parse(responseSecretValue.SecretString);
            secretObjectList.push(secretStringToObj);
        }

        logger.error('Error in getting secrets from AWS Secrets Manager: ' + error);

        return secretObjectList;
    };

    private static populateEnvVariables_AWSSecretsManager = async() => {
        try {
            const secretObjectList = await this.getSecrets();
            for (const ele of secretObjectList) {
                if (!ele.NAME) {
                    for (const k in ele) {
                        if (typeof ele[k] === "object") {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), JSON.stringify(ele[k]));
                        }
                        else {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), ele[k]);
                        }
                    }
                }
                else {
                    this._tenantsList.push(ele.NAME);
                    for (const k in ele) {
                        if (typeof ele[k] === "object") {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), JSON.stringify(ele[k]));
                        }
                        else {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), ele[k]);
                        }
                    }
                }
            }
        } catch (e) {
            logger.error(e.message);
        }
    };

    private static populateEnvVariables_Local = async () => {
        try {
            const secretNameList = process.env.secretNameList.split(',');
            const secretObjectList = [];
            for (const element of secretNameList) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const responseSecretValue = require(`../${element}.json`);
                const secretStringToObj = responseSecretValue;
                secretObjectList.push(secretStringToObj);
            }
            for (const ele of secretObjectList) {
                if (!ele.NAME) {
                    for (const k in ele) {
                        if (typeof ele[k] === "object") {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), JSON.stringify(ele[k]));
                        }
                        else {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), ele[k]);
                        }
                    }
                }
                else {
                    this._tenantsList.push(ele.NAME);
                    for (const k in ele) {
                        if (typeof ele[k] === "object") {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), JSON.stringify(ele[k]));
                        }
                        else {
                            this.storeEnvVariable(ele.NAME, k.toUpperCase(), ele[k]);
                        }
                    }
                }
            }
        } catch (e) {
            logger.error(e.message);
        }
    };

    private static storeEnvVariable = (tenantName: string, envKey: string, value: string): void => {
        if (this._useCache) {
            EnvVariableCache.set(tenantName, envKey, value);
        }
        else {
            process.env[tenantName + "_" + envKey] = value;
        }
    };

}

///////////////////////////////////////////////////////////////////////////////////////////////
// Scrapped code
// var params = {
//     Filters: [
//         {
//             Key: "tag-key",
//             Values: [
//                 'rean'
//             ]
//         },
//         {
//             Key: "tag-value",
//             Values: [
//                 'SaaS'
//             ]
//         }
//     ]
// };
//--------Once the limitation of Duplo os resolved,
//we will apply this block of code below to get the list of secrests from Secrets Manager
// let responseSecretList = await client.listSecrets(params)
//     .promise()
//     .catch(err => (error = err));
// console.log("responseSecretList", responseSecretList)
// for (const ele of responseSecretList.SecretList) {
//     secretNameList.push(ele.Name);
// }

///////////////////////////////////////////////////////////////////////////////////////////////

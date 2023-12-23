import AWS from 'aws-sdk';

////////////////////////////////////////////////////////////////////////////////

export class AwsManager {

    public static getCrossAccountCredentials = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const sts = new AWS.STS();
            const timestamp = (new Date()).getTime();
            const params = {
                RoleArn         : process.env.ROLE_ARN,
                RoleSessionName : `be-descriptibe-here-${timestamp}`
            };
            sts.assumeRole(params, (err, data) => {
                if (err) reject(err);
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

}

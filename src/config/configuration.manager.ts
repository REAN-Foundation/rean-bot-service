import path from 'path';
import * as defaultConfiguration from '../../service.config.json';
import {
    Configurations,
    EmailProvider,
    FileStorageProvider,
    MobileNotificationProvider,
    SmsProvider
} from './configuration.types';

////////////////////////////////////////////////////////////////////////////////////////////////////////

export class ConfigurationManager {

    static _config: Configurations | null = null;

    static initialize = (): void => {
        ConfigurationManager._config = {
            BaseUrl           : process.env.BASE_URL || defaultConfiguration.BaseUrl,
            SystemIdentifier  : defaultConfiguration.SystemIdentifier as string,
            MaxUploadFileSize : parseInt(defaultConfiguration.MaxUploadFileSize.toString(), 10),
            FileStorage       : {
                Provider : defaultConfiguration.FileStorage.Provider as FileStorageProvider
            },
            Email : {
                Provider : defaultConfiguration.Email.Provider as EmailProvider
            },
            Sms : {
                Provider : defaultConfiguration.Sms.Provider as SmsProvider
            },
            MobileNotification : {
                Provider : defaultConfiguration.MobileNotification.Provider as MobileNotificationProvider
            },
            TemporaryFolders : {
                UploadFolder        : defaultConfiguration.TemporaryFolders.UploadFolder,
                DownloadFolder      : defaultConfiguration.TemporaryFolders.DownloadFolder,
                LogFolder           : defaultConfiguration.TemporaryFolders.LogFolder,
                CleanupEveryMinutes : parseInt(defaultConfiguration.TemporaryFolders.CleanupEveryMinutes.toString(), 10)
            },
            Telemetry : defaultConfiguration.Telemetry
        };
    };

    public static BaseUrl = (): string => {
        return ConfigurationManager._config.BaseUrl;
    };

    public static SystemIdentifier = (): string => {
        return ConfigurationManager._config.SystemIdentifier;
    };

    public static MaxUploadFileSize = (): number => {
        return ConfigurationManager._config.MaxUploadFileSize;
    };

    public static FileStorageProvider = (): FileStorageProvider => {
        return ConfigurationManager._config.FileStorage.Provider;
    };

    public static SmsProvider = (): SmsProvider => {
        return ConfigurationManager._config.Sms.Provider;
    };

    public static EmailProvider = (): EmailProvider => {
        return ConfigurationManager._config.Email.Provider;
    };

    public static UploadTemporaryFolder = (): string => {
        var location = ConfigurationManager._config.TemporaryFolders.UploadFolder;
        return path.join(process.cwd(), location);
    };

    public static DownloadTemporaryFolder = (): string => {
        var location = ConfigurationManager._config.TemporaryFolders.DownloadFolder;
        return path.join(process.cwd(), location);
    };

    public static TemporaryFolderCleanupEvery = (): number => {
        return ConfigurationManager._config.TemporaryFolders.CleanupEveryMinutes;
    };

    public static MobileNotificationProvider = (): MobileNotificationProvider => {
        return ConfigurationManager._config.MobileNotification.Provider;
    };

}

ConfigurationManager.initialize();

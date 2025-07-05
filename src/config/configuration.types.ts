
export type FileStorageProvider = 'AWS-S3' | 'GCP-FileStore' | 'Custom';
export type SmsProvider = 'Twilio' | 'Mock';
export type EmailProvider = 'SendGrid' | 'SMTP' | 'Mock' | 'AWS-SES';
export type MobileNotificationProvider = 'Firebase' | 'Mock';

///////////////////////////////////////////////////////////////////////////////////////////

export interface Configurations {
    SystemIdentifier: string;
    BaseUrl: string;
    FileStorage: {
        Provider: FileStorageProvider;
    };
    Email: {
        Provider: EmailProvider;
    };
    Sms: {
        Provider: SmsProvider;
    };
    MobileNotification: {
        Provider: MobileNotificationProvider;
    };
    TemporaryFolders: {
        UploadFolder: string;
        DownloadFolder: string;
        LogFolder: string;
        CleanupEveryMinutes: number;
    };
    MaxUploadFileSize: number;
    Telemetry: boolean;
}

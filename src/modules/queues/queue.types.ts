
export interface InMessageQueueJobData {
    JobId    : string;
    TenantId : string;
    Channel  : string;
    Payload  : any;
    Headers  : Record<string, string>;
    Timestamp: Date;
}
export interface InMessageQueueJob {
    id         : string;
    Data       : InMessageQueueJobData;
    Attempts   : number;
    MaxAttempts: number;
}

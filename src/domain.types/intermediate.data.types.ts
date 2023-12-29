import { IChannel } from "../channels/channel.interface";
import { DependencyContainer } from "tsyringe";
import { uuid } from "./miscellaneous/system.types";

export interface InMessageMetadata {
    Channel    : IChannel;
    ChannelName: string;
    Container  : DependencyContainer;
    RequestBody: any;
    TenantName : string;
    TenantId   : uuid;
}

export interface SupportInMessageMetadata {
    SupportChannel    : IChannel;
    SupportChannelName: string;
    Container         : DependencyContainer;
    RequestBody       : any;
    TenantName        : string;
    TenantId          : uuid;
}

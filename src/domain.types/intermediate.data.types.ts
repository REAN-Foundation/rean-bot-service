import { IChannel } from "../channels/channel.interface";
import { DependencyContainer } from "tsyringe";
import { uuid } from "./miscellaneous/system.types";

export interface InMessageMetadata {
    Container  : DependencyContainer;
    RequestBody: any;
    Channel    : IChannel;
    ChannelName: string;
    TenantName : string;
    TenantId   : uuid;
}

import { OutgoingMessage } from "../../types/common.types";
import { IChannel } from "../channel.interface";

export interface ISupportChannel {

    sendSupportResponse: (outChannel: IChannel, message: OutgoingMessage) => Promise<any>;

}

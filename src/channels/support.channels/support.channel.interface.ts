import { OutgoingMessage } from "../../domain.types/message";
import { IChannel } from "../channel.interface";

export interface ISupportChannel {

    sendSupportResponse: (outChannel: IChannel, message: OutgoingMessage) => Promise<any>;

}

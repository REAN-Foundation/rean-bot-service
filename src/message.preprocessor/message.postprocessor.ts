import { Message } from "../domain.types/message";

export class MessagePostprocessor {

    static async process(message: Message): Promise<Message> {
        return message;
    }

}

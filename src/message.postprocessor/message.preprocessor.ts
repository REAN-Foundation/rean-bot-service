import { Message } from "../domain.types/message";

export class MessagePreprocessor {

    static async process(message: Message): Promise<Message> {
        return message;
    }

}

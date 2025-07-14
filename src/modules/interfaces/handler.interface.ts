export interface IMessageHandler {
  handle(messageData: any, conversation: any, intentResult: any): Promise<any>;
  canHandle(messageData: any, conversation: any): Promise<boolean>;
  getHandlerType(): string;
}

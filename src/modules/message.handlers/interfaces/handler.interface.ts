export interface IMessageHandler {
  handle(message: any, conversation: any, intentResult: any): Promise<any>;
}

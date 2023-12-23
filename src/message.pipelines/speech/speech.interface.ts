
export interface ISpeechService {

    speechToText(audio: Buffer): Promise<string>;

    textToSpeech(text: string): Promise<string>;

}

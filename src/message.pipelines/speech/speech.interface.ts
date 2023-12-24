
export interface ISpeechService {

    speechToText(audio: Buffer, mimeType: string, preferredLanguage: string): Promise<string>;

    textToSpeech(text: string): Promise<string>;

}

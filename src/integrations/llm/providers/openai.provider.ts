/* eslint-disable @typescript-eslint/no-unused-vars */
import { LanguageCode } from "../../../domain.types/language";
import { ILLMServiceProvider } from "../llm.provider.interface";

export class OpenAIProvider implements ILLMServiceProvider {

    // private _openai: OpenAI;

    // constructor(
    //     @inject('OpenAI') openai?: OpenAI,
    // ) {
    //     this._openai = openai;
    // }

    public translate = async (targetLanguage: LanguageCode, text: string): Promise<string> => {
        return text;
    };

    public detectLanguage = async (text: string): Promise<LanguageCode> => {
        return 'en';
    };

}

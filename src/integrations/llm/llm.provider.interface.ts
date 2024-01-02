import { LanguageCode } from "../../types/language";

export interface ILLMServiceProvider {

    translate(targetLanguage: LanguageCode, text: string): Promise<string>;

    detectLanguage(text: string): Promise<LanguageCode>;

}

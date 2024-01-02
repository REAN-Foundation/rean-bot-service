import { LanguageCode } from "../../types/language";

///////////////////////////////////////////////////////////////////////

export interface ITranslator {

    translate(targetLanguage: LanguageCode, text: string): Promise<string>;

    translateTextWithGlossary(targetLanguage: LanguageCode, text: string): Promise<string>;

    detectLanguage(text: string): Promise<LanguageCode>;

}

import { v2, TranslationServiceClient } from '@google-cloud/translate';
import { ITranslator } from '../translator.interface';
import { LanguageCode } from '../../../domain.types/language';

////////////////////////////////////////////////////////////////////////////////

export class GoogleTranslator implements ITranslator {

    private _client: TranslationServiceClient;

    private _options = {};

    constructor() {
        this._client = new TranslationServiceClient();
        const gcpCreds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        this._options = {
            credentials : gcpCreds,
            projectId   : gcpCreds.project_id
        };
    }

    public translate = async (targetLanguage: LanguageCode, text: string): Promise<string> => {
        const translate = new v2.Translate(this._options);
        const [translation] = await translate.translate(text, targetLanguage);
        return translation;
    };

    public detectLanguage = async (text: string): Promise<LanguageCode> => {
        const translate = new v2.Translate(this._options);
        const [detections] = await translate.detect(text);
        const language = detections.language;
        const language_ = language === "und" ? 'en' : language;
        return language_ as LanguageCode;
    };

}

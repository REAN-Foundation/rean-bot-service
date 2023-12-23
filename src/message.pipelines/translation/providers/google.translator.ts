import { v2, TranslationServiceClient } from '@google-cloud/translate';
import { ITranslator } from '../translator.interface';
import { LanguageCode } from '../../../domain.types/language';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { logger } from '../../../logger/logger';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class GoogleTranslator implements ITranslator {

    private _options = null;

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
    ) {
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

    public translateTextWithGlossary = async(targetLanguage: LanguageCode, text: string) => {
        let output = null;
        const translationGlossaryId = this._tenantEnvProvider.getTenantEnvironmentVariable("TRANSLATE_GLOSSARY");
        const translationClient = new TranslationServiceClient(this._options);
        const projectId = this._options.projectId;
        const location = 'us-central1'; // Should be an environment variable
        const glossaryId = translationGlossaryId;
        const glossaryConfig = {
            glossary : `projects/${projectId}/locations/${location}/glossaries/${glossaryId}`,
        };
        const request = {
            parent             : `projects/${projectId}/locations/${location}`,
            contents           : [text],
            mimeType           : 'text/plain', // mime types: text/plain, text/html
            sourceLanguageCode : 'en',
            targetLanguageCode : targetLanguage as string,
            glossaryConfig     : glossaryConfig,
        };
        try {
            const [response] = await translationClient.translateText(request);
            const glossaryBasedResponse = response.glossaryTranslations[0].translatedText;
            output = [glossaryBasedResponse];
        } catch {
            logger.error(`Failed to translate text with glossary. Falling back to normal translation.`);
        }
        return output;
    };

}

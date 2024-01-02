import { LanguageCode } from '../../types/language';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { inject, Lifecycle, scoped } from 'tsyringe';
import { MessageContentType } from '../../types/enums';
import { ITranslator } from './translator.interface';
import { UserLanguage } from './user.language';

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class Translator {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject('ITranslator') private _translator?: ITranslator,
        @inject('UserLanguage') private _userLanguage?: UserLanguage,
    ) {}

    public async detectLanguage(text: string,): Promise<LanguageCode> {
        const languageCode = await this._translator.detectLanguage(text);
        return languageCode;
    }

    public translate = async (
        sessionId: string,
        text: string,
        messageType: MessageContentType = MessageContentType.Text,
        useGlossary = false): Promise<string> => {
        if (!text) {
            return text;
        }
        let targetLanguage = await this.getTargetLanguage(sessionId, text, messageType);
        if (!targetLanguage) {
            targetLanguage = 'en';
        }
        const detectedLanguage = await this.detectLanguage(text);
        if (detectedLanguage === targetLanguage) {
            return text;
        }
        if (!useGlossary) {
            const translatedText = await this._translator.translate(targetLanguage, text);
            return translatedText;
        }
        else {
            const translatedText = await this._translator.translate(targetLanguage, text);
            return translatedText;
        }
    };

    private getLanguageFromMessage = async (
        text: string,
        messageType: MessageContentType): Promise<LanguageCode> => {
        let detectedLanguage:LanguageCode = 'en';
        if (messageType !== MessageContentType.Location &&
            messageType !== MessageContentType.Image) {
            detectedLanguage = await this.detectLanguage(text);
        }
        else {
            detectedLanguage = 'en';
        }
        return detectedLanguage;
    };

    private getTargetLanguage = async (
        sessionId: string,
        text: string,
        messageType: MessageContentType = MessageContentType.Text)
        : Promise<LanguageCode> => {
        let targetLanguage = await this._userLanguage.getLanguage(sessionId);
        const threshold = this._tenantEnvProvider.getTenantEnvironmentVariable("TRANSLATE_SETTING");
        let textLengthThreshold = parseInt(threshold);
        textLengthThreshold = textLengthThreshold ? textLengthThreshold : 10;
        if (text.length >= textLengthThreshold) {
            targetLanguage = await this.getLanguageFromMessage(text, messageType);
            return targetLanguage;
        }
        return targetLanguage;
    };

}

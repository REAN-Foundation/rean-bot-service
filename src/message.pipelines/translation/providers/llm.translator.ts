import { ITranslator } from '../translator.interface';
import { LanguageCode } from '../../../types/language';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { LLMService } from '../../../integrations/llm/llm.service';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class LLMTranslator implements ITranslator {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject('LLMService') private _llmsService?: LLMService,
    ) {
    }

    public translate = async (targetLanguage: LanguageCode, text: string): Promise<string> => {
        return await this._llmsService.translate(targetLanguage, text);
    };

    public detectLanguage = async (text: string): Promise<LanguageCode> => {
        return await this._llmsService.detectLanguage(text);
    };

    public translateTextWithGlossary = async(targetLanguage: LanguageCode, text: string) => {
        return await this.translate(targetLanguage, text);
    };

}

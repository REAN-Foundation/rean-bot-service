/* eslint-disable @typescript-eslint/no-unused-vars */
import { TenantEnvironmentProvider } from "../../auth/tenant.environment/tenant.environment.provider";
import { scoped, Lifecycle, inject } from "tsyringe";
import { ILLMServiceProvider } from "./llm.provider.interface";
import { LanguageCode } from "../../domain.types/language";

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class LLMService {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject('ILLMServiceProvider') private _llmService?: ILLMServiceProvider,
    ) {
    }

    public translate = async (targetLanguage: LanguageCode, text: string): Promise<string> => {
        return await this._llmService.translate(targetLanguage, text);
    };

    public detectLanguage = async (text: string): Promise<LanguageCode> => {
        return await this._llmService.detectLanguage(text);
    };

}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Lifecycle, inject, scoped } from "tsyringe";
import { LanguageCode } from "../../../../types/language";
import { ILLMServiceProvider } from "../../llm.provider.interface";
import OpenAI from 'openai';
import { TenantEnvironmentProvider } from "../../../../auth/tenant.environment/tenant.environment.provider";

////////////////////////////////////////////////////////////////////////////////
@scoped(Lifecycle.ContainerScoped)
export class OpenAIProvider implements ILLMServiceProvider {

    private _openai: OpenAI;

    constructor(
        @inject('TenantEnvironmentProvider') private _tenantEnvProvider?: TenantEnvironmentProvider,
    ) {
        const apiKey = this._tenantEnvProvider.getTenantEnvironmentVariable("OPENAI_API_KEY");
        //process.env['OPENAI_API_KEY'], // This is the default and can be omitted
        this._openai = new OpenAI({
            apiKey : apiKey
        });

    }

    public translate = async (targetLanguage: LanguageCode, text: string): Promise<string> => {
        return text;
    };

    public detectLanguage = async (text: string): Promise<LanguageCode> => {
        return 'en';
    };

}

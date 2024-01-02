import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { inject, Lifecycle, scoped } from 'tsyringe';
import { ISpeechService } from './speech.interface';

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class SpeechService {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject('ISpeechService') private _converter?: ISpeechService,
    ) {}

    public async speechToText(audio: Buffer, mimeType: string, preferrableLanguage: string): Promise<string> {
        return await this._converter.speechToText(audio, mimeType, preferrableLanguage);
    }

    public async textToSpeech(text: string): Promise<string> {
        return await this._converter.textToSpeech(text);
    }

}

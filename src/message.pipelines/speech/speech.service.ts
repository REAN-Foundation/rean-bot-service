import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { inject, Lifecycle, scoped } from 'tsyringe';
import { ISpeechService } from './speech.interface';

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class SpeechToTextConverter {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject('ISpeechService') private _converter?: ISpeechService,
    ) {}

    public async speechToText(audio: Buffer): Promise<string> {
        return await this._converter.speechToText(audio);
    }

    public async textToSpeech(text: string): Promise<string> {
        return await this._converter.textToSpeech(text);
    }

}

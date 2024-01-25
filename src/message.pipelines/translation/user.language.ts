import { inject, Lifecycle, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { SessionService } from '../../database/typeorm/services/session.service';
import { uuid } from '../../types/miscellaneous/system.types';
import { LanguageCode } from '../../types/language';

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class UserLanguage {

    private translateSetting;

    constructor(
        @inject('TenantName') private _tenantName?: string,
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject(SessionService) private _sessionService?: SessionService,
    ){}

    public setLanguage = async (sessionId: uuid, langcode: LanguageCode): Promise<boolean> => {
        const session = await this._sessionService?.getById(sessionId);
        if (session) {
            session.Language = langcode;
            const updates = {
                Language : langcode,
            };
            await this._sessionService?.update(session.id, updates);
            return true;
        }
        return false;
    };

    public getLanguage = async (sessionId: uuid): Promise<LanguageCode> => {
        const session = await this._sessionService?.getById(sessionId);
        if (session) {
            return session.Language as LanguageCode;
        }
        return null;
    };

}

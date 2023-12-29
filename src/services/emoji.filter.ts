import emojiRegex from 'emoji-regex';
import { inject, Lifecycle, scoped } from 'tsyringe';
import { logger } from '../logger/logger';
import { TenantEnvironmentProvider } from '../auth/tenant.environment/tenant.environment.provider';

///////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class EmojiFilter{

    constructor(@inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider){}

    public checkForEmoji = async (message: string) => {

        const regex = emojiRegex();
        let emojis = null;
        if (this._tenantEnvProvider.getTenantEnvironmentVariable("EMOJI")){
            emojis = JSON.parse(this._tenantEnvProvider.getTenantEnvironmentVariable("EMOJI"));
        }
        else {
            emojis = JSON.parse(process.env.EMOJI);
        }
        const emojiKeys = Object.keys(emojis);

        let filteredMessage: string = message;

        for (const match of message.matchAll(regex)) {
            const convertToUnicodeEmoji = await this.emojiUnicode(match[0]);

            if (convertToUnicodeEmoji !== undefined){
                if (emojiKeys.includes(convertToUnicodeEmoji)){
                    filteredMessage = emojis[convertToUnicodeEmoji];
                    return filteredMessage;
                }
                else {
                    logger.info("Unregistered emoji");
                    filteredMessage = message.replace(match[0]," ");
                    return filteredMessage;
                }
            }
            else {
                filteredMessage = message;
            }
        }
        return filteredMessage;
    };

    public emojiUnicode = async (emoji) => {
        let comp = null;
        if (emoji.length === 1) {
            comp = emoji.charCodeAt(0);
        }
        comp = (
            (emoji.charCodeAt(0) - 0xD800) * 0x400 +
            (emoji.charCodeAt(1) - 0xDC00) + 0x10000
        );
        if (comp < 0) {
            comp = emoji.charCodeAt(0);
        }
        return comp.toString("16");
    };

}

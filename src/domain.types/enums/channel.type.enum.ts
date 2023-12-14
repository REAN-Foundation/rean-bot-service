export enum ChannelType {
    WhatsApp     = 'WhatsApp',
    WhatsAppD360 = 'WhatsAppD360',
    Telegram     = 'Telegram',
    Teams        = 'Teams',
    Web          = 'Web',
    Mobile       = 'Mobile',
    Clickup      = 'Clickup',
    Slack        = 'Slack',
    Mock         = 'Mock',
}

export const ChannelTypeList: ChannelType[] = [
    ChannelType.WhatsApp,
    ChannelType.WhatsAppD360,
    ChannelType.Telegram,
    ChannelType.Teams,
    ChannelType.Web,
    ChannelType.Mobile,
    ChannelType.Clickup,
    ChannelType.Slack,
];

export const getChannelType = (channel: string): ChannelType => {
    const channel_ = channel.toLowerCase();
    const channelType = ChannelTypeList.find(x => x.toLowerCase() === channel_);
    return channelType;
};

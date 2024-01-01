export enum MessageDirection {
    In          = 'In',
    Out         = 'Out'
}

export enum SupportMessageDirection {
    ToSupport   = 'ToSupport',
    FromSupport = 'FromSupport',
}

export const MessageDirectionList: MessageDirection[] = [
    MessageDirection.In,
    MessageDirection.Out
];

export const SupportMessageDirectionList: SupportMessageDirection[] = [
    SupportMessageDirection.ToSupport,
    SupportMessageDirection.FromSupport
];

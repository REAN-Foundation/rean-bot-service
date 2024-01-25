export enum UserFeedbackType {
    Positive = 'Positive',
    Negative = 'Negative',
    Neutral  = 'Neutral',
    Rating   = 'Rating',
    None     = 'None',
}

export const UserFeedbackTypeList: UserFeedbackType[] = [
    UserFeedbackType.Positive,
    UserFeedbackType.Negative,
    UserFeedbackType.Neutral,
    UserFeedbackType.Rating,
    UserFeedbackType.None,
];

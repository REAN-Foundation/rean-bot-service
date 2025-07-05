// import rateLimit from 'express-rate-limit';

// export const webhookRateLimit = rateLimit({
//     windowMs : 60 * 1000, // 1 minute
//     max      : (req) => {
//         // Different limits based on tenant tier
//         const tenant = (req as any).tenant;
//         return tenant?.configuration?.limits?.messagesPerMinute || 100;
//     },
//     message : {
//         error : 'Too many webhook requests, please try again later.'
//     },
//     standardHeaders : true,
//     legacyHeaders   : false,
//     keyGenerator    : (req) => {
//         return `webhook:${(req as any).tenantId}:${req.ip}`;
//     }
// });

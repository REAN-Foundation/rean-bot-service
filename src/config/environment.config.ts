// import { z } from 'zod';

// const envSchema = z.object({
//     NODE_ENV              : z.enum(['development', 'production', 'test']).default('development'),
//     PORT                  : z.string().transform(Number).default('3000'),
//     DATABASE_URL          : z.string().min(1),
//     REDIS_URL             : z.string().min(1),
//     JWT_SECRET            : z.string().min(32),
//     OPENAI_API_KEY        : z.string().min(1),
//     WHATSAPP_VERIFY_TOKEN : z.string().min(1),
//     TELEGRAM_BOT_TOKEN    : z.string().min(1),
//     SLACK_SIGNING_SECRET  : z.string().min(1),
//     LOG_LEVEL             : z.enum(['error', 'warn', 'info', 'debug']).default('info'),
//     JAEGER_ENDPOINT       : z.string().optional(),
// });

// export const env = envSchema.parse(process.env);

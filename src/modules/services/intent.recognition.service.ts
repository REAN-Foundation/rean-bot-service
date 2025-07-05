// import { injectable } from 'tsyringe';
// import OpenAI from 'openai';
// import { env } from '../config/environment.config';

// export interface IntentResult {
//   intent: string;
//   confidence: number;
//   entities: Record<string, any>;
// }

// @injectable()
// export class IntentRecognitionService {
//   private openai: OpenAI;

//   constructor() {
//     this.openai = new OpenAI({
//       apiKey: env.OPENAI_API_KEY
//     });
//   }

//   async recognizeIntent(text: string, context: any): Promise<IntentResult> {
//     try {
//       const prompt = this.buildIntentPrompt(text, context);

//       const completion = await this.openai.chat.completions.create({
//         model: "gpt-4",
//         messages: [
//           {
//             role: "system",
//             content: `You are an intent recognition system. Analyze the user's message and return a JSON response with:
//             - intent: one of [assessment, workflow, reminder, task, small_talk, feedback, fallback]
//             - confidence: number between 0 and 1
//             - entities: extracted entities as key-value pairs

//             Return only valid JSON.`
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         temperature: 0.1,
//         max_tokens: 200
//       });

//       const result = JSON.parse(completion.choices[0].message.content || '{}');

//       return {
//         intent: result.intent || 'fallback',
//         confidence: result.confidence || 0.5,
//         entities: result.entities || {}
//       };

//     } catch (error) {
//       console.error('Intent recognition failed:', error);
//       return {
//         intent: 'fallback',
//         confidence: 0.1,
//         entities: {}
//       };
//     }
//   }

//   private buildIntentPrompt(text: string, context: any): string {
//     return `
//       User message: "${text}"

//       Context:
//       - Previous intent: ${context.intent || 'none'}
//       - Conversation history: ${JSON.stringify(context.history?.slice(-3) || [])}
//       - Known entities: ${JSON.stringify(context.entities || {})}

//       Analyze this message and determine the user's intent.
//     `;
//   }
// }

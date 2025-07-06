/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class SmallTalkHandler implements IMessageHandler {

    private greetingResponses = [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Hey! Nice to see you. How are you doing?",
        "Hello! I'm here to assist you. What's on your mind?"
    ];

    private goodbyeResponses = [
        "Goodbye! Have a great day!",
        "See you later! Take care!",
        "Bye! Feel free to come back anytime.",
        "Until next time! Have a wonderful day!"
    ];

    private thanksResponses = [
        "You're welcome! Happy to help!",
        "No problem at all!",
        "My pleasure! Anything else I can help with?",
        "Glad I could help!"
    ];

    private howAreYouResponses = [
        "I'm doing great, thank you for asking! How are you?",
        "I'm here and ready to help! How are you doing today?",
        "I'm fantastic! Thanks for asking. How about you?",
        "All good on my end! How are things with you?"
    ];

    async handle(messageData: any, conversation: any, intentResult: any): Promise<any> {
        return {
            text: 'SmallTalk handler response',
            type: 'text'
        };
    }

    async canHandle(messageData: any, conversation: any): Promise<boolean> {
        return true; // Basic implementation
    }

    getHandlerType(): string {
        return 'SMALL_TALK';
    }

    private detectSmallTalkType(text: string): string {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
            return 'greeting';
        }
        if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you')) {
            return 'goodbye';
        }
        if (lowerText.includes('thank') || lowerText.includes('thanks')) {
            return 'thanks';
        }
        if (lowerText.includes('how are you') || lowerText.includes('how are u')) {
            return 'how_are_you';
        }
        if (lowerText.includes('weather')) {
            return 'weather';
        }
        if (lowerText.includes('joke') || lowerText.includes('funny')) {
            return 'joke';
        }

        return 'general';
    }

    private handleGreeting(conversation: any): any {
        const response = this.getRandomResponse(this.greetingResponses);
        const userName = conversation.context.entities.userName || '';

        return {
            text     : userName ? `${response.replace('Hello!', `Hello ${userName}!`)}` : response,
            type     : 'smalltalk_greeting',
            metadata : {
                smallTalkType : 'greeting'
            }
        };
    }

    private handleGoodbye(conversation: any): any {
        const response = this.getRandomResponse(this.goodbyeResponses);

        return {
            text     : response,
            type     : 'smalltalk_goodbye',
            metadata : {
                smallTalkType   : 'goodbye',
                endConversation : true
            }
        };
    }

    private handleThanks(conversation: any): any {
        const response = this.getRandomResponse(this.thanksResponses);

        return {
            text     : response,
            type     : 'smalltalk_thanks',
            metadata : {
                smallTalkType : 'thanks'
            }
        };
    }

    private handleHowAreYou(conversation: any): any {
        const response = this.getRandomResponse(this.howAreYouResponses);

        return {
            text     : response,
            type     : 'smalltalk_how_are_you',
            metadata : {
                smallTalkType : 'how_are_you'
            }
        };
    }

    private handleWeather(conversation: any): any {
        return {
            text     : "I don't have access to current weather information, but I hope it's nice where you are! Is there anything else I can help you with?",
            type     : 'smalltalk_weather',
            metadata : {
                smallTalkType : 'weather'
            }
        };
    }

    private handleJoke(conversation: any): any {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the chatbot go to therapy? It had too many issues to process!",
            "What do you call a chatbot that loves music? A rhythm and bot!",
            "Why don't chatbots ever get tired? Because they run on endless loops!"
        ];

        const joke = this.getRandomResponse(jokes);

        return {
            text     : joke,
            type     : 'smalltalk_joke',
            metadata : {
                smallTalkType : 'joke'
            }
        };
    }

    private handleGeneral(message: any, conversation: any): any {
        const responses = [
            "That's interesting! Tell me more.",
            "I see. How can I help you with that?",
            "Thanks for sharing that with me!",
            "I appreciate you telling me that. What would you like to do next?"
        ];

        const response = this.getRandomResponse(responses);

        return {
            text     : response,
            type     : 'smalltalk_general',
            metadata : {
                smallTalkType   : 'general',
                originalMessage : message.content.text
            }
        };
    }

    private getRandomResponse(responses: string[]): string {
        return responses[Math.floor(Math.random() * responses.length)];
    }

}

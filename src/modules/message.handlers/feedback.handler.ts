import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class FeedbackHandler implements IMessageHandler {

    async handle(message: any, conversation: any, intentResult: any): Promise<any> {
        const feedbackType = intentResult.entities.feedback_type || 'general';
        const rating = intentResult.entities.rating;
        const feedbackText = intentResult.entities.feedback_text || message.content.text;

        // Store feedback in conversation context
        if (!conversation.context.feedback) {
            conversation.context.feedback = [];
        }

        const feedback = {
            id        : Date.now().toString(),
            type      : feedbackType,
            rating    : rating,
            text      : feedbackText,
            timestamp : new Date(),
            status    : 'received'
        };

        conversation.context.feedback.push(feedback);

        // Determine response based on feedback type and rating
        if (rating) {
            return this.handleRatingFeedback(rating, feedbackText, feedbackType);
        } else {
            return this.handleTextFeedback(feedbackText, feedbackType);
        }
    }

    private handleRatingFeedback(rating: number, text: string, type: string): any {
        let responseText = '';
        let followUp = '';

        if (rating >= 4) {
            responseText = `Thank you for the ${rating}-star rating! I'm glad I could help you.`;
            followUp = 'Is there anything else I can assist you with?';
        } else if (rating >= 3) {
            responseText = `Thanks for the ${rating}-star rating. I appreciate your feedback.`;
            followUp = 'How can I improve to better assist you next time?';
        } else {
            responseText = `I'm sorry you had a ${rating}-star experience. Your feedback is valuable to me.`;
            followUp = 'Could you tell me what went wrong so I can improve?';
        }

        if (text && text.trim() !== '') {
            responseText += ` Your comment: "${text}" has been noted.`;
        }

        return {
            text     : `${responseText} ${followUp}`,
            type     : 'feedback_rating_response',
            metadata : {
                feedbackType : type,
                rating       : rating,
                sentiment    : rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative'
            }
        };
    }

    private handleTextFeedback(text: string, type: string): any {
        const sentiment = this.analyzeSentiment(text);
        let responseText = '';

        switch (sentiment) {
            case 'positive':
                responseText = "Thank you for your positive feedback! It means a lot to me.";
                break;
            case 'negative':
                responseText = "I appreciate your honest feedback. I'll work on improving based on your comments.";
                break;
            default:
                responseText = "Thank you for taking the time to provide feedback. I value your input.";
        }

        return {
            text     : `${responseText} Your feedback has been recorded and will help me serve you better in the future.`,
            type     : 'feedback_text_response',
            metadata : {
                feedbackType : type,
                sentiment    : sentiment,
                hasText      : text.length > 0
            }
        };
    }

    private analyzeSentiment(text: string): string {
        const lowerText = text.toLowerCase();

        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'helpful', 'useful', 'love', 'like', 'perfect', 'awesome'];
        const negativeWords = ['bad', 'terrible', 'awful', 'useless', 'hate', 'dislike', 'wrong', 'error', 'problem', 'issue'];

        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) {
            return 'positive';
        } else if (negativeCount > positiveCount) {
            return 'negative';
        } else {
            return 'neutral';
        }
    }

}

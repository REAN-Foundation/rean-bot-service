import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class AssessmentHandler implements IMessageHandler {

    async handle(message: any, conversation: any, intentResult: any): Promise<any> {
    // Assessment logic implementation
        const assessmentType = intentResult.entities.assessment_type || 'general';

        const questions = this.getAssessmentQuestions(assessmentType);
        const currentStep = conversation.context.assessmentStep || 0;

        if (currentStep < questions.length) {
            return {
                text     : questions[currentStep],
                type     : 'assessment_question',
                metadata : {
                    assessmentType,
                    currentStep : currentStep + 1,
                    totalSteps  : questions.length
                }
            };
        } else {
            // Assessment complete
            return {
                text     : "Assessment completed! Your results will be processed shortly.",
                type     : 'assessment_complete',
                metadata : {
                    assessmentType,
                    completed : true
                }
            };
        }
    }

    private getAssessmentQuestions(type: string): string[] {
        const questionSets = {
            general : [
                "How would you rate your current satisfaction level from 1-10?",
                "What is your primary goal at the moment?",
                "What challenges are you currently facing?"
            ],
            skills : [
                "What skills would you like to develop?",
                "How do you prefer to learn new things?",
                "What is your current experience level in this area?"
            ]
        };

        return questionSets[type as keyof typeof questionSets] || questionSets.general;
    }

}

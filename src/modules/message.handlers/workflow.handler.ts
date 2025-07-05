import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class WorkflowHandler implements IMessageHandler {

    async handle(message: any, conversation: any, intentResult: any): Promise<any> {
        const workflowType = intentResult.entities.workflow_type;
        const action = intentResult.entities.action || 'start';

        switch (action) {
            case 'start':
                return this.startWorkflow(workflowType, conversation);
            case 'continue':
                return this.continueWorkflow(conversation);
            case 'complete':
                return this.completeWorkflow(conversation);
            default:
                return {
                    text : "I can help you start, continue, or complete a workflow. What would you like to do?",
                    type : 'workflow_prompt'
                };
        }
    }

    private async startWorkflow(type: string, conversation: any): Promise<any> {
    // Initialize workflow state
        conversation.context.workflowState = {
            type,
            currentStep : 0,
            status      : 'active',
            data        : {}
        };

        return {
            text     : `Starting ${type} workflow. Let's begin with the first step.`,
            type     : 'workflow_started',
            metadata : {
                workflowType : type,
                nextStep     : this.getNextWorkflowStep(type, 0)
            }
        };
    }

    private async continueWorkflow(conversation: any): Promise<any> {
        const workflowState = conversation.context.workflowState;

        if (!workflowState || workflowState.status !== 'active') {
            return {
                text : "No active workflow found. Would you like to start a new one?",
                type : 'workflow_error'
            };
        }

        const nextStep = this.getNextWorkflowStep(workflowState.type, workflowState.currentStep);
        workflowState.currentStep++;

        return {
            text     : nextStep.instruction,
            type     : 'workflow_step',
            metadata : {
                workflowType : workflowState.type,
                currentStep  : workflowState.currentStep,
                nextStep
            }
        };
    }

    private async completeWorkflow(conversation: any): Promise<any> {
        const workflowState = conversation.context.workflowState;

        if (workflowState) {
            workflowState.status = 'completed';
            workflowState.completedAt = new Date();
        }

        return {
            text     : "Workflow completed successfully! Is there anything else I can help you with?",
            type     : 'workflow_completed',
            metadata : {
                workflowType : workflowState?.type,
                completedAt  : new Date()
            }
        };
    }

    private getNextWorkflowStep(type: string, currentStep: number): any {
        const workflows = {
            onboarding : [
                { instruction: "Please provide your name.", validation: "name" },
                { instruction: "What's your email address?", validation: "email" },
                { instruction: "Tell me about your goals.", validation: "text" }
            ],
            support : [
                { instruction: "Describe the issue you're experiencing.", validation: "text" },
                { instruction: "When did this issue first occur?", validation: "date" },
                { instruction: "Have you tried any solutions?", validation: "text" }
            ]
        };

        const workflowSteps = workflows[type as keyof typeof workflows] || [];
        return workflowSteps[currentStep] || { instruction: "Workflow step not found.", validation: "none" };
    }

}

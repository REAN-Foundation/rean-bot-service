import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class TaskHandler implements IMessageHandler {

    async handle(message: any, conversation: any, intentResult: any): Promise<any> {
        const action = intentResult.entities.action || 'create';

        switch (action) {
            case 'create':
                return this.createTask(intentResult.entities, conversation);
            case 'list':
                return this.listTasks(conversation);
            case 'complete':
                return this.completeTask(intentResult.entities, conversation);
            case 'update':
                return this.updateTask(intentResult.entities, conversation);
            default:
                return {
                    text : "I can help you create, list, complete, or update tasks. What would you like to do?",
                    type : 'task_prompt'
                };
        }
    }

    private async createTask(entities: any, conversation: any): Promise<any> {
        const taskTitle = entities.task_title || 'New Task';
        const taskDescription = entities.task_description || '';
        const priority = entities.priority || 'medium';

        // Store task in conversation context
        if (!conversation.context.tasks) {
            conversation.context.tasks = [];
        }

        const task = {
            id          : Date.now().toString(),
            title       : taskTitle,
            description : taskDescription,
            priority,
            status      : 'pending',
            created     : new Date(),
            updated     : new Date()
        };

        conversation.context.tasks.push(task);

        return {
            text     : `Task created: "${taskTitle}" with ${priority} priority`,
            type     : 'task_created',
            metadata : {
                taskId : task.id,
                taskTitle,
                priority
            }
        };
    }

    private async listTasks(conversation: any): Promise<any> {
        const tasks = conversation.context.tasks || [];
        const pendingTasks = tasks.filter((t: any) => t.status === 'pending');

        if (pendingTasks.length === 0) {
            return {
                text : "You don't have any pending tasks.",
                type : 'task_list_empty'
            };
        }

        const taskList = pendingTasks.map((t: any, index: number) =>
            `${index + 1}. ${t.title} (${t.priority} priority)`
        ).join('\n');

        return {
            text     : `Your pending tasks:\n${taskList}`,
            type     : 'task_list',
            metadata : {
                count : pendingTasks.length,
                tasks : pendingTasks
            }
        };
    }

    private async completeTask(entities: any, conversation: any): Promise<any> {
        const tasks = conversation.context.tasks || [];
        const taskId = entities.task_id;

        if (!taskId) {
            return {
                text : "Please specify which task you'd like to complete.",
                type : 'task_complete_prompt'
            };
        }

        const taskIndex = tasks.findIndex((t: any) => t.id === taskId);

        if (taskIndex === -1) {
            return {
                text : "Task not found.",
                type : 'task_not_found'
            };
        }

        tasks[taskIndex].status = 'completed';
        tasks[taskIndex].updated = new Date();

        return {
            text     : `Task "${tasks[taskIndex].title}" has been completed!`,
            type     : 'task_completed',
            metadata : {
                taskId,
                taskTitle : tasks[taskIndex].title
            }
        };
    }

    private async updateTask(entities: any, conversation: any): Promise<any> {
        const tasks = conversation.context.tasks || [];
        const taskId = entities.task_id;

        if (!taskId) {
            return {
                text : "Please specify which task you'd like to update.",
                type : 'task_update_prompt'
            };
        }

        const taskIndex = tasks.findIndex((t: any) => t.id === taskId);

        if (taskIndex === -1) {
            return {
                text : "Task not found.",
                type : 'task_not_found'
            };
        }

        // Update task properties if provided
        if (entities.task_title) {
            tasks[taskIndex].title = entities.task_title;
        }
        if (entities.task_description) {
            tasks[taskIndex].description = entities.task_description;
        }
        if (entities.priority) {
            tasks[taskIndex].priority = entities.priority;
        }

        tasks[taskIndex].updated = new Date();

        return {
            text     : `Task "${tasks[taskIndex].title}" has been updated.`,
            type     : 'task_updated',
            metadata : {
                taskId,
                taskTitle : tasks[taskIndex].title
            }
        };
    }

}

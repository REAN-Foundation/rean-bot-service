import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class ReminderHandler implements IMessageHandler {

    async handle(message: any, conversation: any, intentResult: any): Promise<any> {
        const action = intentResult.entities.action || 'create';

        switch (action) {
            case 'create':
                return this.createReminder(intentResult.entities, conversation);
            case 'list':
                return this.listReminders(conversation);
            case 'cancel':
                return this.cancelReminder(intentResult.entities, conversation);
            default:
                return {
                    text : "I can help you create, list, or cancel reminders. What would you like to do?",
                    type : 'reminder_prompt'
                };
        }
    }

    private async createReminder(entities: any, conversation: any): Promise<any> {
        const reminderText = entities.reminder_text || 'Reminder';
        const reminderTime = entities.reminder_time || '1 hour';

        // Store reminder in conversation context
        if (!conversation.context.reminders) {
            conversation.context.reminders = [];
        }

        const reminder = {
            id      : Date.now().toString(),
            text    : reminderText,
            time    : reminderTime,
            created : new Date(),
            status  : 'active'
        };

        conversation.context.reminders.push(reminder);

        return {
            text     : `Reminder set: "${reminderText}" in ${reminderTime}`,
            type     : 'reminder_created',
            metadata : {
                reminderId : reminder.id,
                reminderText,
                reminderTime
            }
        };
    }

    private async listReminders(conversation: any): Promise<any> {
        const reminders = conversation.context.reminders || [];
        const activeReminders = reminders.filter((r: any) => r.status === 'active');

        if (activeReminders.length === 0) {
            return {
                text : "You don't have any active reminders.",
                type : 'reminder_list_empty'
            };
        }

        const reminderList = activeReminders.map((r: any, index: number) =>
            `${index + 1}. ${r.text} (${r.time})`
        ).join('\n');

        return {
            text     : `Your active reminders:\n${reminderList}`,
            type     : 'reminder_list',
            metadata : {
                count     : activeReminders.length,
                reminders : activeReminders
            }
        };
    }

    private async cancelReminder(entities: any, conversation: any): Promise<any> {
        const reminders = conversation.context.reminders || [];
        const reminderId = entities.reminder_id;

        if (!reminderId) {
            return {
                text : "Please specify which reminder you'd like to cancel.",
                type : 'reminder_cancel_prompt'
            };
        }

        const reminderIndex = reminders.findIndex((r: any) => r.id === reminderId);

        if (reminderIndex === -1) {
            return {
                text : "Reminder not found.",
                type : 'reminder_not_found'
            };
        }

        reminders[reminderIndex].status = 'cancelled';

        return {
            text     : `Reminder "${reminders[reminderIndex].text}" has been cancelled.`,
            type     : 'reminder_cancelled',
            metadata : {
                reminderId,
                reminderText : reminders[reminderIndex].text
            }
        };
    }

}

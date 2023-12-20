import { IntentEmitter } from "./intent.emitter";
import { handleAppointmentReminder } from "./standard.intents/appointment.reminder.listener";

///////////////////////////////////////////////////////////////////////////////////////////

export class IntentRegister {

    public static register = async (): Promise<void> => {

        // Add intents here...
        IntentEmitter.registerListener('Appointment_Reminder', handleAppointmentReminder);

    };

}

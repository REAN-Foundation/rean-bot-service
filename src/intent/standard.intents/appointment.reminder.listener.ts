/* eslint-disable @typescript-eslint/no-unused-vars */
import { logger } from "../../logger/logger";
import { Intent } from "../intent.emitter";
// import { AppointmentReminderService } from "../../../services/reminder/appointment.reminder.service";

///////////////////////////////////////////////////////////////////////////////////////////

export const handleAppointmentReminder = async (intent: Intent, eventObj: any) => {

    // const appointmentReminderService: AppointmentReminderService =
    //     eventObj.container.resolve(AppointmentReminderService);
    try {
        const result = null;
        //result = await appointmentReminderService.createReminder(eventObj);
        logger.info(result);
        return result.message;
    } catch (error) {
        logger.info(error);
    }
};

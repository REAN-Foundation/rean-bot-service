import { EmailDetails } from "../email.details";
import { IEmailService } from "../email.service.interface";

export class SendGridEmailService implements IEmailService {

    public async sendEmail(email: EmailDetails): Promise<boolean> {
        return true;
    }

}

import { PersonRole } from "../../types/domain.models/user.domain.models";
import { getPersonRoles } from "./api.access/types";

export class CoreTypesStore {

    private static _personRoles: PersonRole[] = [];

    public static async getPersonRoles(): Promise<PersonRole[]> {
        if (this._personRoles.length === 0) {
            await this.update();
        }
        return this._personRoles;
    }

    public static update = async () => {
        const personRoles = await getPersonRoles();
        this._personRoles = personRoles;
    };

}

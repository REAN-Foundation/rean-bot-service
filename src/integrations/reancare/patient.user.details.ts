
import { get_ } from "./common";

//////////////////////////////////////////////////////////////////////////////////////

const REAN_BACKEND_API_URL = process.env.REAN_BACKEND_API_URL;

//////////////////////////////////////////////////////////////////////////////////////

export const getUserById = async (sessionId: string, userId: string) => {
    const url = REAN_BACKEND_API_URL + `/patients/${userId}`;
    return await get_(sessionId, url);
};

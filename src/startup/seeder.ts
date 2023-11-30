import { logger } from '../logger/logger';
import { FileUtils } from '../common/utilities/file.utils';

//////////////////////////////////////////////////////////////////////////////

export class Seeder {

    public static seed = async (): Promise<void> => {
        try {
            await createTempFolders();
        } catch (error) {
            logger.error(error.message);
        }
    };

}

//////////////////////////////////////////////////////////////////////////////

const createTempFolders = async () => {
    await FileUtils.createTempDownloadFolder();
    await FileUtils.createTempUploadFolder();
};

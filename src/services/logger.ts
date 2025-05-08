import { format } from 'date-fns'

import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'

const log = async (log: string) => {
    const datetime = `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`

    const logItem = `${datetime}\t${log}\n`;

    console.log(logItem);

    try {
        if (!fs.existsSync(path.join(__dirname, '../logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '../logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, '../logs', 'server.log'), logItem);
    } catch (error) {
        console.log(error);
    }
}

export default log
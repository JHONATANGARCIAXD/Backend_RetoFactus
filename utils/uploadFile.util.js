import { v4 as uuidv4 } from 'uuid';
import path from 'path'
import url from 'url'


const uploadFile = async (files, validExtensions = ['png', 'jpg', 'jpeg']) => {
    try {
        let filesArrived = files.file;
        const isArray = Array.isArray(filesArrived);
        if (!isArray) filesArrived = [filesArrived];

        const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
        const savedNames = [];

        for (const file of filesArrived) {
            const splitName = file.name.split('.');
            const extension = splitName[splitName.length - 1]

            if (!validExtensions.includes(extension)) {
                return { ok: false, msg: `La extensión .${extension} no es permitida - ${validExtensions}` };
            }

            const tempName = `${uuidv4()}.${extension}`;
            const uploadPath = path.join(__dirname, '../uploads/', tempName);

            await new Promise((resolve, reject) => {
                file.mv(uploadPath, (err) => {
                    if (err) reject(err);
                    else resolve( savedNames.push(tempName));
                });
            });

        }

        return savedNames;

    } catch (error) {
        console.log(error);
        return { ok: false, msg: "Hubo un error al subir el archivo" };
    }
}

export { uploadFile }
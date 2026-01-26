import { v2 as cloudinary } from 'cloudinary'
import fs from "fs";
import path from "path";
import url from "url";
import 'dotenv/config'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const cloudinaryService = {}

cloudinaryService.uploadFiles = async (nameFiles) => {
    try {
        const pathCloudinary = []

        for (const fileName of nameFiles) {
            const filePath = path.join(__dirname, "../uploads/", fileName);
            const result = await cloudinary.uploader.upload(filePath, {
                folder: '/products'
            })
            pathCloudinary.push(result)

            fs.unlinkSync(filePath)
        }

        return { ok: true, pathCloudinary }
    }

    catch (error) {
        console.log(error)
        return { ok: false, msg: "Ha ocurrido un error al subir los archivos" }
    }
}


cloudinaryService.deleteFiles = async (publicIds) => {
    try {
        for (const publicId of publicIds) {
            await cloudinary.uploader.destroy(publicId)
        }

        return {ok: true}
    }
    catch(error) {
        return { ok: false, msg: "Error al eliminar"}
    }
}

export { cloudinaryService }
import axios from 'axios';

const unitsOfMeasurementCtrl = {};

unitsOfMeasurementCtrl.getUnitsOfMeasurement = async (req, res) => {
    try {
        let user = req.user;
        const units = await axios.get('https://api-sandbox.factus.com.co/v1/measurement-units', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            }
        });

        res.status(200).json({ msg: units.data.data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

export { unitsOfMeasurementCtrl };
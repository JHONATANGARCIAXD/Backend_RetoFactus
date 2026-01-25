import axios from "axios"


const municipalitiesCtrl = {}

municipalitiesCtrl.getMunicipalities = async (req, res) => {
    try {
        const { search } = req.query
        const user = req.user

        const response = await axios.get(`https://api-sandbox.factus.com.co/v1/municipalities?name=${search ? search : ''}`, {
            headers: {
                Authorization: `Bearer ${user.access_token}`,
                Accept: "application/json"
            }
        })

        res.status(200).json({ msg: response.data.data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}


export { municipalitiesCtrl }
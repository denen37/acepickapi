import config from '../config/configSetup';
const axios = require("axios");




export const sendExpoNotification = async (token: string, body: string) => {
    const response = await axios.post(
        // `https://exp.host/--/api/v2/push/send?useFcmV1=true`,
        `https://api.expo.dev/v2/push/send?useFcmV1=true`,
        {
            "to": token,
            "sound": "default",
            "body": body,
        },
        {
            headers: {
                "accept": "application/json",
            }
        }
    );

    if (response.status <= 300) {
        console.log(response.data)
        return {
            status: true,
            message: response.data,
        }
    } else {
        console.log(response.data)
        return {
            status: false,
            message: response.data,
        };
    }
}

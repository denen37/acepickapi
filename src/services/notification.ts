import axios from 'axios';

export async function sendPushNotification(expoPushToken: string, title: string, message: string, data: any) {
    try {
        const response = await axios.post('https://exp.host/--/api/v2/push/send', {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: message,
            data: data,
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

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

    } catch (error: any) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
    }
}


const axios = require("axios");
import config from '../config/configSetup';




export const verifyBvn = async (bvn: string) => {
    try {
        const response = await axios.post(

            `https://api.verified.africa/sfx-verify/v3/id-service`,

            {
                "searchParameter": `${bvn}`,
                "verificationType": `BVN-FULL-DETAILS`
            },
            {
                headers: {
                    // 'Content-Type': ['application/json', 'application/json'],
                    "userId": "1697240975456",
                    "apiKey": "5yWB46Erlhdvb8vPGaPr",
                }
            }
        );

        if (response.status <= 300) {
            return {
                status: true,
                message: response.data,
            }
        } else {
            return {
                status: false,
                message: response.data,
            };
        }
    } catch (e) {
        return {
            status: false,
            message: { verificationStatus: "NOT VERIFIED", description: "Error processing bvn" },
        };
    }
}





export const verifyTransaction = async (reference: String) => {
    const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,

        {
            headers: {
                "Authorization": `Bearer ${config.PAYSTACK_SECRET},`
                // "accept": "application/json",
                // 'Content-Type': ['application/json', 'application/json']
            }
        }
    );

    if (response.status <= 300) {
        return {
            status: true,
            message: response.data,
        }
    } else {
        return {
            status: false,
            message: response.data,
        };
    }
}

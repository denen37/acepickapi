import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { errorResponse, handleResponse, successResponse, randomId } from "../utils/modules";
import { Accounts, JobStatus, OrderMethod, OrderStatus, PayStatus, ProductTransactionStatus, TransactionType } from "../utils/enum";
import { v4 as uuidv4 } from 'uuid';
import { paymentSchema, pinForgotSchema, pinResetSchema, productPaymentSchema } from "../validation/body";
import { Job, Wallet, Transaction, User, Profile, ProductTransaction, Product, Order } from "../models/Models";
import { randomUUID } from "crypto";
import { jobPaymentEmail, productPaymentEmail } from "../utils/messages";
import { sendEmail } from "../services/gmail";
import { sendPushNotification } from "../services/notification";
import z from "zod";
import { LedgerService } from "../services/ledgerService";

export const createWallet = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { currency = 'NGN' } = req.body;

    try {
        const wallet = await Wallet.create({
            userId: id,
            currency: currency,
            currentBalance: 0,
            previousBalance: 0
        });

        wallet.setDataValue('isActive', wallet.pin !== null)

        return successResponse(res, "success", wallet);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}

export const viewWallet = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
        const wallet = await Wallet.findOne({
            where: { userId: id },
            attributes: {
                exclude: ['pin']
            },
        });

        if (!wallet) {
            return handleResponse(res, 404, false, "Wallet not found");
        }

        wallet.setDataValue('isActive', wallet.pin !== null)

        return successResponse(res, "success", wallet);
    } catch (error) {
        return errorResponse(res, "An error occurred", error);
    }
}

export const debitWallet = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    // Usage example
    const result = paymentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    const { amount, pin, reason, jobId } = result.data;


    const job = await Job.findByPk(jobId, {
        include: [
            {
                model: User,
                as: 'client',
                include: [Profile]
            },
            {
                model: User,
                as: 'professional',
                include: [Profile]
            }
        ]
    });


    if (!job) {
        return handleResponse(res, 404, false, 'Job not found');
    }

    if (job.payStatus === PayStatus.PAID) {
        return handleResponse(res, 400, false, 'Job has already been paid for')
    }

    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        if (!wallet.pin) {
            return handleResponse(res, 400, false, 'Pin not set')
        }

        const match = await bcrypt.compare(pin, wallet.pin);

        if (!match) {
            return handleResponse(res, 400, false, 'Incorrect pin')
        }

        let prevBalance = Number(wallet.currentBalance);

        //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);

        if (prevBalance < amount) {
            return handleResponse(res, 400, false, 'Insufficient balance')
        }

        let currBalance = prevBalance - amount;

        await wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });

        await wallet.save();


        job.payStatus = PayStatus.PAID;

        job.paymentRef = randomId(12);

        job.status = JobStatus.ONGOING;

        await job.save();

        job.client.profile.totalJobsOngoing = Number(job.client.profile.totalJobsOngoing || 0) + 1;

        job.professional.profile.totalJobsOngoing = Number(job.professional.profile.totalJobsOngoing || 0) + 1;

        await job.client.profile.save();

        await job.professional.profile.save();


        const transaction = await Transaction.create({
            userId: id,
            jobId: jobId || null,
            amount: amount,
            reference: job.paymentRef,
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            description: 'job wallet payment',
            type: TransactionType.DEBIT,
        })

        await LedgerService.createEntry([
            {
                transactionId: transaction.id,
                userId: transaction.userId,
                amount: transaction.amount,
                type: TransactionType.DEBIT,
                account: Accounts.USER_WALLET
            },

            {
                transactionId: transaction.id,
                userId: null,
                amount: transaction.amount,
                type: TransactionType.CREDIT,
                account: Accounts.PLATFORM_ESCROW
            }
        ])

        const emailTosend = jobPaymentEmail(job);

        const msgStat = await sendEmail(
            job.dataValues.professional.email,
            emailTosend.title,
            emailTosend.body,
            job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
            //'User'
        )

        //Send notification to the client
        if (job.dataValues.professional.fcmToken) {
            await sendPushNotification(
                job.dataValues.professional.fcmToken,
                'Job Payment',
                `Your Job: ${job.dataValues.title} has been paid}`,
                {}
            );
        }


        return successResponse(res, 'success', transaction)

    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}

export const debitWalletForProductOrder = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    // Usage example
    const result = productPaymentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    const { amount, pin, reason, productTransactionId } = result.data;


    const productTransaction = await ProductTransaction.findByPk(productTransactionId, {
        include: [
            {
                model: User,
                as: 'buyer',
                include: [Profile]
            },
            {
                model: User,
                as: 'seller',
                include: [Profile]
            },
            {
                model: Product
            },
            {
                model: Order,
            }
        ]
    });

    if (!productTransaction) {
        return handleResponse(res, 404, false, 'Product transaction not found');
    }

    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        if (!wallet.pin) {
            return handleResponse(res, 400, false, 'Pin not set')
        }

        const match = await bcrypt.compare(pin, wallet.pin);

        if (!match) {
            return handleResponse(res, 400, false, 'Incorrect pin')
        }

        let prevBalance = Number(wallet.currentBalance);

        //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);

        if (prevBalance < amount) {
            return handleResponse(res, 400, false, 'Insufficient balance')
        }

        let desc;
        let isProductOrder = false;

        if (productTransaction.order && productTransaction.orderMethod !== OrderMethod.SELF_PICKUP) {
            const productAndOrderCost = Number(productTransaction.order.cost) + Number(productTransaction.price)

            if (amount < productAndOrderCost) {
                return handleResponse(res, 404, false, 'Insufficient amount for order and product')
            }

            desc = 'product_order wallet payment'

            isProductOrder = true
        } else {
            if (amount < productTransaction.price) {
                return handleResponse(res, 404, false, 'Insufficient amount for product')
            }

            desc = 'product wallet payment'
        }

        let currBalance = prevBalance - amount;

        await wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });

        await wallet.save();

        if (isProductOrder) {
            productTransaction.status = ProductTransactionStatus.ORDERED;

            productTransaction.order.status = OrderStatus.PAID;

            await productTransaction.save();

            await productTransaction.order.save();
        } else {
            productTransaction.status = ProductTransactionStatus.ORDERED;

            await productTransaction.save();
        }

        const transaction = await Transaction.create({
            userId: id,
            jobId: null,
            amount: amount,
            reference: randomId(12),
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            productTransactionId,
            description: desc,
            type: TransactionType.DEBIT,
        })

        await LedgerService.createEntry([
            {
                transactionId: transaction.id,
                userId: transaction.userId,
                amount: transaction.amount,
                type: TransactionType.DEBIT,
                account: Accounts.USER_WALLET
            },

            {
                transactionId: transaction.id,
                userId: null,
                amount: transaction.amount,
                type: TransactionType.CREDIT,
                account: Accounts.PLATFORM_ESCROW
            }
        ])


        const email = productPaymentEmail(productTransaction);

        const msgStat = await sendEmail(
            productTransaction.seller.email,
            email.title,
            email.body,
            productTransaction.seller.profile.firstName + ' ' + productTransaction.seller.profile.lastName,
        )

        //Send notification to the client
        sendPushNotification(
            productTransaction.seller.fcmToken,
            `Product Payment`,
            `${productTransaction?.quantity} of your product: ${productTransaction?.product.name} has been paid by ${productTransaction?.buyer.profile.firstName} ${productTransaction?.buyer.profile.lastName}`,
            {}
        );



        return successResponse(res, 'success', transaction)

    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}

// export const debitWalletForProductOrder = async (req: Request, res: Response) => {
//     const { id, role } = req.user;

//     // Usage example
//     const result = productPaymentSchema.safeParse(req.body);

//     if (!result.success) {
//         return res.status(400).json({ errors: result.error.format() });
//     }

//     const { amount, pin, reason, productTransactionId } = result.data;


//     const productTransaction = await ProductTransaction.findByPk(productTransactionId, {
//         include: [
//             {
//                 model: User,
//                 as: 'buyer',
//                 include: [Profile]
//             },
//             {
//                 model: User,
//                 as: 'seller',
//                 include: [Profile]
//             },
//             {
//                 model: Product
//             }
//         ]
//     });

//     if (!productTransaction) {
//         return handleResponse(res, 404, false, 'Product transaction not found');
//     }

//     try {
//         const wallet = await Wallet.findOne({ where: { userId: id } });

//         if (!wallet) {
//             return handleResponse(res, 404, false, 'Wallet not found')
//         }

//         if (!wallet.pin) {
//             return handleResponse(res, 400, false, 'Pin not set')
//         }

//         const match = await bcrypt.compare(pin, wallet.pin);

//         if (!match) {
//             return handleResponse(res, 400, false, 'Incorrect pin')
//         }

//         let prevBalance = Number(wallet.currentBalance);

//         //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);

//         if (prevBalance < amount) {
//             return handleResponse(res, 400, false, 'Insufficient balance')
//         }

//         let currBalance = prevBalance - amount;

//         await wallet.update({
//             currentBalance: currBalance,
//             previousBalance: prevBalance
//         });

//         await wallet.save();

//         const transaction = await Transaction.create({
//             userId: id,
//             jobId: null,
//             amount: amount,
//             reference: randomId(12),
//             status: 'success',
//             channel: 'wallet',
//             timestamp: Date.now(),
//             productTransactionId,
//             description: reason || 'Wallet payment',
//             type: TransactionType.DEBIT,
//         })

//         const email = productPaymentEmail(productTransaction);

//         const msgStat = await sendEmail(
//             productTransaction.seller.email,
//             email.title,
//             email.body,
//             productTransaction.seller.profile.firstName + ' ' + productTransaction.seller.profile.lastName,
//         )

//         //Send notification to the client
//         sendPushNotification(
//             productTransaction.seller.fcmToken,
//             `Product Payment`,
//             `${productTransaction?.quantity} of your product: ${productTransaction?.product.name} has been paid by ${productTransaction?.buyer.profile.firstName} ${productTransaction?.buyer.profile.lastName}`,
//             {}
//         );



//         return successResponse(res, 'success', transaction)

//     } catch (error: any) {
//         return errorResponse(res, 'error', error.message)
//     }
// }

export const setPin = async (req: Request, res: Response) => {
    const { id, role } = req.user;


    const pinSchema = z.object({
        pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
    })

    const result = pinSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }


    const { pin } = result.data;


    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        // Hash pin
        const hashedPin = await bcrypt.hash(pin, 10);

        await wallet.update({ pin: hashedPin });

        await wallet.save();

        return successResponse(res, 'success', 'Pin set successfully')

    } catch (error) {
        return errorResponse(res, 'error', 'An error occurred')
    }
}


export const resetPin = async (req: Request, res: Response) => {
    const { id, role } = req.user;


    // Usage example
    const result = pinResetSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    const { newPin, oldPin } = result.data;

    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        // Check if old pin matches
        if (!wallet.pin) {
            return handleResponse(res, 400, false, 'Pin not set')
        }

        const isMatch = await bcrypt.compare(oldPin, wallet.pin);

        if (!isMatch) {
            return handleResponse(res, 400, false, 'Old pin does not match')
        }

        // Hash pin
        const hashedPin = await bcrypt.hash(newPin, 10);

        wallet.pin = hashedPin;

        await wallet.save();

        return successResponse(res, 'success', 'Pin reset successfully')
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const forgotPin = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    try {
        const result = pinForgotSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
        }

        const { newPin, newPinConfirm } = result.data;

        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        // Check if old pin matches
        if (!wallet.pin) {
            return handleResponse(res, 400, false, 'Pin not set')
        }

        const hashedPin = await bcrypt.hash(newPin, 10);

        wallet.pin = hashedPin;

        await wallet.save();

        return successResponse(res, 'success', 'Pin reset successfully')
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const creditWallet = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const { amount, userId } = req.body;

        const wallet = await Wallet.findOne({ where: { userId: userId ? userId : id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        wallet.previousBalance = Number(wallet.currentBalance);

        wallet.currentBalance = Number(wallet.currentBalance) + Number(amount);

        await wallet.save();

        return successResponse(res, 'success', { balance: wallet.currentBalance })
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}


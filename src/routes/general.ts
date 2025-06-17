import { Router } from "express";
import { createSector, deleteSector, getSectors, getSectorsMetrics, updateSector } from "../controllers/sector";
import { createProfession, deleteProfession, getProfessionById, getProfessions, updateProfession } from "../controllers/professions";
import { getProfessionalById, getProfessionals } from "../controllers/professionals";
import { getCooperates } from "../controllers/cooperates";
import { approveJob, cancelJob, completeJob, createJobOrder, disputeJob, generateInvoice, getJobById, getJobs, getLatestJob, respondToJob, updateInvoice, updateJob, viewInvoice } from "../controllers/Jobs";
import { UserRole } from "../utils/enum";
import { allowRoles } from "../middlewares/allowRoles";
import { findPersonsNearby, sendEmailTest, sendSMSTest, testNotification } from "../controllers/test";
import { updateLocation } from "../controllers/location";
import { getClient } from "../controllers/client";
import { addAccount, deleteAccount, getAccounts, getBanks, updateAccount } from "../controllers/account";
import { createWallet, creditWallet, debitWallet, forgotPin, resetPin, setPin, viewWallet } from "../controllers/wallet";
import { getAllTransactions, getTransactionById } from "../controllers/transactions";
import { initiatePayment, initiateTransfer, verifyPayment, verifyTransfer, completeTransfer } from "../controllers/payment";

const routes = Router();

routes.get("/sectors", getSectors);
routes.get("/sectors/details", getSectorsMetrics);
routes.post("/sectors", createSector);
routes.put("/sectors/:id", updateSector);
routes.delete("/sectors/:id", deleteSector);

routes.get("/clients/:id", allowRoles(UserRole.CLIENT, UserRole.PROFESSIONAL), getClient);

routes.get("/professions", getProfessions);
routes.get("/professions/:id", getProfessionById);
routes.post("/professions", createProfession);
routes.put("/professions/:id", updateProfession);
routes.delete("/professions/:id", deleteProfession);

routes.get("/professionals", getProfessionals);
routes.get('/professionals/:professionalId', getProfessionalById); // Allow any role to get professional by userId

routes.get("/cooperates", getCooperates);

routes.get('/jobs/latest', getLatestJob);
routes.get('/jobs', allowRoles(UserRole.CLIENT, UserRole.PROFESSIONAL), getJobs);
routes.get('/jobs/:id', allowRoles('*'), getJobById);
routes.post('/jobs', allowRoles(UserRole.CLIENT), createJobOrder);

routes.put('/jobs/response/:jobId', allowRoles(UserRole.PROFESSIONAL), respondToJob);
routes.post('/jobs/invoice', allowRoles(UserRole.PROFESSIONAL), generateInvoice);
routes.put('/jobs/invoice/:jobId', allowRoles(UserRole.PROFESSIONAL), updateInvoice);
routes.get('/jobs/invoice/:jobId', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), viewInvoice);
//routes.post('/jobs/payment', allowRoles(UserRole.CLIENT), payforJob);
routes.post('/jobs/complete/:jobId', allowRoles(UserRole.PROFESSIONAL), completeJob);
routes.post('/jobs/approve/:jobId', allowRoles(UserRole.CLIENT), approveJob);
routes.post('/jobs/dispute/:jobId', allowRoles(UserRole.CLIENT), disputeJob);
routes.post('/jobs/cancel/:jobId', allowRoles(UserRole.CLIENT), cancelJob);
routes.put('jobs/update/:jobId', allowRoles(UserRole.CLIENT), updateJob);

routes.post('/notification-test', testNotification);
routes.post('/send-sms', sendSMSTest);
routes.post('/send-email', sendEmailTest);
routes.post('/nearest-person', findPersonsNearby);

routes.put('/location', updateLocation);


routes.get('/accounts/banks', allowRoles(UserRole.PROFESSIONAL), getBanks);
routes.post('/accounts', allowRoles(UserRole.PROFESSIONAL), addAccount);
routes.get('/accounts', allowRoles(UserRole.PROFESSIONAL), getAccounts);
routes.put('/accounts/:recipientCode', allowRoles(UserRole.PROFESSIONAL), updateAccount);
routes.delete('/accounts/:recipientCode', allowRoles(UserRole.PROFESSIONAL), deleteAccount);

routes.post('/create-wallet', /*allowRoles(UserRole.SEEKER),*/ createWallet);
routes.get('/view-wallet', /*allowRoles(UserRole.SEEKER),*/ viewWallet);
routes.post('/debit-wallet', /*allowRoles(UserRole.SEEKER),*/ debitWallet);
routes.post('/credit-wallet', /*allowRoles(UserRole.SEEKER),*/ creditWallet);
routes.post('/set-pin', /*allowRoles(UserRole.SEEKER),*/ setPin);
routes.post('/reset-pin', resetPin);
routes.post('/forgot-pin', forgotPin);

routes.get('/transactions', /*allowRoles(UserRole.SEEKER, UserRole.PROVIDER),*/ getAllTransactions);
routes.get('/transactions/:id', /*allowRoles(UserRole.SEEKER, UserRole.PROVIDER),*/ getTransactionById);


routes.post('/payments/initiate', /*allowRoles(UserRole.SEEKER),*/ initiatePayment);
routes.post('/payments/verify/:ref', /*allowRoles(UserRole.SEEKER),*/ verifyPayment);
routes.post('/transfer/initiate', /*allowRoles(UserRole.PROVIDER),*/ initiateTransfer);
routes.post('/transfer/verify/:ref', verifyTransfer)
routes.post('/transfer/paystack/webhook', completeTransfer)


export default routes;
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
import { addAccount, deleteAccount, getAccounts, getBanks, resolveAccount, updateAccount } from "../controllers/account";
import { createWallet, creditWallet, debitWallet, forgotPin, resetPin, setPin, viewWallet } from "../controllers/wallet";
import { getAllTransactions, getTransactionById } from "../controllers/transactions";
import { initiatePayment, initiateTransfer, finalizeTransfer, verifyPayment, verifyTransfer, handlePaystackWebhook } from "../controllers/payment";
import { addEducation, deleteEducation, getEducation, updateEducation } from "../controllers/education";
import { addCertificate, deleteCertificate, getCertificates, updateCertificate } from "../controllers/certification";
import { addExperience, deleteExperience, getExperiences, updateExperience } from "../controllers/experience";
import { addPortfolio, deletePortfolio, getPortfolios, updatePortfolio } from "../controllers/portfolio";
import { AccountInfo, updateProfile } from "../controllers/profiles";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product";
import { addCategory, deleteCategory, getCategories, updateCategory } from "../controllers/category";
import { uploads } from "../services/upload";
import { uploadFiles } from "../controllers/upload";

const routes = Router();

routes.get("/sectors", getSectors);
routes.get("/sectors/details", getSectorsMetrics);
routes.post("/sectors", createSector);
routes.put("/sectors/:id", updateSector);
routes.delete("/sectors/:id", deleteSector);

routes.get("/clients/:id", allowRoles(UserRole.CLIENT, UserRole.PROFESSIONAL), getClient);

routes.get('/profile', AccountInfo);
routes.post('/profile', updateProfile);

routes.get("/education", getEducation);
routes.post("/education", addEducation);
routes.put("/education/:id", updateEducation);
routes.delete("/education/:id", deleteEducation);

routes.get("/certificates", getCertificates);
routes.post("/certificates", addCertificate);
routes.put("/certificates/:id", updateCertificate);
routes.delete("/certificates/:id", deleteCertificate);

routes.get("/experiences", getExperiences);
routes.post("/experiences", addExperience);
routes.put("/experiences/:id", updateExperience);
routes.delete("/experiences/:id", deleteExperience);

routes.get("/portfolios", getPortfolios);
routes.post("/portfolios", addPortfolio);
routes.put("/portfolios/:id", updatePortfolio);
routes.delete("/portfolios/:id", deletePortfolio);

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


routes.get('/accounts/banks', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), getBanks);
routes.post('/accounts', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), addAccount);
routes.get('/accounts', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), getAccounts);
routes.post('/accounts/resolve', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), resolveAccount)
routes.put('/accounts/:recipientCode', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), updateAccount);
routes.delete('/accounts/:recipientCode', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), deleteAccount);

routes.post('/create-wallet', /*allowRoles(UserRole.SEEKER),*/ createWallet);
routes.get('/view-wallet', /*allowRoles(UserRole.SEEKER),*/ viewWallet);
routes.post('/debit-wallet', /*allowRoles(UserRole.SEEKER),*/ debitWallet);
routes.post('/credit-wallet', /*allowRoles(UserRole.SEEKER),*/ creditWallet);
routes.post('/set-pin', /*allowRoles(UserRole.SEEKER),*/ setPin);
routes.post('/reset-pin', resetPin);
routes.post('/forgot-pin', forgotPin);

routes.get('/transactions', /*allowRoles(UserRole.SEEKER, UserRole.PROVIDER),*/ getAllTransactions);
routes.get('/transactions/:id', /*allowRoles(UserRole.SEEKER, UserRole.PROVIDER),*/ getTransactionById);

routes.post('/paystack/webhook', handlePaystackWebhook);
routes.post('/payments/initiate', /*allowRoles(UserRole.SEEKER),*/ initiatePayment);
routes.post('/payments/verify/:ref', /*allowRoles(UserRole.SEEKER),*/ verifyPayment);
routes.post('/transfer/initiate', /*allowRoles(UserRole.PROVIDER),*/ initiateTransfer);
routes.post('/transfer/finalize', finalizeTransfer);
routes.post('/transfer/verify/:ref', verifyTransfer);

routes.post('/products/upload', uploads.array('product', 5), uploadFiles);
routes.get('/products', getProducts);
routes.post('/products', addProduct);
routes.put('/products/:id', updateProduct);
routes.delete('/products/:id', deleteProduct);

routes.get('/categories', getCategories);
routes.post('/categories', addCategory);
routes.put('/categories/:id', updateCategory);
routes.delete('/categories/:id', deleteCategory);



export default routes;
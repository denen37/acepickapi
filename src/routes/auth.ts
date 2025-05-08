// Import packages
import { Router } from 'express';
import {/* ProfAccountInfo, accountInfo, accountSingleInfo,*/ authorize, changePassword, corperateReg, deleteUsers, login, passwordChange, register, registerStepThree, registerStepTwo, sendOtp, swithAccount, updateFcmToken, /*updateProfessional*/ updateProfile, upload_avatar, /*verifyBvnDetail,*/ verifyMyBvn, verifyOtp } from '../controllers/auth';
import { uploads } from '../services/upload';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/send-otp', sendOtp);
// routes.get('/profile', accountInfo);
routes.get('/switch', swithAccount);
// routes.get('/profile/:id', accountSingleInfo)
routes.post('/update-profile', updateProfile);
// routes.post('/update-professional', updateProfessional);
// routes.post('/corperate', ProfAccountInfo);
routes.post('/register', register);
routes.post('/upload_avatar', uploads.single('avatar'), upload_avatar);
routes.post('/register-steptwo', registerStepTwo);
routes.post('/register-stepthree', registerStepThree);
routes.post('/corperate-register', corperateReg);
routes.post('/login', login);
routes.post('/change-password-loggedin', passwordChange);
routes.post('/change-password-forgot', changePassword);
routes.post('/verify-otp', verifyOtp);
routes.post('/update-fcm-token', updateFcmToken)
// routes.post("/verify-bvn", verifyBvnDetail)
routes.post("/verify-bvn2", verifyMyBvn);
routes.get("/delete-users", deleteUsers)
routes.post('/verify-token', authorize)
// routes.get("/createCat", createCat)


export default routes;

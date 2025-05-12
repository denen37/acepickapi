// Import packages
import { Router } from 'express';
import {
    authorize,
    changePassword,
    deleteUsers,
    login,
    passwordChange,
    register,
    registerCorperate,
    sendOtp,
    sendSMSTest,
    swithAccount,
    updateFcmToken,
    updateProfile,
    verifyMyBvn,
    verifyOtp
} from '../controllers/auth';
import { uploads } from '../services/upload';
import { uploadAvatar } from '../controllers/upload';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/switch', swithAccount);
routes.post('/update-profile', updateProfile);
routes.post('/register', register);
routes.post('/register-corperate', registerCorperate);
routes.post('/upload_avatar', uploads.single('avatar'), uploadAvatar);
routes.post('/login', login);
routes.post('/change-password-loggedin', passwordChange);
routes.post('/change-password-forgot', changePassword);
routes.post('/send-otp', sendOtp);
routes.post('/verify-otp', verifyOtp);
routes.post('/update-fcm-token', updateFcmToken)
// routes.post("/verify-bvn", verifyBvnDetail)
routes.post("/verify-bvn2", verifyMyBvn);
routes.get("/delete-users", deleteUsers)
routes.post('/verify-token', authorize)
routes.post('/send-sms', sendSMSTest)


export default routes;

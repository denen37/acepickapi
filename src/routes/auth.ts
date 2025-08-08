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
    registerProfessional,
    registerRider,
    sendOtp,
    // swithAccount,
    updateProfile,
    updatePushToken,
    updateRider,
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
// routes.get('/switch', swithAccount);
routes.post('/update-profile', updateProfile);
routes.post('/register', register);
routes.post('/register-professional', registerProfessional);
routes.post('/register-corperate', registerCorperate);
routes.post('/register-rider', registerRider);
routes.put('/update-rider', updateRider);
routes.post('/upload_avatar', uploads.single('avatar'), uploadAvatar);
routes.post('/login', login);
routes.post('/change-password-loggedin', passwordChange);
routes.post('/change-password-forgot', changePassword);
routes.post('/send-otp', sendOtp);
routes.post('/verify-otp', verifyOtp);
routes.post('/update-push-token', updatePushToken)
// routes.post("/verify-bvn", verifyBvnDetail)
routes.post("/verify-bvn2", verifyMyBvn);
routes.get("/delete-users", deleteUsers)
routes.post('/verify-token', authorize)


export default routes;

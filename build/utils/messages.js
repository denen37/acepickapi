"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobDisputeEmail = exports.jobResponseEmail = exports.jobCreatedEmail = exports.forgotPasswordEmail = exports.sendOTPEmail = exports.sendOTPPhone = exports.registerEmail = void 0;
const registerEmail = (user) => {
    var _a, _b;
    return {
        title: "Welcome to Acepick",
        body: `Welcome on board ${(_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName} ${(_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName},
        <br><br> 
        we are pleased to have you on Acepick, 
        please validate your account by providing your BVN 
        to get accessible to all features on Acepick.<br><br> Thanks.`
    };
};
exports.registerEmail = registerEmail;
const sendOTPPhone = (code) => {
    return {
        title: "Acepick OTP",
        body: `Your OTP code is ${code}.`
    };
};
exports.sendOTPPhone = sendOTPPhone;
const sendOTPEmail = (code) => {
    return {
        title: "Email Verification",
        body: `Dear User,<br><br>
          
            Thank you for choosing our service. To complete your registration
             and ensure the security of your account,
              please use the verification code below
              <br><br>
            
             Verification Code: ${code}
            <br><br>
            
            Please enter this code on our website/app to
             proceed with your registration process. 
             If you did not initiate this action, 
             please ignore this email.<br><br>`
    };
};
exports.sendOTPEmail = sendOTPEmail;
const forgotPasswordEmail = (code) => {
    return {
        title: "Reset Password",
        body: `Dear User,<br><br>

            We have received a request to reset your password. 
            If you did not make this request, please ignore this email.
             Otherwise, please use the verification code below to reset your password.
             <br><br>

             Verification Code: ${code}
            <br><br>

            Please enter this code on our website/app to
             proceed with the password reset process. 
             If you did not initiate this action, 
             please ignore this email.<br><br>`
    };
};
exports.forgotPasswordEmail = forgotPasswordEmail;
const jobCreatedEmail = (job) => {
    console.log('fullName', `${job.client.profile.firstName} ${job.client.profile.lastName}`);
    return {
        title: `Job created: ${job.title}`,
        body: `You have a new job from ${job.client.profile.firstName} ${job.client.profile.lastName}
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>

        Log into your account to accept or decline the job offer.
        `
    };
};
exports.jobCreatedEmail = jobCreatedEmail;
const jobResponseEmail = (job) => {
    const response = job.accepted ? "accepted" : "declined";
    return {
        title: `Job ${response}: ${job.title}`,
        body: `Your job offer has been ${response} by ${job.professional.profile.firstName} ${job.professional.profile.lastName}
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>
        `
    };
};
exports.jobResponseEmail = jobResponseEmail;
const jobDisputeEmail = (job, dispute) => {
    return {
        title: `Job dispute: ${job.title}`,
        body: `A dispute has been raised for job ${job.title} by ${job.professional.profile.firstName} ${job.professional.profile.lastName}
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>
        <p><b>Dispute reason: </b>${dispute.reason}</p>
        <p><b>Dispute description: </b>${dispute.description}</p>
        `
    };
};
exports.jobDisputeEmail = jobDisputeEmail;

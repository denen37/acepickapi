"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveProductEmail = exports.reactivateUserEmail = exports.suspendUserEmail = exports.jobCancelledEmail = exports.productPaymentEmail = exports.jobPaymentEmail = exports.disputedJobEmail = exports.approveJobEmail = exports.completeJobEmail = exports.invoiceUpdatedEmail = exports.invoiceGeneratedEmail = exports.jobDisputeEmail = exports.jobResponseEmail = exports.jobUpdatedEmail = exports.jobCreatedEmail = exports.forgotPasswordEmail = exports.sendOTPEmail = exports.sendOTPPhone = exports.registerEmail = void 0;
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
const jobUpdatedEmail = (job) => {
    return {
        title: `Job Updated`,
        body: `The job ${job.title} has updated by ${job.client.profile.firstName} ${job.client.profile.lastName}
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>

        Log into your account to accept or decline the job offer.
        `
    };
};
exports.jobUpdatedEmail = jobUpdatedEmail;
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
// export const jobPayment = (job: Job): Message => {
//     return {
//         title: `Job Payment`,
//         body: `Your has been paid by ${job.client.profile.firstName} ${job.client.profile.lastName}
//         <p><b>Job title: </b>${job.title}</p>
//         <p><b>Job description: </b>${job.description}</p>
//         <p><b>Job location: </b>${job.fullAddress}</p>
//         <br>
//         <br>
//         <p>Kindly proceed with the job</p>
//         `
//     }
// }
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
const invoiceGeneratedEmail = (job) => {
    var _a;
    return {
        title: `Invoice generated: ${job.title}`,
        body: `An invoice has been generated for job ${job.title} by ${job.professional.profile.firstName} ${job.professional.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>

        <p><b>Workmanship: </b>${job.workmanship}</p>
        <p><b>Cost of materials: </b>${(_a = job.materialsCost) !== null && _a !== void 0 ? _a : 'N/A'}</p>
        <p><b>Date: </b>${job.updatedAt}</p>
        <br>
        <p>Log into the platform to view full details</p>
        `
    };
};
exports.invoiceGeneratedEmail = invoiceGeneratedEmail;
const invoiceUpdatedEmail = (job) => {
    var _a;
    return {
        title: `Invoice updated: ${job.title}`,
        body: `An invoice has been updated for job ${job.title} by ${job.professional.profile.firstName} ${job.professional.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
                <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>

        <p><b>Workmanship: </b>${job.workmanship}</p>
        <p><b>Cost of materials: </b>${(_a = job.materialsCost) !== null && _a !== void 0 ? _a : 'N/A'}
        </p>
                    <p><b>Date: </b>${job.updatedAt}</p>
        <br>
        <p>Log into the platform to view full details</p>
        `
    };
};
exports.invoiceUpdatedEmail = invoiceUpdatedEmail;
const completeJobEmail = (job) => {
    return {
        title: `Job Completed`,
        body: `Your job ${job.title} has been completed by ${job.client.profile.firstName} ${job.client.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
                <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>

            `
    };
};
exports.completeJobEmail = completeJobEmail;
const approveJobEmail = (job) => {
    return {
        title: `Job Approved`,
        body: `Your job ${job.title} has been approved by ${job.professional.profile.firstName} ${job.professional.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>
            `
    };
};
exports.approveJobEmail = approveJobEmail;
const disputedJobEmail = (job, dispute) => {
    return {
        title: `Job Disputed`,
        body: `Your job ${job.title} has been disputed by ${job.client.profile.firstName} ${job.client.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}</p>

        <h3>Dispute</h3>
        <p><b>Dispute title: </b>${dispute.reason}</p>
        <p><b>Dispute description: </b>${dispute.description}</p>
            `
    };
};
exports.disputedJobEmail = disputedJobEmail;
const jobPaymentEmail = (job) => {
    return {
        title: `Job Payment`,
        body: `Your job ${job.title} has been paid by ${job.client.profile.firstName} ${job.client.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}
        `
    };
};
exports.jobPaymentEmail = jobPaymentEmail;
const productPaymentEmail = (productTrans) => {
    return {
        title: `Product Payment`,
        body: `Your Product - ${productTrans.product.name} has been paid by ${productTrans.buyer.profile.firstName} ${productTrans.buyer.profile.lastName}
        <br>
        <h3>Summary</h3>
        <p><b>Product name: </b>${productTrans.product.name}</p>
        <p><b>Product description: </b>${productTrans.product.description}</p>
        <p><b>Price: </b>${productTrans.price}
        <p><b>Quantity: </b>${productTrans.quantity}</p>
        <p><b>Date: </b>${productTrans.date}
        `
    };
};
exports.productPaymentEmail = productPaymentEmail;
const jobCancelledEmail = (job) => {
    return {
        title: `Job Cancelled`,
        body: `Your job ${job.title} has been cancelled by ${job.client.profile.firstName} ${job.client.profile.lastName}
        <h3>Summary</h3>
        <p><b>Job title: </b>${job.title}</p>
        <p><b>Job description: </b>${job.description}</p>
        <p><b>Job location: </b>${job.fullAddress}
        `
    };
};
exports.jobCancelledEmail = jobCancelledEmail;
const suspendUserEmail = (user) => {
    return {
        title: `Account Suspended`,
        body: `Your account has been temporarily suspended by the admin due to violation of the terms and conditions
        of the platform. Please contact the admin for more information.
        `
    };
};
exports.suspendUserEmail = suspendUserEmail;
const reactivateUserEmail = (user) => {
    return {
        title: `Account Activated`,
        body: `Your account has been re-activated by the admin. You can now log in and start using the platform.
        `
    };
};
exports.reactivateUserEmail = reactivateUserEmail;
const approveProductEmail = (product) => {
    return {
        title: `Product Approved`,
        body: `Your product ${product.name} has been approved by the admin. It is now available for purchase.
        <h3>Summary</h3>
        <p><b>Product title: </b>${product.name}</p>
        <p><b>Product description: </b>${product.description}</p>
        <p><b>Product price: </b>${product.price}<b><p>
        `
    };
};
exports.approveProductEmail = approveProductEmail;

import { User } from "../models/Models"

interface Message {
    title: string,
    body: string
}

export const registerEmail = (user: User): Message => {
    return {
        title: "Welcome to Acepick",
        body: `Welcome on board ${user.profile?.firstName} ${user.profile?.lastName},
        <br><br> 
        we are pleased to have you on Acepick, 
        please validate your account by providing your BVN 
        to get accessible to all features on Acepick.<br><br> Thanks.`
    }
}

export const sendOTPPhone = (code: string): Message => {
    return {
        title: "Acepick OTP",
        body: `Your OTP code is ${code}.`
    }
}

export const sendOTPEmail = (code: string): Message => {
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
    }
}

export const forgotPasswordEmail = (code: string): Message => {
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
    }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateData = void 0;
const templateData = (body, username) => {
    return `
 <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style>
      /* Basic CSS Styling */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .email-header {
        text-align: center;
        padding: 0; /* No padding for the header */
      }
      .email-header img {
        width: 100%; /* Ensures the image takes up the full width of the container */
        height: auto; /* Maintains aspect ratio */
        border: 0;
        display: block; /* Removes any gap under the image */
      }
      .email-body {
        padding: 20px;
        color: #333333;
        line-height: 1.6;
      }
      .email-body h2 {
        font-size: 22px;
        margin-bottom: 20px;
        color: #32658a; /* Same as footer color for consistency */
      }
      .email-body p {
        margin-bottom: 20px;
      }
      .email-footer {
        background-color: #32658a;
        color: #ffffff;
        text-align: center;
        padding: 20px;
        font-size: 14px;
      }
      .email-footer p {
        margin: 0;
        color: #ffffff;
      }
      .email-footer a {
        color: #ffffff;
        text-decoration: underline;
      }
      .social-media {
        margin-top: 15px;
      }
      .social-media a {
        display: inline-block;
        margin: 0 10px;
      }
      .social-media img {
        width: 24px;
        height: 24px;
      }
      
      /* Responsive Design */
      @media only screen and (max-width: 600px) {
        .email-body h2 {
          font-size: 20px;
        }
        .email-body p {
          font-size: 16px;
        }
        .email-footer {
          font-size: 12px;
        }
        .social-media img {
          width: 20px;
          height: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header Section -->
 

      <!-- Body Section -->
      <div class="email-body">
        <h2>Hello ${username !== null && username !== void 0 ? username : "user"},</h2>
        ${body}
        <p>
          If you have any questions or need assistance, feel free to reply to this
          email or contact our support team.
        </p>
        <p>Thank you for joining us!</p>
        <p>
          Best regards,<br />
          The Acepick Team
        </p>
      </div>

      <!-- Footer Section -->
      <div class="email-footer">
        <p>
          © 2024 Acepick. All rights reserved.<br />
          <a href="https://opulentconnectionsapp.com/privacy-policy"
            >Privacy Policy</a
          > | <a href="https://opulentconnectionsapp.com/terms">Terms of Service</a>
        </p>

        <!-- Social Media Icons -->
        <div class="social-media">
          <a href="https://instagram.com" target="_blank">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
              alt="Instagram"
            />
          </a>
          <a href="https://linkedin.com" target="_blank">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
              alt="LinkedIn"
            />
          </a>
        </div>
      </div>
    </div>
  </body>
</html>

`;
};
exports.templateData = templateData;

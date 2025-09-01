export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Reset Your Password</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', Arial, sans-serif;
      background-color: #0f0f0f;
      color: #ffffff;
      line-height: 1.6;
    }
    
    table, td {
      border-collapse: collapse;
    }
    
    .email-container {
      width: 100%;
      background-color: #0f0f0f;
      padding: 20px 0;
    }
    
    .email-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #1a1a1a;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }
    
    .header {
      background-color: #ff0000;
      padding: 24px 40px;
      text-align: center;
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    
    .content {
      padding: 50px 40px;
    }
    
    .content p {
      margin: 0 0 24px 0;
      font-size: 16px;
      color: #e0e0e0;
      line-height: 1.6;
    }
    
    .otp-container {
      text-align: center;
      margin: 50px 0;
    }
    
    .otp-box {
      display: inline-block;
      background-color: #2a2a2a;
      border: 3px solid #ff0000;
      border-radius: 16px;
      padding: 50px 60px;
      margin: 30px 0;
      box-shadow: 0 6px 24px rgba(255, 0, 0, 0.3);
      position: relative;
      min-width: 350px;
    }
    
    .otp-code {
      font-size: 48px;
      font-weight: 700;
      color: #ff0000;
      letter-spacing: 8px;
      margin: 0;
      font-family: 'Courier New', monospace;
      user-select: all;
      cursor: pointer;
      display: block;
    }
    
    .otp-instruction {
      font-size: 16px;
      color: #b0b0b0;
      margin-top: 30px;
      font-weight: 500;
      line-height: 1.4;
    }
    
    .footer {
      background-color: #0a0a0a;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #333;
    }
    
    .footer p {
      margin: 0;
      font-size: 14px;
      color: #888;
      line-height: 1.4;
    }
    
    .highlight {
      color: #ff0000;
      font-weight: 500;
    }
    
    /* Mobile Responsiveness */
    @media only screen and (max-width: 640px) {
      .email-wrapper {
        margin: 0 10px;
        border-radius: 8px;
      }
      
      .header {
        padding: 20px 24px;
      }
      
      .header h1 {
        font-size: 20px;
      }
      
      .content {
        padding: 40px 24px;
      }
      
      .content p {
        font-size: 15px;
        margin: 0 0 20px 0;
      }
      
      .otp-container {
        margin: 40px 0;
      }
      
      .otp-box {
        padding: 40px 35px;
        margin: 24px 0;
        min-width: 280px;
      }
      
      .otp-code {
        font-size: 38px;
        letter-spacing: 6px;
      }
      
      .otp-instruction {
        font-size: 15px;
        margin-top: 25px;
      }
      
      .footer {
        padding: 20px 24px;
      }
    }
    
    @media only screen and (max-width: 480px) {
      .email-container {
        padding: 10px 0;
      }
      
      .email-wrapper {
        margin: 0 5px;
      }
      
      .header h1 {
        font-size: 18px;
      }
      
      .content {
        padding: 32px 20px;
      }
      
      .otp-container {
        margin: 32px 0;
      }
      
      .otp-box {
        padding: 35px 30px;
        min-width: 240px;
      }
      
      .otp-code {
        font-size: 32px;
        letter-spacing: 5px;
      }
      
      .otp-instruction {
        font-size: 14px;
        margin-top: 20px;
      }
    }
  </style>
</head>
<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" class="email-container">
    <tr>
      <td align="center" valign="top">
        <table class="email-wrapper" width="600" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td class="content">
              <p>We received a request to reset your password. If you made this request, use the <span class="highlight">One Time Password (OTP)</span> below to complete the process.</p>
              
              <!-- OTP Section -->
              <div class="otp-container">
                <div class="otp-box">
                  <div class="otp-code">{{otp}}</div>
                </div>
                <p class="otp-instruction">Copy and paste this code in the app to reset your password.</p>
              </div>
              
              <p style="font-size: 14px; color: #b0b0b0; margin-top: 32px;">
                This code will expire in <span class="highlight">5 minutes</span> for your security.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p>If you didn't request a password reset, you can ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
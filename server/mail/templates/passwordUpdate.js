exports.passwordUpdated = (email, name) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Update Confirmation | Syncra</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="YOUR_Syncra_WEBSITE_LINK"><img class="logo"
                    src="YOUR_GOSSIP_HUB_LOGO_URL" alt="Gossip Hub Logo"></a>
            
            <div class="message">Password Update Confirmation for **Syncra**</div>
            
            <div class="body">
                <p>Hey ${name},</p>
                <p>Your password has been successfully updated for your **Syncra** account associated with the email <span class="highlight">${email}</span>.
                </p>
                <p>If you did not initiate this password change, please contact us immediately to secure your account.</p>
                
                <p>You can securely log in to **Syncra** using your new password now.</p>
            </div>
            
            <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                at
                <a href="mailto:support@syncra.com">support@syncra.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
};
const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) =>{
    try{
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });

        let info =await transporter.sendMail({
            // --- MODIFICATION HERE ---
            from:'Gossip Hub - Chat Application', 
            // -------------------------
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        });
        console.log(info);
        return info;

    }
    catch(error){
        console.log(error.message);
        // It's usually better practice to re-throw the error 
        // so the calling function (like sendVerificationEmail) can handle it.
        throw error; 
    }
}

module.exports = mailSender;
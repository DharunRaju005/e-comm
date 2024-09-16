const nodemailer=require('nodemailer')
const dotenv=require('dotenv');
dotenv.config();


const transporter=nodemailer.createTransport({
    // service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
    port:587,
    host:'smtp.gmail.com',
    secure:false
});

const sendEmail=(to,subject,text,attachmentBuffer)=>{
    const mail={
        from:process.env.EMAIL_USER,
        to:to,
        subject:subject,
        text:text,
        attachments: [
            {
                filename: 'invoice.pdf',
                content:attachmentBuffer,
                contentType: 'application/pdf'
            },
        ]
    }
    return transporter.sendMail(mail);
}

module.exports={sendEmail}

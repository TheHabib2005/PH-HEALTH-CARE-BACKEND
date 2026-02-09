
import { AppError } from "./AppError";
import { mailTransport } from "./mailTransporter";

 async function sendMail(data:{email:string,name:string,token:string}) {
  try {
const mailOptions = {
    from: '"Skill-Bridge Team" <noreply@skill-bridge.com>',
    to: data.email,
    subject: 'Verify your Skill-Bridge Account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Hello ${data.name}, Welcome to Skill-Bridge!</h2>
        <p>Thanks for signing up. Please click the button below to verify your email address:</p>
        <a href="http://localhost:3000${data.token}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If the button doesn't work, copy and paste this link: <br>http://localhost:3000${data.token} </p>
      </div>
    `
  };

   const res = await mailTransport.sendMail(mailOptions);
    return res;
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to send mail", 400);
  }
};

export const mailServices = {sendMail}
const express = require('express');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

app.post('/api/send-emails', upload.single('attachment'), async (req, res) => {
  console.log('Received request to send emails');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  let emails, template;
  try {
    emails = JSON.parse(req.body.emails);
    template = JSON.parse(req.body.template);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const attachment = req.file;

  let sentCount = 0;
  let failedEmails = [];

  for (let email of emails) {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = template.subject;
    sendSmtpEmail.htmlContent = template.content;
    sendSmtpEmail.sender = { name: "Vishal Bhati", email: process.env.FROM_EMAIL };
    sendSmtpEmail.to = [{ email: email }];

    if (attachment) {
      sendSmtpEmail.attachment = [{
        content: fs.readFileSync(attachment.path).toString('base64'),
        name: attachment.originalname
      }];
    }

    try {
      console.log(`Attempting to send email to ${email}`);
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Email sent successfully to ${email}`, result);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error.response ? error.response.text : error);
      failedEmails.push(email);
    }
  }

  if (attachment) {
    fs.unlinkSync(attachment.path);
  }

  console.log(`Emails sent: ${sentCount}, Failed: ${failedEmails.length}`);
  res.json({ sentCount, failedEmails });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
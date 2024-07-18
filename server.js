// const express = require('express');
// const SibApiV3Sdk = require('sib-api-v3-sdk');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Configure multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// let defaultClient = SibApiV3Sdk.ApiClient.instance;
// let apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

// let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// app.post('/api/send-emails', upload.single('attachment'), async (req, res) => {
//   const { emails, template } = req.body;
//   const attachment = req.file;

//   let sentCount = 0;
//   let failedEmails = [];

//   for (let email of emails) {
//     let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

//     sendSmtpEmail.subject = template.subject;
//     sendSmtpEmail.htmlContent = template.content;
//     sendSmtpEmail.sender = { name: "Vishal Bhati", email: process.env.FROM_EMAIL };
//     sendSmtpEmail.to = [{ email: email }];

//     // Add attachment if present
//     if (attachment) {
//       sendSmtpEmail.attachment = [{
//         content: fs.readFileSync(attachment.path).toString('base64'),
//         name: attachment.originalname
//       }];
//     }

//     try {
//       await apiInstance.sendTransacEmail(sendSmtpEmail);
//       sentCount++;
//     } catch (error) {
//       console.error(`Failed to send email to ${email}:`, error);
//       failedEmails.push(email);
//     }
//   }

//   // Clean up the uploaded file
//   if (attachment) {
//     fs.unlinkSync(attachment.path);
//   }

//   res.json({ sentCount, failedEmails });
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

app.post('/api/send-emails', upload.single('attachment'), async (req, res) => {
  const emails = JSON.parse(req.body.emails);
  const template = JSON.parse(req.body.template);
  const attachment = req.file;

  let sentCount = 0;
  let failedEmails = [];

  for (let email of emails) {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = template.subject;
    sendSmtpEmail.htmlContent = template.content;
    sendSmtpEmail.sender = { name: "Vishal Bhati", email: process.env.FROM_EMAIL };
    sendSmtpEmail.to = [{ email: email }];

    // Add attachment if present
    if (attachment) {
      sendSmtpEmail.attachment = [{
        content: fs.readFileSync(attachment.path).toString('base64'),
        name: attachment.originalname
      }];
    }

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      failedEmails.push(email);
    }
  }

  // Clean up the uploaded file
  if (attachment) {
    fs.unlinkSync(attachment.path);
  }

  res.json({ sentCount, failedEmails });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
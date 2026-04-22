const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendBrevoEmail = async (subject, htmlContent, textContent, toEmail, toName = "", attachments = []) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;
  
  // Use configured sender or fallback to generic defaults
  sendSmtpEmail.sender = { 
      name: process.env.BREVO_SENDER_NAME || "Ghanshyam Ladies Tailor", 
      email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || "noreply@tailor.com"
  };
  
  sendSmtpEmail.to = [{ email: toEmail, name: toName || toEmail.split('@')[0] }];
  
  if (attachments && attachments.length > 0) {
    sendSmtpEmail.attachment = attachments;
  }

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to ${toEmail}. Message ID: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error(`Brevo Email Error to ${toEmail}:`, error.response ? error.response.text : error.message);
    throw error; // Rethrow to let the controller handle it if needed
  }
};

module.exports = { sendBrevoEmail };

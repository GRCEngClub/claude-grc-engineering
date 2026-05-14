/**
 * AWS Lambda function to handle contact form submissions via SES
 * This function is deployed to Lambda and exposed via API Gateway
 *
 * Required environment variables (no defaults — the function fails fast if
 * either is missing, so a misconfigured deploy cannot silently route mail
 * to an unintended inbox):
 *   - SES_FROM_EMAIL: verified SES sender identity
 *   - SES_TO_EMAIL:   recipient inbox for submissions
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const fromEmail = process.env.SES_FROM_EMAIL;
  const toEmail = process.env.SES_TO_EMAIL;
  if (!fromEmail || !toEmail) {
    console.error('Lambda misconfigured: SES_FROM_EMAIL and SES_TO_EMAIL must both be set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Service not configured' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { fullName, email, company, budget, message } = body;

    if (!fullName || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const emailSubject = `New contact form submission from ${fullName}`;
    const emailBody = `
New contact form submission:

Name: ${fullName}
Email: ${email}
Company: ${company || 'Not provided'}
Budget: ${budget || 'Not provided'}

Message:
${message}

---
Sent from your portfolio contact form.
    `.trim();

    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safeEmailHref = encodeURIComponent(email);
    const safeCompany = escapeHtml(company || 'Not provided');
    const safeBudget = escapeHtml(budget || 'Not provided');
    const safeMessage = escapeHtml(message);

    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: emailSubject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: emailBody, Charset: 'UTF-8' },
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #1e3a5f;">New contact form submission</h2>
                  <table style="width: 100%; max-width: 600px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px; font-weight: bold; width: 120px;">Name:</td>
                      <td style="padding: 10px;">${safeName}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; font-weight: bold;">Email:</td>
                      <td style="padding: 10px;"><a href="mailto:${safeEmailHref}">${safeEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold;">Company:</td>
                      <td style="padding: 10px;">${safeCompany}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; font-weight: bold;">Budget:</td>
                      <td style="padding: 10px;">${safeBudget}</td>
                    </tr>
                  </table>
                  <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #1e3a5f;">
                    <h3 style="margin-top: 0; color: #1e3a5f;">Message:</h3>
                    <p style="white-space: pre-wrap;">${safeMessage}</p>
                  </div>
                  <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                  <p style="font-size: 12px; color: #666;">Sent from your portfolio contact form.</p>
                </body>
              </html>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    });

    await sesClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};

/**
 * AWS Lambda function to handle contact form submissions via SES
 * This function is deployed to Lambda and exposed via API Gateway
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// Initialize SES client
// AWS_REGION is automatically set by Lambda runtime
const sesClient = new SESClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { fullName, email, company, budget, message } = body;

    // Validate required fields
    if (!fullName || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Prepare email content
    const emailSubject = `New Contact Form Submission from ${fullName}`;
    const emailBody = `
New contact form submission:

Name: ${fullName}
Email: ${email}
Company: ${company || 'Not provided'}
Budget: ${budget || 'Not provided'}

Message:
${message}

---
This email was sent from the Construct Design Academy contact form.
    `.trim();

    // Send email via SES
    const command = new SendEmailCommand({
      Source: 'teamconnoisseurww@gmail.com',
      Destination: {
        ToAddresses: ['teamconnoisseurww@gmail.com'],
      },
      Message: {
        Subject: {
          Data: emailSubject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8',
          },
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #C2A376;">New Contact Form Submission</h2>
                  <table style="width: 100%; max-width: 600px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px; font-weight: bold; width: 120px;">Name:</td>
                      <td style="padding: 10px;">${fullName}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; font-weight: bold;">Email:</td>
                      <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold;">Company:</td>
                      <td style="padding: 10px;">${company || 'Not provided'}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; font-weight: bold;">Budget:</td>
                      <td style="padding: 10px;">${budget || 'Not provided'}</td>
                    </tr>
                  </table>
                  <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #C2A376;">
                    <h3 style="margin-top: 0; color: #C2A376;">Message:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                  </div>
                  <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                  <p style="font-size: 12px; color: #666;">This email was sent from the Construct Design Academy contact form.</p>
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
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message
      })
    };
  }
};

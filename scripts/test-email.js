require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Testing Resend email service...');
    console.log('Using API key:', process.env.RESEND_API_KEY ? 'API key is set' : 'API key is missing');
    console.log('From email:', process.env.EMAIL_FROM);
    console.log('From name:', process.env.EMAIL_FROM_NAME);
    
    // Verified email address from the error message
    const testEmail = 'petterlund@hotmail.no'; 
    
    const data = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: testEmail,
      subject: 'Test Email from Fargelegg Nå',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Test Email</h1>
          <p>Dette er en test-epost fra Fargelegg Nå systemet.</p>
          <p>Hvis du mottok denne e-posten, fungerer Resend-oppsettet ditt korrekt.</p>
          <p>Testet: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    
    console.log('Email sent!', data);
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail(); 

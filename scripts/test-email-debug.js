require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

// Print all environment variables for debugging
console.log('Environment variables:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'API key is set (hidden for security)' : 'API key is missing');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME);
console.log('DEV_TEST_EMAIL:', process.env.DEV_TEST_EMAIL);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('\nTesting Resend email service...');
    
    // Verified email address
    const testEmail = 'delivered@resend.dev'; // Using Resend's test email address
    
    console.log(`Sending test email to ${testEmail}...`);
    
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
    
    console.log('Email result:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('Error details:', data.error);
    } else {
      console.log('Email sent successfully!');
    }
  } catch (error) {
    console.error('Exception caught when sending email:');
    console.error(error.name + ':', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.error('Full error object:', error);
  }
}

testEmail(); 
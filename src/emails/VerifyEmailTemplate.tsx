import * as React from 'react';
import { 
  Body, Container, Head, Heading, Html, 
  Link, Preview, Section, Text, Hr
} from '@react-email/components';

interface VerifyEmailTemplateProps {
  userFirstname?: string;
  verificationCode: string;
  verificationUrl?: string; // Keep for backward compatibility but don't use
}

export default function VerifyEmailTemplate({
  userFirstname = 'der',
  verificationCode,
  verificationUrl // Not used anymore
}: VerifyEmailTemplateProps) {
  const previewText = `Bekreft e-postadressen din for Fargelegging.no`;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bekreft e-postadressen din</Heading>
          <Text style={text}>
            Hei {userFirstname}!
          </Text>
          <Text style={text}>
            Takk for at du registrerte deg på Fargelegging.no. For å fullføre 
            registreringen og få tilgang til alle funksjoner, må du bekrefte 
            e-postadressen din med koden nedenfor.
          </Text>
          <Section style={buttonContainer}>
            <div style={codeBox}>
              {verificationCode}
            </div>
          </Section>
          <Text style={text}>
            Gå til <Link href={`${baseUrl}/verify-email`} style={inlineLink}>verifiseringssiden</Link> og skriv inn koden over.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Hvis du ikke registrerte deg på Fargelegging.no, kan du trygt ignorere denne e-posten.
          </Text>
          <Text style={footer}>
            Denne e-posten ble sendt fra en avsender som ikke tar imot svar. Vennligst ikke svar 
            på denne meldingen.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styling
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '20px 0'
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6e6e6',
  borderRadius: '5px',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const codeBox = {
  backgroundColor: '#f5f5f5',
  borderRadius: '5px',
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  padding: '20px',
  display: 'inline-block',
};

const inlineLink = {
  color: '#4f46e5',
  textDecoration: 'underline',
};

const codeContainer = {
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  color: '#333',
  fontSize: '14px',
  padding: '12px',
  margin: '20px 0',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '30px 0',
};

const footer = {
  color: '#888',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '12px 0',
}; 
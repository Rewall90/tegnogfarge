import * as React from 'react';
import { 
  Body, Button, Container, Head, Heading, Html, 
  Link, Preview, Section, Text, Hr
} from '@react-email/components';

interface VerifyEmailTemplateProps {
  userFirstname?: string;
  verificationUrl: string;
}

export default function VerifyEmailTemplate({
  userFirstname = 'der',
  verificationUrl
}: VerifyEmailTemplateProps) {
  const previewText = `Bekreft e-postadressen din for Fargelegging.no`;

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
            e-postadressen din ved å klikke på knappen nedenfor.
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={verificationUrl}
            >
              Bekreft e-postadressen min
            </Button>
          </Section>
          <Text style={text}>
            Eller kopier og lim inn følgende URL i nettleseren din:
          </Text>
          <Text style={codeContainer}>
            {verificationUrl}
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

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
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
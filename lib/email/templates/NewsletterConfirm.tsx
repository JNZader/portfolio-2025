import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewsletterConfirmProps {
  confirmUrl: string;
}

export default function NewsletterConfirm({ confirmUrl }: NewsletterConfirmProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirma tu suscripción a nuestra newsletter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Confirma tu Suscripción</Heading>

          <Text style={text}>
            Gracias por suscribirte a nuestra newsletter. Para completar tu suscripción, por favor
            confirma tu dirección de email haciendo click en el botón de abajo.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmUrl}>
              Confirmar Suscripción
            </Button>
          </Section>

          <Text style={text}>O copia y pega este enlace en tu navegador:</Text>

          <Text style={link}>{confirmUrl}</Text>

          <Text style={footer}>
            Este enlace expirará en 24 horas. Si no solicitaste esta suscripción, puedes ignorar
            este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '16px',
};

const buttonContainer = {
  padding: '27px 40px',
};

const button = {
  backgroundColor: '#3B82F6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const link = {
  color: '#3B82F6',
  fontSize: '14px',
  textDecoration: 'underline',
  padding: '0 40px',
  marginBottom: '16px',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};

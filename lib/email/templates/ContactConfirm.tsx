import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ContactConfirmProps {
  name: string;
}

export default function ContactConfirm({ name }: ContactConfirmProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmación de mensaje recibido</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Mensaje Recibido!</Heading>

          <Text style={text}>Hola {name},</Text>

          <Text style={text}>
            Gracias por contactarme. He recibido tu mensaje y te responderé lo antes posible.
          </Text>

          <Text style={text}>Normalmente respondo en un plazo de 24-48 horas hábiles.</Text>

          <Section style={callout}>
            <Text style={calloutText}>
              💡 <strong>Consejo:</strong> Revisa tu carpeta de spam por si mi respuesta termina
              ahí.
            </Text>
          </Section>

          <Text style={text}>
            Saludos,
            <br />
            Tu Nombre
          </Text>

          <Text style={footer}>Si no enviaste este mensaje, puedes ignorar este email.</Text>
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
  margin: '0 0 16px',
  padding: '0 40px',
};

const callout = {
  backgroundColor: '#EEF2FF',
  borderLeft: '4px solid #3B82F6',
  margin: '24px 40px',
  padding: '16px',
};

const calloutText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: 0,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  padding: '0 40px',
};

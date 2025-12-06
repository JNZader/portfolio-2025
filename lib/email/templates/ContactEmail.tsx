import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactEmail({ name, email, subject, message }: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nuevo mensaje de contacto de {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nuevo Mensaje de Contacto</Heading>

          <Text style={text}>Has recibido un nuevo mensaje desde tu portfolio:</Text>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Nombre:</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Email:</Text>
            <Text style={value}>
              <Link href={`mailto:${email}`} style={link}>
                {email}
              </Link>
            </Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Asunto:</Text>
            <Text style={value}>{subject}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Mensaje:</Text>
            <Text style={messageBox}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Este email fue enviado desde el formulario de contacto de tu portfolio.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos inline (requerido por email clients)
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
};

const section = {
  padding: '0 40px',
};

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const value = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 16px',
};

const link = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

const messageBox = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e6e6e6',
  borderRadius: '4px',
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '16px',
  whiteSpace: 'pre-wrap' as const,
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
};

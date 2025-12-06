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

interface NewsletterWelcomeProps {
  unsubscribeUrl: string;
}

export default function NewsletterWelcome({ unsubscribeUrl }: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a nuestra newsletter!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Bienvenido! 🎉</Heading>

          <Text style={text}>
            Tu suscripción ha sido confirmada exitosamente. Gracias por unirte a nuestra comunidad.
          </Text>

          <Text style={text}>
            A partir de ahora recibirás contenido exclusivo, actualizaciones y noticias directamente
            en tu inbox.
          </Text>

          <Section style={callout}>
            <Text style={calloutText}>
              💡 <strong>Consejo:</strong> Agrega nuestro email a tu lista de contactos para
              asegurar que no terminen en spam.
            </Text>
          </Section>

          <Text style={text}>¿Qué puedes esperar?</Text>

          <ul style={list}>
            <li style={listItem}>📝 Artículos técnicos y tutoriales</li>
            <li style={listItem}>🚀 Actualizaciones de proyectos</li>
            <li style={listItem}>💡 Tips y mejores prácticas</li>
            <li style={listItem}>🎁 Contenido exclusivo para suscriptores</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={process.env.NEXT_PUBLIC_SITE_URL || '#'}>
              Visitar el Blog
            </Button>
          </Section>

          <Text style={footer}>
            Puedes darte de baja en cualquier momento haciendo{' '}
            <a href={unsubscribeUrl} style={footerLink}>
              click aquí
            </a>
            .
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

const list = {
  padding: '0 40px',
  marginBottom: '16px',
};

const listItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '8px',
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

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};

const footerLink = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

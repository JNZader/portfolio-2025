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
import {
  button,
  buttonContainer,
  callout,
  calloutText,
  container,
  footer,
  footerLink,
  h1,
  list,
  listItem,
  main,
  text,
} from './email-styles';

interface NewsletterWelcomeProps {
  unsubscribeUrl: string;
}

export default function NewsletterWelcome({ unsubscribeUrl }: Readonly<NewsletterWelcomeProps>) {
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
            <Button style={button} href={process.env.NEXT_PUBLIC_SITE_URL ?? '#'}>
              Visitar el Blog
            </Button>
          </Section>

          <Text style={footer}>
            Puedes darte de baja en cualquier momento haciendo{' '}
            <a href={unsubscribeUrl} style={footerLink}>
              click aquí
            </a>
            {'.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

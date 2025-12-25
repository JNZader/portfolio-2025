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
import type { CSSProperties } from 'react';
import { button, buttonContainer, container, footer, h1, main, text } from './email-styles';

interface NewsletterConfirmProps {
  confirmUrl: string;
}

// Template-specific style
const confirmLink: CSSProperties = {
  color: '#3B82F6',
  fontSize: '14px',
  textDecoration: 'underline',
  padding: '0 40px',
  marginBottom: '16px',
  wordBreak: 'break-all',
};

export default function NewsletterConfirm({ confirmUrl }: Readonly<NewsletterConfirmProps>) {
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

          <Text style={confirmLink}>{confirmUrl}</Text>

          <Text style={footer}>
            Este enlace expirará en 24 horas. Si no solicitaste esta suscripción, puedes ignorar
            este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

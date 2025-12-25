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
import { callout, calloutText, container, footer, h1, main, text } from './email-styles';

interface ContactConfirmProps {
  name: string;
}

export default function ContactConfirm({ name }: Readonly<ContactConfirmProps>) {
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
            Javier Zader
          </Text>

          <Text style={footer}>Si no enviaste este mensaje, puedes ignorar este email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

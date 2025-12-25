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
import {
  container,
  footer,
  h1,
  hr,
  label,
  link,
  main,
  messageBox,
  section,
  text,
  value,
} from './email-styles';

interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactEmail({
  name,
  email,
  subject,
  message,
}: Readonly<ContactEmailProps>) {
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

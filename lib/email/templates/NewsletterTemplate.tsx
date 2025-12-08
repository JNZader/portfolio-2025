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
import { Markdown } from '@react-email/markdown';

interface NewsletterTemplateProps {
  subject: string;
  content: string; // Markdown content
  unsubscribeUrl?: string;
}

export default function NewsletterTemplate({
  subject,
  content,
  unsubscribeUrl = '#',
}: NewsletterTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{subject}</Heading>

          <Section style={contentSection}>
            <Markdown
              markdownCustomStyles={{
                h1: { fontSize: '24px', fontWeight: 'bold', margin: '24px 0 16px' },
                h2: { fontSize: '20px', fontWeight: 'bold', margin: '24px 0 16px' },
                p: { fontSize: '16px', lineHeight: '26px', marginBottom: '16px' },
                li: { fontSize: '16px', lineHeight: '24px', marginBottom: '8px' },
                link: { color: '#3B82F6', textDecoration: 'underline' },
              }}
            >
              {content}
            </Markdown>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Estás recibiendo este email porque te suscribiste a nuestra newsletter.
            </Text>
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} style={footerLink}>
                Darse de baja
              </Link>
            )}
          </Section>
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
  padding: '40px 20px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const h1 = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const contentSection = {
  color: '#374151',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '40px 0 24px',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  marginBottom: '12px',
};

const footerLink = {
  color: '#9ca3af',
  fontSize: '12px',
  textDecoration: 'underline',
};

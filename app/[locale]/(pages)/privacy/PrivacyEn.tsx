import { Link } from '@/i18n/navigation';
import { email } from './email';

export function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead">
        Last updated: <time dateTime="2025-01-01">January 2025</time>
      </p>
      <hr />

      <h2>1. Introduction</h2>
      <p>
        This privacy policy explains how Javier Norberto Zader ("I", "me", "this site") collects,
        uses and protects your personal information when you use this website.
      </p>
      <p>
        I'm committed to protecting your privacy and complying with Argentina's Personal Data
        Protection Law 25.326, as well as the European Union's General Data Protection Regulation
        (GDPR) for EU visitors.
      </p>

      <h2>2. Information I Collect</h2>
      <h3>2.1 Information You Provide Directly</h3>
      <ul>
        <li>
          <strong>Newsletter:</strong> Email, subscription date, consent preferences
        </li>
        <li>
          <strong>Contact Form:</strong> Name, email, message
        </li>
      </ul>
      <h3>2.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Cookies:</strong> Cookie preferences, session
        </li>
        <li>
          <strong>Metadata:</strong> IP address, User-Agent, browser, device
        </li>
        <li>
          <strong>Analytics:</strong> Pages visited, time on page (only if you allow analytics
          cookies)
        </li>
      </ul>

      <h2>3. How I Use Your Information</h2>
      <p>I use your personal information to:</p>
      <ul>
        <li>
          <strong>Newsletter:</strong> Send you emails with content and updates (only with your
          explicit consent)
        </li>
        <li>
          <strong>Answer inquiries:</strong> Process and reply to your contact messages
        </li>
        <li>
          <strong>Improve the site:</strong> Analyze site usage to improve the experience (if you
          allow analytics cookies)
        </li>
        <li>
          <strong>Legal compliance:</strong> Meet legal obligations and resolve disputes
        </li>
      </ul>

      <h2>4. Legal Basis for Processing</h2>
      <p>I process your information under the following legal bases:</p>
      <h3>4.1 Argentine Law 25.326</h3>
      <ul>
        <li>
          <strong>Consent (Art. 5):</strong> For the newsletter and non-essential cookies
        </li>
        <li>
          <strong>Legitimate interest:</strong> For analytics and site improvements
        </li>
      </ul>
      <h3>4.2 GDPR (for EU visitors)</h3>
      <ul>
        <li>
          <strong>Consent (Art. 6.1.a):</strong> For the newsletter and non-essential cookies
        </li>
        <li>
          <strong>Legitimate interest (Art. 6.1.f):</strong> For analytics and site improvements
        </li>
      </ul>

      <h2>5. Sharing Information</h2>
      <p>
        <strong>I do NOT sell or rent your personal information.</strong>
      </p>
      <p>I share information only with:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> Resend (email), Upstash (rate limiting), Vercel
          (hosting)
        </li>
        <li>
          <strong>Legal obligations:</strong> If required by law or a court order
        </li>
      </ul>

      <h2>6. Cookies</h2>
      <p>I use the following types of cookies:</p>
      <h3>6.1 Essential Cookies (Required)</h3>
      <ul>
        <li>
          <strong>cookie-consent:</strong> Stores your cookie preferences (365 days)
        </li>
      </ul>
      <h3>6.2 Analytics Cookies (Optional)</h3>
      <ul>
        <li>I currently don't use third-party analytics cookies</li>
      </ul>
      <h3>6.3 Marketing Cookies (Optional)</h3>
      <ul>
        <li>I currently don't use third-party marketing cookies</li>
      </ul>
      <p>
        You can manage your cookie preferences at any time via the banner at the bottom of the page.
      </p>

      <h2>7. Your Rights</h2>
      <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)] rounded-lg p-6 my-6">
        <h3 className="mt-0">User Rights (Law 25.326 and GDPR)</h3>
        <ul className="mb-0">
          <li>
            <strong>Right of Access:</strong> Request a copy of your data
          </li>
          <li>
            <strong>Right of Rectification:</strong> Correct inaccurate data
          </li>
          <li>
            <strong>Right of Erasure:</strong> Request deletion of your data
          </li>
          <li>
            <strong>Right to Portability:</strong> Receive your data in JSON format
          </li>
          <li>
            <strong>Right to Object:</strong> Object to the processing of your data
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> At any time, without affecting the
            lawfulness of prior processing
          </li>
        </ul>
      </div>
      <div className="mb-4">
        To exercise these rights, visit the <Link href="/data-request">data request page</Link> or
        contact {email}
      </div>

      <h2>8. Data Retention</h2>
      <ul>
        <li>
          <strong>Newsletter:</strong> Until you unsubscribe + 30 days (to process the opt-out)
        </li>
        <li>
          <strong>Contact form:</strong> 24 months from the last message
        </li>
        <li>
          <strong>Consent records:</strong> 3 years (to meet audit requirements)
        </li>
      </ul>

      <h2>9. Security</h2>
      <p>I implement the following security measures:</p>
      <ul>
        <li>
          <strong>Encryption:</strong> All communication uses HTTPS/TLS
        </li>
        <li>
          <strong>Secure tokens:</strong> Generated with nanoid (32 characters)
        </li>
        <li>
          <strong>Rate limiting:</strong> Abuse protection (limits per IP and email)
        </li>
        <li>
          <strong>Email verification:</strong> For sensitive operations like data export and
          deletion
        </li>
        <li>
          <strong>Sanitization:</strong> All inputs are sanitized against XSS
        </li>
      </ul>

      <h2>10. International Transfers</h2>
      <p>
        Your data may be processed on servers outside Argentina. The providers used comply with data
        protection standards:
      </p>
      <ul>
        <li>
          <strong>Vercel:</strong> Hosting with a nearby-region option
        </li>
        <li>
          <strong>Resend:</strong> GDPR-compliant email service
        </li>
        <li>
          <strong>Upstash:</strong> Serverless Redis for rate limiting
        </li>
      </ul>
      <p>
        Argentina has "adequacy" status recognized by the European Union, which allows data
        transfers from the EU.
      </p>

      <h2>11. Minors</h2>
      <p>
        This site is not directed at children under 13. I do not knowingly collect information from
        minors. If I discover that I've collected a minor's data, I will delete it immediately.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        I may update this policy occasionally. I'll notify you of significant changes by email (if
        you're subscribed) or via a notice on the site. The current version is always available on
        this page with the last-updated date.
      </p>

      <h2>13. Contact</h2>
      <p>
        For any questions about this policy or to exercise your data protection rights, contact:
      </p>
      <div className="bg-[var(--color-muted)] rounded-lg p-4 my-4">
        <p className="mb-2">
          <strong>Data Controller:</strong>
        </p>
        <p className="mb-1">Javier Norberto Zader</p>
        <p className="mb-1">Email: {email}</p>
        <p className="mb-1">Location: Córdoba, Argentina</p>
        <p className="mb-0">Response time: 10 business days (per Law 25.326 Art. 14)</p>
      </div>

      <h2>14. Supervisory Authority</h2>
      <p>You have the right to lodge a complaint with the relevant data protection authority:</p>
      <ul>
        <li>
          <strong>Argentina:</strong>{' '}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">
            Agency for Access to Public Information (AAIP)
          </a>
        </li>
        <li>
          <strong>European Union:</strong> Find your local authority at{' '}
          <a
            href="https://edpb.europa.eu/about-edpb/board/members_en"
            target="_blank"
            rel="noopener noreferrer"
          >
            EDPB
          </a>
        </li>
      </ul>

      <hr />
      <p className="text-sm text-[var(--color-foreground)]/60">
        <strong>Version:</strong> 1.0 | <strong>Effective date:</strong> January 2025
      </p>
    </>
  );
}

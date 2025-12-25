/**
 * Shared styles for email templates
 * Email clients require inline styles, so we define them as reusable objects
 */

import type { CSSProperties } from 'react';

// Base layout styles
export const main: CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export const container: CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

// Typography
export const h1: CSSProperties = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

export const text: CSSProperties = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
  padding: '0 40px',
};

export const footer: CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  padding: '0 40px',
};

// Callout box
export const callout: CSSProperties = {
  backgroundColor: '#EEF2FF',
  borderLeft: '4px solid #3B82F6',
  margin: '24px 40px',
  padding: '16px',
};

export const calloutText: CSSProperties = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: 0,
};

// Button
export const buttonContainer: CSSProperties = {
  padding: '27px 40px',
};

export const button: CSSProperties = {
  backgroundColor: '#3B82F6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'block',
  padding: '12px 20px',
};

// Divider
export const hr: CSSProperties = {
  borderColor: '#e6e6e6',
  margin: '20px 40px',
};

// Links
export const link: CSSProperties = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

export const footerLink: CSSProperties = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

// Form display (for ContactEmail)
export const section: CSSProperties = {
  padding: '0 40px',
};

export const label: CSSProperties = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 4px',
};

export const value: CSSProperties = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 16px',
};

export const messageBox: CSSProperties = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e6e6e6',
  borderRadius: '4px',
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '16px',
  whiteSpace: 'pre-wrap',
};

// List styles
export const list: CSSProperties = {
  padding: '0 40px',
  marginBottom: '16px',
};

export const listItem: CSSProperties = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '8px',
};

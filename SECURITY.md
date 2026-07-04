# Security Policy

## Reporting a vulnerability

If you find a security issue in this project, please report it privately —
**do not open a public issue.**

- Email: **jnzader@gmail.com** with the subject `SECURITY: portfolio-2025`.
- Include: a description of the issue, the affected file/endpoint, steps to
  reproduce, and the potential impact.

You can expect an acknowledgement within a few business days. Once the issue is
confirmed and fixed, you're welcome to be credited in the fix (opt-in).

## Scope

This is a personal portfolio site. The areas most worth scrutiny are the
authenticated `/admin` surface, the contact/newsletter API routes, and the
GDPR data-request/deletion flows. Please avoid automated scanning that could
disrupt the live site or exhaust rate limits.

## Supported versions

Only the latest deployed version (`main`) is supported. There are no
maintained release branches.

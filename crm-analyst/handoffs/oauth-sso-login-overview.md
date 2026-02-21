# Feature Overview: OAuth / SSO Login

## Description
Implement Single Sign-On (SSO) authentication using OAuth 2.0 and OpenID Connect protocols. This allows users to sign up and log in to Zazmic CRM securely utilizing their existing identity providers (Google, Microsoft, etc.) while falling back on traditional email/password credentials if preferred.

## Business Value
- **Higher Adoption Rates:** Removes friction during signup by eliminating the need to create yet another password.
- **Enhanced Security:** Piggybacks on the robust security measures of major identity providers (MFA, suspicious login alerts) reducing our liability.
- **Streamlined User Experience:** Standardizes the login experience that enterprise users expect, leading to higher retention.

## Acceptance Criteria
- [ ] Users can log in using their Google account via an OAuth popup or redirect.
- [ ] New users authenticating via OAuth are automatically provisioned an account in the User table if they don't already exist.
- [ ] Existing users can link an OAuth provider to their current email/password account.
- [ ] The system securely handles OAuth state/nonces to prevent CSRF attacks.
- [ ] Users are issued the standard JWT upon successful OAuth login to maintain session state consistent with standard logins.

## Dependencies
- Existing `users` table and `roles` relationships in the database configuration.
- Current React `AuthContext` managing JWT tokens.
- We will need Google OAuth Client IDs configured.

## Estimated Effort
**Medium:** Requires coordinated changes across database (schema updates for OAuth tracking), backend API (OAuth flow logic and token minting), and frontend (initiating the flow and parsing redirects).

## Risk Factors
- Ensuring a smooth fallback or linking process when an OAuth email matches an existing email/password user in the database without overwriting credentials.
- Handling OAuth provider outages.
- Correctly securing the callback endpoint from replay attacks.

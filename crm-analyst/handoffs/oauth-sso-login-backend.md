# Backend Handoff: OAuth / SSO Login

## Feature Summary
We are adding OAuth 2.0 based Single Sign-On (SSO) to our CRM. The backend will need to provide endpoints to initiate the OAuth flow and a callback endpoint to receive the authorization code, exchange it for user info from the provider, and issue our own system's JWT. A new `oauth_providers` table (or similar fields on the `users` table) will be needed to track linked social accounts and avoid duplicate accounts for the same email address.

## API Endpoints Needed
- **`GET /api/auth/{provider}/login`**
  - **Description:** Generates the authorization URL and state token.
  - **Response:** `{ "auth_url": "https://accounts.google.com/o/oauth2/v2/...", "state": "xyz" }`
  - **Status Code:** 200 OK
- **`GET /api/auth/{provider}/callback`**
  - **Description:** Endpoint that the provider redirects back to.
  - **Query Params:** `code`, `state`
  - **Response:** Returns standard JWT structure equivalent to normal login: `{ "access_token": "...", "token_type": "bearer", "user": {} }` (Alternatively, it can perform an HTTP redirect back to the frontend with the token).
  - **Status Code:** 200 OK or 302 Redirect.

## Database Model Changes
- **New columns on `User` table (or new `OAuthAccount` table):**
  - Need a way to track `provider_name` (e.g., 'google') and `provider_user_id` (the external ID).
  - If adding to `User`: `auth_provider` (string, default 'local'), `provider_id` (string, nullable). Remember to make `password_hash` nullable if a user is created exclusively via OAuth.
- **Migration:** Generate Alembic migration to add these fields.

## Business Logic
1. Validate `state` parameter to prevent CSRF.
2. Exchange authorization `code` with the provider for an access token.
3. Fetch user profile from the provider (email, name).
4. Look up user by `provider_id`. If found, generate JWT.
5. If not found, look up user by email. If email exists, associate the `provider_id` with this existing account and generate JWT.
6. If email doesn't exist, create a new `User` record with a default `Role`, empty password hash, set the provider details, and generate JWT.

## Edge Cases to Handle
- Provider access token exchange fails (invalid code, timeout).
- User denies permissions on the consent screen.
- State mismatch (potential CSRF).
- Email from provider is not verified.

## Test Cases
- Successful login of an existing user using a valid mock OAuth payload.
- Successful signup of a completely new user returning the proper JWT.
- Linking an existing email/password user to a new OAuth provider implicitly based on associated email.
- Authentication rejection when `state` validation fails.

---

## Agent Prompt (copy and paste this to the agent)
> We need to build the backend for an OAuth / SSO login feature using Google as the primary provider.
> Please review the handoff document at `../crm-analyst/handoffs/oauth-sso-login-backend.md` for exact specifications.
> 
> Your tasks:
> 1. Update `crm-database/models.py` to support OAuth tracking (either adding `auth_provider` and `provider_id` columns to the `User` table and making `password_hash` nullable, or creating a new linked table).
> 2. Create the Alembic migration for the schema changes.
> 3. Implement the FastAPI endpoints (`GET /api/auth/google/login` and `GET /api/auth/google/callback`) in `crm-backend/`. Use a library like `Authlib` or `httpx` to handle the OAuth 2.0 exchange.
> 4. Ensure that the callback endpoint properly handles finding existing users by email or creating new users, and returns our system's standard JWT so the frontend `AuthContext` can proceed normally.
> 5. Write Pytest tests to verify the authentication flows.

# Integration Checklist: Google OAuth / SSO

## Tasks
1. [x] **Apply Database Migration:** Upgrade the `crm-database` to the latest head so that `auth_provider` and `provider_id` schema changes take effect.
2. [x] **Configure Environment Variables:** Add a `.env` file to the `crm-backend/` containing the `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` settings.
3. [x] **Ensure Redirect URIs Match:** The `GOOGLE_REDIRECT_URI` must match the exact frontend path that the user is initially redirected back to by Google (e.g. `http://localhost:5173/oauth/callback`) to successfully exchange the access code on the backend!

*Note: For local testing, mock strings have been configured.*

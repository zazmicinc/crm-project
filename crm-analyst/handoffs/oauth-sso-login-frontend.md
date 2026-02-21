# Frontend Handoff: OAuth / SSO Login

## Feature Summary
We are implementing OAuth / SSO allowing users to log into the CRM using Google. The frontend needs to provide a visual button on the login/signup pages to initiate this process. The app will fetch the Authorization URL from our backend, redirect the user to Google, and upon their return to a callback route, extract the JWT from the backend to complete the login state in our React context.

## UI Components to Create/Modify
- **`LoginPage` and `SignupPage`:** Add an aesthetically pleasing "Sign in with Google" button below the traditional email/password form inputs. Use a visual separator (e.g., "--- OR ---").
- **`OAuthCallbackPage` (New):** A simple landing/loading screen that handles the redirect back from Google. It should parse URL parameters and communicate with the backend.

## Pages/Routes
- Modified: `/login`
- New: `/oauth/callback` - Dedicated route for handling the backend redirect logic gracefully.

## API Calls to Integrate
- **`auth/google/login_url`:** Fetch to get the URL to redirect the user to.
- **`auth/google/callback`:** If the backend doesn't handle the redirect itself, the frontend callback page will immediately call this endpoint, passing the `code` and `state` from the URL params to receive the final JWT payload.

## User Flow
1. User clicks "Sign in with Google" on `/login`.
2. Frontend requests the OAuth URL from the backend and performs `window.location.href = data.auth_url`.
3. User signs into Google and grants permission to the CRM.
4. Google redirects the user back to the CRM frontend at `/oauth/callback?code=xxxx&state=yyyy`.
5. The `OAuthCallbackPage` shows a loading spinner, sends the `code` and `state` to the backend.
6. The backend returns a standard `{ access_token, user }` payload.
7. `OAuthCallbackPage` calls the `login` function inside `AuthContext` with the token.
8. Application router immediately redirects to the Dashboard (`/`).

## Empty/Loading/Error States
- Show a full-page loading spinner on the `/oauth/callback` route while exchanging the code.
- If the OAuth process fails (e.g., user denied it, or the state was invalid), redirect back to `/login` and display an error toast/alert: "Authentication failed. Please try again or use your password."

---

## Agent Prompt (copy and paste this to the agent)
> We need to build the frontend implementation for an OAuth / SSO login feature.
> Please read the handoff specifications located at `../crm-analyst/handoffs/oauth-sso-login-frontend.md`.
> 
> Your tasks:
> 1. Update the `LoginPage` component in `crm-frontend/src/pages/` to include a visually modern "Sign in with Google" button. 
> 2. Create the logic to request the Google OAuth URL from the backend and redirect the browser window.
> 3. Create a new `OAuthCallbackPage` component and add it to the React Router in `App.jsx` at the path `/oauth/callback`.
> 4. Ensure the `OAuthCallbackPage` displays a loading state, extracts `code` and `state` query parameters, sends them to the backend API, and uses the resulting JWT to update the `AuthContext`.
> 5. Handle error states beautifully with clear alerts if the login flow fails and redirect the user back to the login page.

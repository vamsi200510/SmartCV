# Setup Guide: Enabling Google OAuth in Supabase

This guide provides step-by-step instructions to configure Google Login (OAuth) for the SmartCV application.

---

## Phase 1: Google Cloud Console Configuration

1. **Access Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Select an existing project or click **New Project** to create one (e.g., `SmartCV`).

2. **Configure OAuth Consent Screen**:
   - Navigate to **APIs & Services** > **OAuth consent screen** from the left sidebar.
   - Select **User Type** > **External** and click **Create**.
   - Fill in the required fields:
     - **App name**: `SmartCV`
     - **User support email**: *Your email address*
     - **Developer contact information**: *Your email address*
   - Click **Save and Continue**.
   - On the **Scopes** tab, click **Add or Remove Scopes**. Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Save and Continue**.
   - On the **Test users** tab, add any email addresses (including your own) that you want to use for testing while the app is in "Testing" mode.
   - Click **Save and Continue** to return to the dashboard.

3. **Create OAuth Credentials**:
   - Navigate to **APIs & Services** > **Credentials**.
   - Click **+ Create Credentials** at the top and select **OAuth client ID**.
   - Set **Application type** to **Web application**.
   - Set **Name** to `SmartCV OAuth Client`.
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000`
   - Under **Authorized redirect URIs**, add the callback URL from your Supabase Dashboard:
     - `https://oovucyduercyrvpbldns.supabase.co/auth/v1/callback`
   - Click **Create**.
   - Copy the generated **Client ID** and **Client Secret** shown in the popup.

---

## Phase 2: Supabase Dashboard Configuration

1. **Access Supabase Dashboard**:
   - Log into [Supabase](https://supabase.com/dashboard) and select your active project (`SmartCV`).

2. **Enable Google Provider**:
   - Go to **Authentication** > **Providers** (under Settings) from the sidebar.
   - Expand the **Google** provider option.
   - Toggle **Enable Google provider** to active (green).
   - Paste the credentials copied from the Google Cloud Console:
     - **Client ID**: *Your Google Client ID*
     - **Client Secret**: *Your Google Client Secret*
   - Verify that the **Redirect URI** matches the one configured in Google Cloud Console (`https://oovucyduercyrvpbldns.supabase.co/auth/v1/callback`).
   - Click **Save** at the bottom of the section.

---

## Phase 3: Application Validation

1. Start your local environment:
   ```bash
   npm run dev
   ```
2. Navigate to [http://localhost:3000/auth](http://localhost:3000/auth).
3. Click the **Continue with Google** button.
4. Verify that you are redirected to the Google account chooser screen, and on successful login, redirected back to the `/dashboard` or `/onboarding` depending on your profile state.

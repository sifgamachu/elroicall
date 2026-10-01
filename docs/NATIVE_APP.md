# Elroi Calls app

The app adds a dedicated `/app/` experience to the existing React project. Android and iOS projects package the same application with Capacitor 8.5.2. iPhone and iPad are both configured. The public website, account, calling, scheduling, call notes, call history, and preferences retain their routes and services.

## Product

| Area | Delivered behavior |
| --- | --- |
| Home | Genesis cinema collection, next unread assignment, messages, and calling entry |
| Watch | Existing El Roi Calls channel messages, search, click-to-load YouTube playback |
| Bible Cinema | Seven upcoming Genesis stories; published uploads appear here as films |
| Study | Existing complete 84-day Bible reading plan, Scripture links, account progress, private written reflections |
| Calls | Existing phone line, written conversation, scheduling, seven-call journeys, dashboard |
| Your space | Existing account, schedules, saved call notes, history, preferences, membership |
| Content studio | Publishing-account-only drafts, coming-soon entries, YouTube links, private MP4 uploads, free/member access, Scripture, artwork, companion study, release status |
| Membership | Native RevenueCat offerings, real store prices, purchase, restore, store management links; no sales before configuration |

The four existing channel messages are published. Genesis films are **not produced by this implementation**. All seven Genesis entries are accurately labeled coming soon until the publisher attaches and releases actual media. Summaries and visual artwork are interpretations; source passages remain linked.

## Build and test

From `app/`:

```sh
npm ci --ignore-scripts
npm test
npm run check
npm run native:sync
npm run native:android
npm run native:ios
```

Run PostgreSQL policy and calling regressions with `npm ci --ignore-scripts && npm test` from `supabase/tests/`.

Native dependencies use locked versions. Android requires JDK 21 and Android SDK 36. iOS requires macOS and Xcode 26 or later. Open `app/ios/App/App.xcodeproj`; Swift Package Manager resolves Capacitor and RevenueCat. The native CI workflow builds a debug Android APK and a simulator build without distribution signing. These checks do not submit anything to a store.

## Existing account integration

Password sign-in uses the existing Supabase account. App study data is owned by the same Auth user. Switching accounts remounts the private workspace before loading another person's data. Reflections and completion updates use one account-scoped RPC that preserves each field independently.

The native app opens at `/app/`, retains the bottom navigation on existing account/calling pages, handles Android back, and opens external Scripture and policy links in the system browser. Android device backups are disabled so application session data is not included in a routine backup.

HTTPS deep links are accepted only for the exact `elroicall.com` host and approved routes. Store signing identities and domain association files must be configured before claiming verified universal-link support. Existing email recovery uses the website; password login remains available in the native app. No unverified third-party sign-in option has been added.

## Posting videos

Sign in with the publishing account, then open **Your space → Content studio**. Publisher authorization is a server-owned `app_metadata.elroi_editor` claim, never user-editable profile metadata. The project owner's existing account has been enabled for this role. Refresh the sign-in session to pick up this new claim.

Use a YouTube link for a public message or full length public film. Choose a private MP4 upload for a member film. The initial private-upload limit is 50 MB, enforced by the storage bucket and studio. Long private feature films need a larger storage plan and/or a streaming/transcoding provider before launch; this implementation does not pretend to provide adaptive streaming, DRM, downloads, or automatic video production.

Drafts are studio-only. Coming-soon stories appear without a playback button. A published release requires a valid source. YouTube media stays free because a public video URL cannot securely enforce a paid membership. Storage media remains private; only the playback service signs its URL. A failed catalog save can leave an orphan private upload for the owner to remove; it is never exposed publicly.

## Membership release

1. Create Apple and Google developer/store records for `com.elroicall.app` and configure distribution signing.
2. Configure subscription products and final prices in App Store Connect and Play Console. Link both apps to one RevenueCat project and the `elroi_plus` entitlement. Use the Supabase Auth UUID as the RevenueCat app user ID.
3. Set the public native build keys `VITE_REVENUECAT_APPLE_KEY` and `VITE_REVENUECAT_ANDROID_KEY`. Set `REVENUECAT_SECRET_KEY` only in the Supabase Edge Function environment, never Vite or GitHub source.
4. Publish actual member films before selling a subscription for that catalog. Test purchase, cancellation, expiration/grace period, restoration, account switching, and access from both platforms with store sandbox accounts.
5. Complete privacy declarations, age ratings, store screenshots, and store review. This source change does not publish the app to the App Store or Google Play.

Server playback revalidates the Auth token and RevenueCat entitlement for each member-film request. Expired memberships, missing verification configuration, unauthorized users, unknown access levels, and unpublished films cannot obtain signed media links. The link expires after one hour. A link already issued remains usable until expiry; DRM and immediate URL revocation are not included.

## Browser installation

`/app/` also has an installable manifest and icons. Android browsers can offer installation; on iPhone or iPad, use Safari's Add to Home Screen. The app shell service worker only caches public scripts, CSS, and artwork. Auth responses, account data, signed videos, APIs, and external content never enter this cache. Reading requires an online Bible source; films and account sync need connectivity. Store purchases are enabled only in configured native builds.

## Backend

`elroi_media` holds the public catalog and editor-only drafts. `elroi_study_progress` holds owner-scoped completion and reflections. The private `elroi-media` bucket stores MP4 films. `media-access` implements free playback and authenticated store-backed member playback. Existing calling providers and permissions are unchanged.

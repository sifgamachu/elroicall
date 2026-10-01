# Elroi Calls — first store release

Prepared October 1, 2026. The web app is available at https://elroicall.com/app/. Android and Apple simulator builds are test builds. No store submission, paid product, or production signing identity has been created.

## What can be used today

| Experience                                          | Current status                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser app on Android, iPhone, iPad, and computers | Live; use **Install app** for device instructions                                                                                                             |
| Android APK                                         | Debug test build; not a Play Store release                                                                                                                    |
| Apple simulator package                             | Runs in Xcode Simulator on a Mac; not an iPhone installation file or TestFlight release                                                                       |
| Messages                                            | Four existing public El Roi Calls videos                                                                                                                      |
| Bible study                                         | Complete 84-day plan, Scripture links, account progress and private reflections                                                                               |
| Genesis cinema                                      | Seven upcoming stories; actual films must be uploaded and published                                                                                           |
| Subscription                                        | Purchase and restore integration built; no prices or plans are on sale                                                                                        |
| Existing service                                    | Website, account, written reflection, phone number, scheduling, and dashboard remain connected; calling activation follows the existing service configuration |

## The owner's next step

Create the developer accounts using the actual publisher's identity:

- Apple Developer Program: https://developer.apple.com/programs/enroll/
- Google Play Console setup: https://support.google.com/googleplay/android-developer/answer/6112435

Choose individual/personal or organization based on the real publisher. The website's current legal pages name Teregna LLC; confirm whether that is also the app publisher before completing store records. Enrollment, identity verification, agreements, and registration payments must be completed by the account holder. Keep ownership in those accounts and invite development access rather than sharing credentials.

Both projects currently use `com.elroicall.app`. Confirm that identifier when creating the store records, before producing signed release builds. Google currently requires new personal accounts to run a closed test with at least 12 testers continuously opted in for 14 days before applying for production access; plan for this time rather than promising an immediate launch.

## Draft store listing

This copy describes the current free release. Replace the coming-soon sentence only after the films and paid plans are actually released.

| Field                    | Draft                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App name                 | Elroi Calls                                                                                                                                                |
| Apple subtitle           | Watch, study & reflect                                                                                                                                     |
| Apple promotional text   | Make room for Scripture with Bible messages, an 84-day study journey, private reflections, and a connection to Elroi Calls. Genesis cinema is coming soon. |
| Apple keywords           | Bible,Scripture,study,Christian,faith,Genesis,reflection,prayer                                                                                            |
| Google short description | Bible messages, daily study, private reflections, and Elroi Calls.                                                                                         |
| Suggested category       | Education; confirm against the final release                                                                                                               |
| Website                  | https://elroicall.com/                                                                                                                                     |
| Support page             | https://elroicall.com/about/ — current contact: hello@elroicall.com; verify that this inbox is monitored                                                   |
| Privacy URL              | https://elroicall.com/privacy/                                                                                                                             |
| Terms URL                | https://elroicall.com/terms/                                                                                                                               |

### Full description

Make room for wonder. Elroi Calls brings Bible messages, study, and reflection together in one calm place.

WATCH AND REFLECT

Explore messages from the El Roi Calls channel. Open the related Scripture, continue into a companion study, or bring the passage into a written reflection.

A DAILY STUDY JOURNEY

Follow an 84-day Bible reading plan. Choose a day, read its passage, and mark your progress. Sign in to sync completed days and save private study reflections to your account. Guest reading progress stays on your device.

BIBLE CINEMA

Discover the upcoming Genesis collection, from creation to Joseph. Films will appear when they are published. Coming-soon entries include Scripture and study connections so you can begin reading today. Cinematic interpretations should be read alongside the biblical text.

YOUR ELROI CALLS SPACE

Use the same account to reach the existing Elroi Calls dashboard, preferences, saved notes, written conversation, and scheduling options. The guide is AI; the calling and reflection services are intended for adults 18 and older. The service is not a substitute for clergy, professional care, or emergency support.

The free message library and Bible study are available now. Elroi Plus member films and native store subscriptions are planned for a later release; no membership is currently on sale. Video playback, online Scripture sources, and account sync require an internet connection.

### Initial release notes

Introducing the Elroi Calls app: Bible messages, an 84-day study journey, private account reflections, and a home for the upcoming Genesis cinema collection.

## Screenshot capture plan

Capture real screenshots on the actual supported device sizes after the final build is installed. Do not upload the desktop web screenshot as a pretend iPhone screenshot.

1. Home: creation artwork, daily reading, messages, and the Watch–Study–Talk journey.
2. Watch: the published message library and video detail with companion Scripture.
3. Study: a real day in the plan and progress; use synthetic reflection text with no personal data.
4. Bible Cinema: visible **Coming soon** labels unless real films have been published.
5. Your space: a dedicated review account and its dashboard, with no real contact details.

Use App Store Connect and Play Console's current screenshot specifications at upload time. Age ratings must come from the actual questionnaires and available content, not from the marketing category.

## Required work before store submission

| Dependency                     | What still needs to be completed                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Developer accounts and signing | Enrollment, verified publisher identity, store records, Android release/upload key, Apple distribution signing                                                                                               |
| Account deletion               | Build and verify an account-and-associated-data deletion flow in account settings and a public web deletion resource; the existing privacy email alone is not the complete store-required flow               |
| Device verification            | Run the smoke test below on physical Android, iPhone, and iPad devices; simulator compilation is not a device runtime test                                                                                   |
| Privacy declarations           | Review actual active providers, study/account data, user-written content, phone processing, and the configured purchase SDK; complete Apple's App Privacy and Google's Data safety forms accurately          |
| Support                        | Verify the existing support inbox and ensure the support page answers app questions                                                                                                                          |
| Review access                  | Prepare a dedicated reviewer account if private features need authentication; never publish credentials in this repository                                                                                   |
| Films                          | Publish media with appropriate rights, accurate passages, titles, and companion study; keep unreleased stories marked coming soon                                                                            |
| Paid plans, if included        | Final owner-approved prices and product terms, Apple/Google subscription products, RevenueCat offerings/keys/server verification, sandbox purchase and restore tests, and an actual available member catalog |

Apple requires apps that offer account creation to let users initiate deletion within the app. Google requires an in-app deletion path and a web resource for deletion requests. Deletion must cover associated data and disclose any justified retention; deleting only the login is insufficient. Plan this implementation against the existing calls and scheduling data before a store submission.

## Device smoke test

- Launch from the icon; move through Home, Watch, Cinema, Study, Calls, and Your space; test Android back and iPad rotation.
- Open a published message; check playback, captions where available, fullscreen, return to the study, and the direct YouTube fallback.
- Confirm upcoming Genesis stories have no play button. An unavailable private film must not expose a storage URL.
- Sign in with a test account; complete a day and save a synthetic reflection; sign out, sign in to a different test account, and confirm the first account's private data is absent.
- Visit account settings, dashboard, written reflection, and scheduling. Do not place a real call during a navigation smoke test.
- Disconnect and reconnect. The app shell may reopen, but video, Scripture links, and account sync must report their connectivity needs accurately.
- Verify password recovery returns through the website; verified universal links remain a separate signing/domain-association task.
- After memberships are configured, use store sandbox accounts to verify purchase, restore, cancellation/expiry, rejected access, and switching accounts.

## Testing the Apple simulator package

On a Mac with the supported Xcode and an installed iOS Simulator runtime, unzip `Elroi-Calls-Apple-Simulator.zip` to obtain `App.app`. Open and boot an iPhone or iPad simulator. Drag `App.app` into the simulator, or use:

```sh
xcrun simctl install booted /absolute/path/to/App.app
xcrun simctl launch booted com.elroicall.app
```

This package is built for iOS Simulator. Installing on a real iPhone/iPad or distributing with TestFlight requires an appropriately signed device build. Android's debug APK is likewise a test artifact, not a signed Play Store Android App Bundle. Test builds may use a different debug signing key between CI runs; do not assume they can update an older debug installation.

## References

- Apple enrollment: https://developer.apple.com/programs/enroll/
- Google developer setup: https://support.google.com/googleplay/android-developer/answer/6112435
- Google personal-account testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Apple account deletion: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Google account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Apple platform version information: https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information
- Apple home-screen instructions: https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios
- Browser installation: https://web.dev/learn/pwa/installation-prompt

Implementation and membership configuration details are in [NATIVE_APP.md](NATIVE_APP.md).

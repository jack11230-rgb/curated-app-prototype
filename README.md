# Curated Mental Health — Patient App Prototype

> **Prototype · demo data only · not for real patient use.**
> Every name, appointment, message, bill, and chart detail is fictional (patient "Jordan Rivera").
> There is no backend: nothing is sent anywhere, and AdvancedMD is not connected.

This is a clickable, mobile-first PWA of the Curated Mental Health patient app concept.
It's a static site in `public/`, with no build step needed.

## What's clickable
- Fake Face ID sign-in, then Home, Visits, Journal, Messages and Profile tabs.
- Booking (service, location, provider, day and time) through to a confirmation.
- Spravato / Deep TMS interest card, Explore, treatment pages, and discovery-call booking.
- Session Mode: live 2-hour countdown, playlists, Now Playing, a volume cap (60%), a sleep timer, guided breathing (box, 4-7-8, coherent), and reading guides with a reader.
- Journal: mood and feelings entries saved to `localStorage` on the device, quick one-tap mood, a thought record, and insights.
- Safety plan with real crisis links: `tel:988`, `sms:988`, `sms:741741?body=HOME`.
- Forms, messages, billing (with the ride reminder), profile, and telehealth.
- Spotify, YouTube Music and Apple Music show "Coming soon" (not connected).
- Add to Home Screen via `manifest.webmanifest` and the icons.

## Audio
- `public/audio/g1.mp3`: Erik Satie, *Gymnopédie No. 1*, performed by Teknopazzo. Wikimedia Commons, CC0 / public domain.
- `public/audio/g3.mp3`: Erik Satie, *Gymnopédie No. 3*, performed by Teknopazzo. Wikimedia Commons, CC0 / public domain.
- "Warm Drift", "Low Tide Drone" and "Tidewater" are generated live in the browser with the Web Audio API. No recordings are used for these.

## Run locally
    python3 -m http.server 8765 -d public

## Deploy
This runs as a Render static site: build command `echo ok`, publish path `public`.

`tools/` holds the generator used to assemble `public/index.html` from the original mockup sources (not included).

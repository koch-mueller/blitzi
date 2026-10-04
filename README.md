# Blitzi

Blitzi is a privacy-friendly educational web prototype that presents common lightning-protection factors through an accessible, multi-step assessment.

![Blitzi mascot](1.svg)

## About the project

The project turns a technical topic into a clear interactive experience. Users select broad building and location characteristics and receive a transparent demo score with a complete factor breakdown.

Blitzi deliberately avoids collecting an address or calling external services. The application runs entirely in the browser. The result state is passed between the local pages through the URL fragment, which is not sent to a server.

## Features

- Responsive multi-step questionnaire
- Native form validation and keyboard-friendly controls
- Transparent, versioned scoring model
- Individual factor breakdown and contextual next steps
- Local-only data processing without network requests or persistent storage
- Custom SVG illustrations and animated mascot
- No build step or third-party runtime dependency

## Technology

- Semantic HTML5
- Modern CSS
- Vanilla JavaScript
- SVG and GIF assets
- Node.js built-in test runner for optional model tests

## Run locally

No installation is required. Open `index.html` in a modern browser.

To run the optional automated tests, use a current Node.js version:

```bash
npm test
```

The test command has no package dependencies and does not require `npm install`.

## Scoring model

The score is a deliberately simplified and fully transparent heuristic for demonstration purposes. It combines broad factors such as regional thunderstorm activity, building exposure, size, construction type, use, technical equipment, and value band. A declared surge-protection measure reduces the demo score.

Every contribution is shown on the result page. The score is not a statistical probability and is not suitable for engineering, legal, insurance, or construction decisions.

## Privacy

- No address or precise location is requested.
- No analytics, cookies, APIs, proxies, or external CDNs are used.
- Assessment data remains in the browser and is encoded only in the URL fragment after submission.
- No result is written to cookies, local storage, or a remote service.

## Disclaimer

Blitzi is a university and portfolio prototype. It does not determine whether a lightning-protection system is required, recommended, or legally mandated. A qualified professional must assess the individual building and the applicable regulations.

## Project structure

```text
index.html          Landing page
stepwizard.html     Multi-step assessment
ergebnis.html       Transparent result view
styles.css          Shared responsive design
model.js            Validation and scoring model
app.js              Wizard interaction
results.js          Result rendering
1.svg–3.svg         Mascot illustrations
4.GIF               Animated result mascot
tests/              Dependency-free model tests
```

## License

All SVG illustrations and the animated GIF were created by the project authors specifically for Blitzi.

No open-source license is granted. All rights are reserved by the project authors.

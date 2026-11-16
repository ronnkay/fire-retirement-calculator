# FIREPath — FIRE Retirement Calculator

An interactive, responsive retirement calculator covering seven Financial Independence, Retire Early (FIRE) strategies:

- Traditional FIRE
- Lean FIRE
- Fat FIRE
- Chubby FIRE
- Barista FIRE
- Coast FIRE
- Slow FIRE

## Features

- Switch between seven FIRE strategies.
- Enter current age, target retirement age, investments, monthly contributions, and retirement spending.
- Adjust expected annual return, withdrawal rate, and inflation assumptions.
- Calculate an estimated FIRE number and projected FIRE age.
- View current and projected progress toward the target.
- See a canvas-based investment growth chart.
- Calculate a Coast FIRE checkpoint.
- Responsive layout for desktop, tablet, and mobile.
- No framework, build process, API key, or backend required.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser.

For a local development server, you can use the VS Code Live Server extension, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `fire-retirement-calculator`.
2. Upload `index.html`, `styles.css`, `script.js`, and this README to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site. The published URL will appear in the Pages settings.

## Calculation notes

- The FIRE target is calculated as annual retirement spending divided by the selected withdrawal rate.
- Lean FIRE, Fat FIRE, and Chubby FIRE use editable-in-code illustrative spending multipliers of 0.70x, 2.00x, and 1.50x respectively.
- Barista FIRE subtracts expected annual part-time income from annual retirement spending, with a minimum spending gap of zero.
- Coast FIRE discounts the target portfolio back to today using the assumed annual investment return and years until the target retirement age.
- Slow FIRE uses a 3.5% withdrawal rate in this implementation.
- Portfolio projections compound monthly using an equivalent monthly rate derived from the annual return.
- The inflation slider is displayed as an assumption but is not separately applied to projections. Spending is treated as today's dollars.
- This is a simplified educational model. It does not model taxes, fees, changing returns, Social Security, pensions, healthcare costs, or sequence-of-returns risk.

## Disclaimer

This project is for educational purposes only and is not financial, tax, or investment advice. The 4% rule and other withdrawal assumptions are not guarantees of future results.

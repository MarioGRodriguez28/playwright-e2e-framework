# playwright-e2e-framework

[![E2E](https://github.com/MarioGRodriguez28/playwright-e2e-framework/actions/workflows/e2e.yml/badge.svg)](https://github.com/MarioGRodriguez28/playwright-e2e-framework/actions/workflows/e2e.yml)

A small end-to-end and API test framework built with Playwright and TypeScript. It is the structure I reach for when a team needs a suite it can trust: page objects, fixtures, tagged suites and a pipeline that tells you quickly what broke and why.

It runs against two public demo targets so anyone can clone it and run it with no setup:

- **UI:** [Sauce Demo](https://www.saucedemo.com), a demo shop (login, catalogue, cart, checkout). The credentials used are the ones published on its login page for testing.
- **API:** [JSONPlaceholder](https://jsonplaceholder.typicode.com), a fake REST API.

## Run it

```bash
npm install
npx playwright install chromium
npm test              # everything: 22 UI tests + 11 API tests
npm run test:smoke    # only the tests tagged @smoke
npm run test:ui       # UI project only
npm run test:api      # API project only
npm run report        # open the last HTML report
```

Targets can be changed without touching the code:

```bash
UI_BASE_URL=https://staging.example.com API_BASE_URL=https://api.example.com npm test
```

## How it is organised

```
pages/        one page object per screen: locators and actions, no assertions about business rules
fixtures/     custom fixtures (page objects injected into tests, a ready-made signed-in session) and test data
tests/ui/     browser tests: login, inventory (sorting), cart and checkout
tests/api/    API tests with Playwright's request client: schema, CRUD, filters and negative cases
.github/      the CI pipeline
```

A few decisions worth knowing about:

- **Tests read like the behaviour they check.** The specs call `loginPage.login(...)` or `signedIn.addToCart(...)`; selectors live only in the page objects, so a UI change is fixed in one place.
- **Only the login tests use the login screen.** Everything else starts from a `signedIn` fixture that seeds the session cookie. It is faster and a broken login page does not take down the whole suite.
- **Stable selectors.** Locators use `data-test` attributes through `getByTestId`, not CSS classes or text that marketing can change.
- **Edge cases, not only the happy path.** Missing fields at checkout, locked-out users, protected pages without a session, unknown ids and malformed ids on the API.
- **`@smoke` tags.** The critical paths (sign in, add to cart, complete a purchase, read and create over the API) are tagged so a pull request gets fast feedback while the full suite runs on `main` and every night.
- **Business assertions, not just "it loaded".** One test recomputes the order total from subtotal and tax; the API tests check the response schema and the effect of PUT versus PATCH.

## The pipeline

`.github/workflows/e2e.yml`:

| Trigger | What runs |
|---|---|
| Pull request | Typecheck, then the `@smoke` tests |
| Push to `main` | Typecheck, then the full suite |
| Weekdays at 05:00 UTC | Typecheck, then the full suite, to catch regressions that nobody pushed |
| Manual | Choose `full`, `smoke`, `ui` or `api` |

On every run the HTML report, traces, screenshots and videos of failures are uploaded as artifacts, with retries enabled in CI so a one-off network blip does not turn the build red. Concurrent runs on the same branch cancel the older one.

## Stability

The full suite was run five times in a row (165 test executions) with no failures before this was published.

## More of my work

This is one of several public projects. The others (an API auditor, an API test suite, a test helpers library and k6 load tests) are indexed in [qa-portfolio-docs](https://github.com/MarioGRodriguez28/qa-portfolio-docs) and on [mariogrodriguez.com](https://mariogrodriguez.com).

## Notes

This is public-demo work, not client code. I keep client projects private. If you want to see how I would set this up for your product, or review a suite that already exists, you can reach me through [mariogrodriguez.com](https://mariogrodriguez.com).

## License

MIT

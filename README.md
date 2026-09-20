# IronFit Manager

Build a responsive web app called "IronFit" — a gym ownership and member-retention dashboard for a single gym owner. Mobile-first, but must look clean and information-dense on desktop too (sidebar on desktop, bottom tabs on mobile).

I'm attaching my cleaned CSV data: Members, Plans, Memberships, Attendance, FollowUps, Payments, Settings. Use these tables directly.

SCREEN 1 — Owner Dashboard: today's check-in count, total active members, memberships expiring within 7 days, pending payments, and count of red-list members (no check-in for 10+ days, threshold from Settings.Inactivity Trigger Days).

SCREEN 2 — Red List / Follow-up Queue: members inactive 10+ days (exclude Frozen/Paused). Show name, phone, days inactive, plan, last follow-up. A "Call" button and outcome selector (Will return / Injured / Travelling / Timing issue / No response / Cancelled).

SCREEN 3 — Member Detail: plan, membership start/end dates, freeze days, last check-in, visit history, follow-up history, payment history and status. Panels on desktop, tabs on mobile.

SCREEN 4 — QR Check-in: a screen where a member ID is entered or scanned; if membership is active and check-in is not a duplicate, show "Check-in successful" with member name and validity date; otherwise show a clear error.

Style: clean card-based UI, red highlight for follow-up needed, green for Active, amber for expiring soon, gray for Frozen. Link all tables by Member ID and Plan ID. No trainer, diet, or AI features — only these 4 screens.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ecbf9e5-73e1-4f92-8a20-98e216cecc35).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

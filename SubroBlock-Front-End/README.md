## About

Main goal of app is insurance arbitration. One person's car gets damaged by another person's car. The app will help to calculate the damage and provide a report to the insurance company.

Process: admin create organization with attached root user, make offer, 2 users with key sign the offer, responder makes response and also signs it. If after 3 attempts can't agree on price - third part arbitration must happen

12.06.2024: It was a pleasure to work here. Nice team, client, great manager, nice backend guys 

Implemented: auth, admin create root, root create users. They create offer. Root creates keys, assigns to users. Users create and sign the offers. Another team creates response and signs it. For now that's it.

Planned: store sensitive data in blockchain, train AI on it, let AI arbitrate offers if needed. Invlove real money

Tech stack: Next.js, React, TypeScript, Tailwind, shadcn, Vercel, nextauth, react-chart-js-2, zod, zustand, husky, storybook

Backend: Python Django

## Run app

First, configure the environment variables. Copy [`.env.example`](./.env.example) to `.env` and fill in the required fields.

run the development server
```bash
npm i && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting
- Q: Requests fail
- A: Make sure you have [`.env`](./.env.example) file in root folder. Or copy [`.env.example`](./.env.example) to `.env` and fill in the required fields.

- Q: click on file upload won't open file dialog
- A: Make sure you have the latest version of your browser. If you are using Safari, make sure you have enabled the developer menu and checked the "Disable Local File Restrictions" option.

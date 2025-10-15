# Gaming Admin Portal

React-based administrative interface for the Elite Gaming platform. The app lets internal teams manage configuration, monitor transactions, and perform operational tasks against the backend services.

## Tech Stack

- React 18 with Create React App
- Tailwind CSS for styling
- Axios for API communication

## Prerequisites

- Node.js 18 LTS (or newer) and npm
- Access to the Elite backend API

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an `.env` file (or update the existing one) with the required variables. The project currently expects keys such as:
   - `REACT_APP_API_URL` – base URL for the backend (e.g. `https://api.example.com`)
   - `REACT_APP_PLATFORM_NAME`, `REACT_APP_DEFAULT_CURRENCY`, feature flags, etc.
3. Start the development server:
   ```bash
   npm start
   ```

The app runs on <http://localhost:3000> by default. Development builds proxy requests to the API URL defined in your environment file.

## Available Scripts

- `npm start` – run the development server with hot reloading
- `npm run build` – generate a production build in `build/`
- `npm test` – execute the CRA test runner
- `npm run eject` – expose CRA configuration (irreversible)

## Deployment

Deployment scripts for different environments live in the repo:

- `deploy.sh` – production deployment workflow
- `staging_deploy.sh` – staging deployment workflow

Review and adjust these scripts before running them so they point at the correct infrastructure.

## Additional Notes

- Tailwind configuration lives in `tailwind.config.js`; update it to adjust theming.
- If you introduce new environment variables, remember to document them and keep real secrets out of version control.

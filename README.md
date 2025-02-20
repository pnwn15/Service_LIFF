SERVICE_LIFF

This project integrates with the LINE Front-end Framework (LIFF) and includes various components and API services. It is built using Next.js.
Table of Contents

- Installation
- Environment Variables
- Folder Structure
- Components
- API Routes
- License

Installation

Clone the repository:

    git clone https://github.com/Mini3oy/Service_LIFF.git

Navigate to the project directory:

    cd SERVICE_LIFF

Install the dependencies:

    npm install

Copy the .env.example file to .env.local and fill in the required values:

    cp .env.example .env.local

Run the development server:

    npm run dev

Environment Variables

In the .env.local file, you will need to configure the following environment variables:

    NEXT_PUBLIC_LIFF_ID=your-liff-id
    NEXT_PUBLIC_API_URL=your-api-url
    JWT_SECRET=your-jwt-secret

These variables are essential for the LIFF integration and securing the API routes with JWT.
Folder Structure

```
SERVICE_LIFF/
├── src/
│   ├── api/
│   │ ├── gen-token/
│   │ ├── sign-out/
│   │ └── route.js
│   ├── login/
│   │ └── page.jsx
│   ├── profile/
│   │ └── page.jsx
│   ├── QR-test/
│   ├── task/
│   ├── components/
│   │ ├── LIFF/
│   │ ├── Bottom-Nav.jsx
│   │ ├── EquipmentTable.jsx
│   │ ├── Job-Card.jsx
│   │ └── ...
│   ├── layout.js
│   ├── loading.js
│   ├── not-found.js
│   └── page.js
├── lib/
│   └── middleware.ts
├── .env.example
├── .eslintrc.json
└── .gitignore
```

    api/: Contains API routes like gen-token and sign-out for handling user tokens.
    login/ and profile/: Pages for user login and profile management.
    components/: Reusable UI components like Bottom-Nav, EquipmentTable, and more.
    lib/: Utility functions such as middleware for authentication.

Components

    LIFFContext.jsx - Provides the LIFF context to manage the LIFF app integration.
    LiffProvider.jsx - A provider component for the LIFF context.
    Bottom-Nav.jsx - A component that handles the bottom navigation in the app.
    EquipmentTable.jsx - Displays equipment data in a table format.
    Job-Card.jsx - Component to show job details in a card format.

API Routes

    gen-token/route.js - Handles generating tokens for users.
    sign-out/route.js - API endpoint for logging out users.

License

This project is licensed under the MIT License.

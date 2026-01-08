# ROG Folkvang Boss Watch

This is a Next.js application built in Firebase Studio that provides real-time boss timers for the game "Legend of Ymir". It uses Firebase Firestore to synchronize timers across all users.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm (Node Package Manager) installed on your system. The error "npm: The term 'npm' is not recognized" indicates that Node.js and npm are likely not installed.

You can download and install them from the official Node.js website: [https://nodejs.org/](https://nodejs.org/). We recommend installing the LTS (Long-Term Support) version.

After installation, you can verify that `npm` is installed by opening a new terminal or command prompt and running:
```sh
npm -v
```
This should print the installed version number of npm.

### Installation

1.  **Download the project files:** Download the source code to your local machine.

2.  **Navigate to the project directory:**
    Open your terminal or command prompt and change into the project's root directory.
    ```sh
    cd path/to/your/project
    ```

3.  **Install dependencies:**
    Run the following command to install all the required packages listed in `package.json`.
    ```sh
    npm install
    ```

### Running the Local Development Server

Once the installation is complete, you can start the Next.js development server.

```sh
npm run dev
```

This will start the application in development mode with Turbopack. By default, it will be available at [http://localhost:9002](http://localhost:9002). Open this URL in your web browser to see the application.

Any changes you make to the source code will automatically reload the application in the browser.

## Firebase Configuration

This project is configured to connect to a Firebase project to provide real-time database functionality using Firestore.

-   **Firebase Configuration:** The connection details for the Firebase project are located in `src/firebase/config.ts`.
-   **Authentication:** The application uses Firebase's anonymous authentication, so users don't need to create accounts. A new anonymous user is created automatically for each visitor.
-   **Firestore Rules:** The security rules for the Firestore database are defined in `firestore.rules`. These rules control who can read or write data. Currently, they are configured to allow any authenticated user to read and write boss timers.

## Deployment to GitHub Pages

You can deploy this application to GitHub Pages by following these steps.

### 1. Push to GitHub

Push your code to a GitHub repository. The workflow file included in `.github/workflows/deploy.yml` will automatically trigger.

### 2. Configure Repository Settings

1.  In your GitHub repository, go to **Settings > Pages**.
2.  Under the "Build and deployment" section, change the **Source** from "Deploy from a branch" to **"GitHub Actions"**.

### 3. Wait for Deployment

The GitHub Action will now run. You can monitor its progress in the "Actions" tab of your repository. Once the "deploy" job completes successfully, your site will be live at the URL provided on the Pages settings screen (e.g., `https://<your-username>.github.io/<your-repo-name>/`).

**Note:** If you are deploying to a repository named `<username>.github.io`, you will need to remove the `basePath` from `next.config.js`. If you are deploying to a project page (`<username>.github.io/<repo-name>`), you may need to set `basePath: '/<repo-name>'` in `next.config.ts` if assets do not load correctly. The current setup attempts to work without `basePath` by using relative paths.

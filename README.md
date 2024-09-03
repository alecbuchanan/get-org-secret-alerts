# get-org-secret-alerts
![CodeQL](https://github.com/alecbuchanan/get-org-secret-alerts/workflows/CodeQL/badge.svg)

This project fetches secret scanning alerts for a specified GitHub organization and writes the results to a CSV file.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Fine-Grained GitHub personal access token with "Secret scanning alerts" repository permissions (read) with access against your target Organization

## Setup

1. **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/get-org-secret-alerts.git
    cd get-org-secret-alerts
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Create a `.env` file**:
    Create a `.env` file in the root directory of the project and add your GitHub personal access token and organization name:
    ```sh
    GITHUB_TOKEN=your-github-token
    GITHUB_ORG=your-github-org
    ```

4. **Update `.gitignore`**:
    Ensure your `.env` file and other unnecessary files are ignored by Git:
    ```sh
    .env
    node_modules/
    dist/
    build/
    *.log
    .DS_Store
    Thumbs.db
    *.tmp
    *.swp
    output.csv
    ```

## Running the Application

To run the application, execute the following command:
```sh
node getOrgSecretAlerts.js

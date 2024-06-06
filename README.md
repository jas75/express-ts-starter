# Express TypeScript Starter 🚀

A basic template for backend projects using Express.js, TypeScript and PostgreSQL.

## 📋 Requirements

- Node.js (version 12.x.x or higher)
- NPM 
- PostgreSQL

## 🛠️ Features

- **TypeScript**: Writing server-side JavaScript with TypeScript.
- **Express.js**: Framework for building web applications and RESTful APIs.
- **Build scripts**: Development and production build scripts.
- **Nodemon**: Automatically restarts the server in development mode.
- **Swagger Documentation**: Generates interactive API documentation using Swagger.
- **Environment management**: Utilizes Dotenv for managing environment variables.
- **Docker**: Containerization for easy deployment and scalability.
- **ESLint & Prettier Integration**: Enforce code style and formatting conventions.
- **Rate Limiter**: Integrated rate limiter for API request throttling.
- **PostgreSQL Integration**: Database integration using PostgreSQL.
- **Authentication with Passport**: User authentication setup with Passport.
- **Database Migrations**: Manage database schema changes with `db-migrate`.
- **Concurrently**: Runs multiple commands concurrently

## 🚀 Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/express-ts-starter.git
    ```

2. Navigate to the project directory:

    ```bash
    cd express-ts-starter
    ```

3. Install dependencies:

    ```bash
    npm install
    ```
4. Create a PostgreSQL database.

5. Create a `.env` file at the root of the project by copying the `.env.template` file and updating the values as needed.

6. Run the database migrations to set up the schema:

    ```bash
    npm run migrate:up
    ```

7. Run the server:

     ```bash
    # Development mode
    npm run dev

    # Production mode
    npm run build
    npm run start:prod
    ```

8. Access the API at `http://localhost:3000`.

## 📖 Documentation

- **Swagger Documentation**: Visit `http://localhost:3000/api-doc` to explore the API documentation.

### 🧪 Running Tests

To run tests:

```bash
npm run test
```

If a database `app_name`_test doesn't exist, it will be created automatically.

## 🔒 Security

Ensure to manage secrets and sensitive data securely, even though Dotenv is used. Do not expose them in your Git repository.
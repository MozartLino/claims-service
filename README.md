# Clean Architecture Template – AWS CDK v2 + TypeScript

🚀 A starter template for building **serverless applications** with **AWS CDK v2**, **TypeScript**, **Lambda (Middy)**, **API Gateway**, and **DynamoDB**, following **Clean Architecture** principles.

It comes with **testing, linting, commit hooks, and schema validation** out of the box.

---

## ✨ Features

- **AWS CDK v2** – Infrastructure as Code.
- **API Gateway + Lambda (Middy)** – Decoupled presentation layer.
- **DynamoDB** – Serverless persistence.
- **Clean Architecture** – Clear separation into layers (domain, application, infrastructure, presentation).
- **Zod** – Input validation and type-safe schemas.
- **Jest** – Unit testing with full coverage.
- **ESLint + Prettier** – Code linting and formatting.
- **Husky** – Pre-commit hooks.

---

## 📂 Project Structure

```
.
├── iac/                 # CDK v2 infrastructure code
├── src
│   ├── domain/          # Entities, business rules, domain errors
│   ├── application/     # Use cases (services)
│   ├── infrastructure/  # Repositories, DynamoDB integration
│   ├── presentation/    # Lambda handlers (Middy), middlewares, DTOs
├── tests/               # Unit and integration tests
├── package.json
└── tsconfig.json
```

---

## ⚡ Requirements

- Node.js >= 20
- AWS CLI configured  
- CDK v2:

## 🛠️ Setup

Install dependencies:

```bash
npm install
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```
---

## 🚀 Deploy

Synthesize the stack:

```bash
npm run synth -- -c environment={dev|stg|prod}
```

Deploy to AWS:

```bash
npm run deploy -- -c environment={dev|stg|prod}
```

---

## 📜 License

MIT License

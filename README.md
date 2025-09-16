# Claims Ingestion API – AWS CDK v2 + TypeScript

🚀 A serverless API for ingesting and querying **healthcare claims** data, built with **AWS CDK v2**, **TypeScript**, **Lambda (Middy)**, **API Gateway**, and **DynamoDB**, following **Clean Architecture** principles.

This project was implemented as a take-home assignment and demonstrates end-to-end design of ingestion, validation, persistence, and querying of structured CSV data.

---

## ✨ Features

- **AWS CDK v2** – Infrastructure as Code.
- **API Gateway + Lambda (Middy)** – Presentation layer.
- **DynamoDB** – Persistence with GSI for querying by member and date range.
- **CSV Ingestion** – Parse, validate, and store claims.
- **Domain-driven validation** – Business rules enforced at entity level.
- **Clean Architecture** – Separation into domain, application, infrastructure, and presentation layers.
- **Zod** – Input validation and type-safe schemas.
- **Jest** – Unit testing with coverage on services, repositories, and handlers.
- **ESLint + Prettier** – Code linting and formatting.
- **Husky** – Pre-commit hooks.

---

## 📂 Project Structure

```
.
├── iac/                 # CDK v2 infrastructure code (API Gateway, Lambdas, DynamoDB)
├── src
│   ├── domain/          # Entities (Claim), validations, domain errors
│   ├── application/     # Services (ClaimsService), use cases
│   ├── infrastructure/  # Repositories (ClaimsRepository), DynamoDB integration
│   ├── presentation/    # Lambda handlers, DTOs, middlewares
├── tests/               # Unit tests for domain, services, repos, handlers
├── package.json
└── tsconfig.json
```

---

## ⚡ Requirements

- Node.js >= 20  
- AWS CLI configured  
- AWS CDK v2 installed  

---

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

## 📖 Endpoints

- **POST /claims** – Upload CSV of claims, parse and store in DynamoDB.  
- **GET /claims** – Query claims by `memberId`, `startDate`, `endDate`.  
- **GET /claims/{id}** – Retrieve a single claim by ID.  

---

## 🧪 Tests

- **Domain** – Validations for `Claim` (required fields, dates, amounts, etc.).  
- **Application** – `ClaimsService` with CSV ingestion, queries, and error handling.  
- **Infrastructure** – `ClaimsRepository` with DynamoDB integration and error mapping.  
- **Presentation** – Handlers with mocked services and responses.  

---

## 💡 Future Improvements

- Async ingestion pipeline: `API Gateway → Lambda → S3 → SQS → Lambda → DynamoDB`.  
- Observability: metrics, dashboards, alerts.  
- Pagination in query endpoints.

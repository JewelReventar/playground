# ⚡ Serverless Monorepo with Serverless Compose

This project uses the **Serverless Framework with Serverless Compose** to manage a modular, microservice-oriented backend architecture. Each service is isolated, reusable, and independently deployable — while sharing core components like database logic, utility functions, and provider SDKs.

---

## 📁 Directory Structure

```

├── databases/ # Repositories and base logic for databases
│ ├── dynamodb/
│ │ ├── _base.ts # Base repository logic for DynamoDB (reusable)
│ │ └── UserRepository.ts
│
├── lib/ # Common utilities and shared logic
│ ├── helpers/
│ ├── parsers/
│ └── exceptions/
│
├── models/ # Data models per database type
│ ├── dynamodb/
│ │ └── UserTable.ts
│
├── providers/ # SDK wrappers and integration logic
│ ├── aws/ # AWS-native service wrappers (e.g., SQS, SNS)
│ │ └── sqs.ts
│ ├── external/ # Integrations with 3rd-party APIs
│ │ └── hookbin.ts
│ └── internal/ # Internal service-to-service wrappers
│ └── user-service.ts
│
├── services/ # Microservices managed via Serverless Compose
│ ├── user-service/
│ │ └── serverless.yml
│ └── auth-service/
│ └── serverless.yml
│
└── serverless-compose.yml # Root configuration for all services
```

## 🧱 Modular Architecture

This repository is structured to support **separation of concerns** and **maximum reusability**:

- **`databases/`** – Centralized database interaction layer using the Repository pattern. Base classes provide reusable methods (`get`, `put`, `scan`, etc.), and are extended per data model.
- **`lib/`** – Shared utility functions, error handling, parsers, and helpers used across services.

- **`models/`** – Typed schema definitions or ORM/ODM models used in database logic and validation layers.

- **`providers/`** – All integrations are wrapped in clean, testable classes, split into:

  - `aws/` – AWS SDK logic (SQS, SNS, SES, etc.)
  - `external/` – 3rd-party integrations
  - `internal/` – Internal service-to-service communication logic

- **`services/`** – Each subdirectory is a standalone Serverless service (function app) with its own lifecycle and `serverless.yml`. These are composed and orchestrated using `serverless-compose.yml`.

## 🧩 Services Directory Structure

Each service inside the `services/` folder is a standalone **Serverless Framework** application managed under `serverless-compose.yml`. The structure supports clean separation of concerns for scalability and maintainability.

---

### 📄 `serverless.yml`

Defines the configuration for the service, including:

- Runtime (Node.js, Python, etc.)
- Memory, timeout, and CPU settings
- Environment variables
- Lambda functions (HTTP, Cron, Queue, etc.)
- Resource definitions (SQS, IAM, etc.)

Example path: **services/user-service/serverless.yml**

---

### 📂 `app/` - Service Application Logic

This is where the core logic of each service lives.

#### 📂 `app/controller/` - Lambda Business Logic Layer

- Business logic layer.
- One controller per domain entity or feature.

Example path: **app/controller/UserController.ts**

### 📂 `app/handlers/` – Lambda Routing Layer

This directory contains all Lambda function entry points. It acts as the **routing layer**, connecting incoming events (HTTP, SQS, Cron) to controller methods.

##### `http/`

HTTP-based Lambda handlers, organized per entity.

```
app/handlers/http/
├── user/
│   ├── create.ts
│   └── update.ts
├── role/
│   ├── create.ts
│   └── delete.ts
```

##### `http/_rules`

- Validation logic using **Joi**.
- users.ts, roles.ts, etc. define per-entity schemas.
- **validate.ts** provides middleware for runtime validation.

##### `queue/`

- Handlers for processing SQS queue events.

Example path: **queue/main-queue.ts**

##### `cron/`

- Scheduled Lambda functions using CloudWatch Events (cron jobs).

Example: **cron/initiateHappyBirthday.ts**

##### `_interfaces/`

- Shared TypeScript interfaces for handler request types.

### 📂 `tests/unit/` – Unit Testing

- Contains unit tests for the service. Test coverage includes controllers and utilities structured to mirror the application layout.

---

## 🚀 Getting Started

Follow these steps to set up your local development.

### ✅ Configure AWS CLI

Make sure you have **AWS CLI v2** installed.

- [https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### ✅ Configure Serverless Framework

Run the following command from the project root directory to install shared dependencies:

```bash
npm install -g serverless
```

Afterwards configure your serverless framework workspace and store your **SERVERLESS_ACCESS_KEY** within your machine

- [https://www.serverless.com/]

### ✅ Install Package Dependencies

Run the following command from the project root directory to install shared dependencies:

```bash
npm install
```

## 🧪 Running Scripts & Tests

This repository uses `npm` scripts at both the **root** level and within individual **service directories**.

### 🔍 Root-Level Commands

Run the following commands from the project root to perform global checks:

```bash
# Run ESLint across the codebase
npm run lint

# Perform TypeScript type-checking without emitting output
npm run type-check

```

These scripts validate shared code (e.g. lib/, models/, databases/, providers/) and ensure consistency before deployment.

### 🧪 Running Unit Tests per Service

```bash
cd services/user-service
npm run test:unit  # Run unit tests
```

## 🚀 Deploying with Serverless Compose

This project uses the **Serverless Framework** with **Serverless Compose** to manage and deploy multiple services.

### 📦 How to deploy

First adjust the `org:` variable in `serverless-compose.yml` to your registered workspace

```yml
org: { your-serverless-workspace-org }

stages:
  default:
    params:
      project: playground
      org: ${self:org}
      environment: ${opt:stage, 'dev'}
      region: ${opt:region, 'ap-southeast-1'}
      ssmPrefix: ${param:project}/${param:environment}
```

To deploy all services defined in `serverless-compose.yml`, run:

```bash
serverless deploy --region {region} --stage {stage} --aws-profile {profile}
# e.g. serverless-deploy --region ap-southeast-1 --stage dev --aws-profile my-profile
```

To deploy a single service in `serverless-compose.yml`, run:

```bash
serverless deploy --region {region} --stage {stage} --aws-profile {profile} --service={service-name}

# e.g. serverless-deploy --region ap-southeast-1 --stage dev --aws-profile my-profile --service=user-service
```

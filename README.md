# 🏗️ Playground Infrastructure & Backend

This repository separates **infrastructure provisioning** and **Lambda function deployment** for clarity and flexibility.

---

## 📂 Directory Overview

### [`playground/infra`](./playground/infra)

- 📦 **What it does:**  
  Manages and provisions AWS infrastructure using **Terraform** (e.g., VPCs, IAM roles, SQS, DynamoDB, etc.).

- 🚀 **Must be deployed first** before deploying the backend.

---

### [`playground/backend`](./playground/backend)

- ⚙️ **What it does:**  
  Contains **Serverless Framework** configuration and source code for deploying **Lambda functions only**.

- 🎯 Designed to rely on infrastructure created by `playground/infra`.

---

## 🚀 Deployment Order

> 🔐 **IMPORTANT:** You must deploy `infra` before `backend`.

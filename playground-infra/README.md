# 🛠 Playground IaC

This project uses **Terraform** to provision and manage AWS infrastructure across multiple environments (`dev`, `staging`, `beta`, `prod`). This guide explains the setup, directory structure, and how to deploy.

---

## 📦 Requirements

### ✅ AWS CLI v2

- **Installation Guide:**  
  [https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### ✅ Terraform CLI

- **Installation Guide:**  
  [https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)

## 📦 Directory Structure

```
├── environments/
│   ├── dev/
│   ├── staging/
│   ├── beta/
│   └── prod/
└── modules/
│   ├── vpc/
│   ├── lambda-config/
│   ├── ddb-models/
│   └── sqs/
│   └── external-ssm/

```

### environments/

Environment-specific directories. Each contains Terraform code and state specific to a single environment. This separation allows independent deployments and configurations.

ℹ️ Each environment has its own Terraform state file.

### modules/

Reusable Terraform modules, such vpc, sqs, etc... These modules are imported and used within each environment but are not deployed directly.

⚠️ Never run Terraform commands inside the modules/ directory.

### implemented modules

#### ddb-models

This module defines the DynamoDB tables used across the application. It contains two tables:

#### 1. `message-log-table`

- **Purpose:**  
  Logs all executed messages for auditing, tracing, and analytics.

- **Primary Keys:**

  - `pk` (Partition Key): Message Identifier (e.g., `app:message:birthday:<user-uuid>`)
  - `sk` (Sort Key): Year delivered (e.g. 2025)

- **Example Item Schema:**
  ```json
  {
    "pk": "app:message:birthday:<user-uuid>",
    "sk": "2025",
    "messageId": "Happy Birthday User!",
    "status": "success",
    "sentAt": "2025-01-01 00:00:00"
  }
  ```

#### 2. `users-table`

- **Purpose:**  
  Stores user profile and metadata used for personalization, birthday reminders, time zone logic, etc.

- **Primary Keys:**

  - `pk` (Partition Key): Identifer (e.g., `app:user`)
  - `sk` (Sort Key): UUID (e.g. xxxx-xxxx-xxxx-xxxx)

- **Example Item Schema:**

  ```json
  {
    "pk": "app:user",
    "sk": "xxxx-xxxx-xxxx-xxxx",
    "firstName": "Jane",
    "lastName": "Doe",
    "birthday": "1995-07-15",
    "timezone": "Asia/Manila",
    "createdAt": "2025-01-01 00:00:00",
    "updatedAt": "2025-01-01 00:00:00"
  }
  ```

#### lambda-config

This module defines the configurations for the lambda function application, currently this contains config for IAM role and policies specific for lambda function only

#### sqs

This module defines SQS queues the we'll be utilizing for the application. Currently we are only using 1 queue which is named **main-queue** with default configurations

#### external-ssm

This module defines SSM parameter creation for external variables that we want to use for the application. Currently this contains the **hookbin** API url.

#### vpc

_Parked feature..._

## 🚀 Deployment Workflow

Follow the steps below to deploy infrastructure to a specific environment using Terraform:

### 1. Navigate to the target environment

_If you create a new environment e.g. sandbox make sure it contains `main.tf` and `variables.tf` file_

```
environments/
├── sandbox/
│   ├── main.tf
│   └── variables.tf
```

To properly define your target region, profile etc... adjust the `variables.tf`

```
variable "project_name" {
  type    = string
  default = "{your-project-name}"
}
variable "aws_profile" {
  type    = string
  default = "{your-aws-profile}"
}
variable "environment" {
  type    = string
  default = "{your-environment}"
}
variable "region" {
  type    = string
  default = "{your-aws-region}"
}
```

### 2. Deployment Steps

```bash
cd environments/<env>  # Example: cd environments/dev

terraform init # Initialize terraform modules and providers

terraform plan # Verify services to be provisioned

terraform apply # Provisions defined modules

terraform destroy # Run this if you wish to deprovision your services
```

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  common = {
    project_name = var.project_name
    environment  = var.environment

    region = var.region
  }
}

# Configure the AWS Provider
provider "aws" {
  region                   = var.region
  shared_credentials_files = ["~/.aws/credentials"]
  profile                  = var.aws_profile
}

module "lambda-config" {
  source = "../../modules/lambda-config"
  common = local.common
  # lambda_config = {
  #   # vpc_id = module.vpc.vpc_id
  # }
}

module "ddb-models" {
  source = "../../modules/ddb-models"
  common = local.common
}

module "sqs" {
  source = "../../modules/sqs"
  common = local.common
}

module "external-ssm" {
  source = "../../modules/external-ssm"
  common = local.common
  external_variables = {
    hookbin_base_url = "https://eoy227k2keuibj0.m.pipedream.net"
  }
}

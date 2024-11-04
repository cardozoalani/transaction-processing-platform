variable "region" {
  type    = string
  default = "us-east-2"
}

variable "access_key" {
  default = "mock_access_key"
}

variable "secret_key" {
  default = "mock_secret_key"
}

provider "aws" {
  region = var.region
  access_key = var.access_key
  secret_key = var.secret_key
  endpoints {
    sqs       = "http://localhost:4566"
    lambda    = "http://localhost:4566"
    dynamodb  = "http://localhost:4566"
    iam = "http://localhost:4566"
  }
  skip_credentials_validation = true
  skip_requesting_account_id  = true
}
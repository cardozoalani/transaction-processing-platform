provider "aws" {
  region                      = var.region
  endpoints {
    sqs       = "http://localhost:4566"
    lambda    = "http://localhost:4566"
    dynamodb  = "http://localhost:4566"
  }
}
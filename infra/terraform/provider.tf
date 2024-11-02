provider "aws" {
  region                      = var.region
  endpoints {
    sqs       = "http://localstack.transactions.local"
    lambda    = "http://localstack.transactions.local"
    dynamodb  = "http://localstack.transactions.local"
  }
}
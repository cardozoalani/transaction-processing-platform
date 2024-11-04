variable "queue_name" {
  default = "transaction-queue"
}

variable "dynamodb_table_name" {
  default = "TransactionTable"
}

variable "lambda_function_name" {
  default = "TransactionProcessor"
}

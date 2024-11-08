output "sqs_queue_url" {
  value = aws_sqs_queue.transaction_queue.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.transaction_table.name
}

output "dynamodb_table_name_accounts" {
  value = aws_dynamodb_table.accounts_table.id
}

output "lambda_function_name" {
  value = aws_lambda_function.transaction_processor.function_name
}

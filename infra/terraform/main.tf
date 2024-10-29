resource "aws_sqs_queue" "transaction_queue" {
  name = "transaction-queue"
}

resource "aws_dynamodb_table" "transaction_table" {
  name           = "TransactionTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "transactionId"

  attribute {
    name = "transactionId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }
}

resource "aws_lambda_function" "transaction_processor" {
  function_name = "TransactionProcessor"
  filename      = "lambda.zip"
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  source_code_hash = filebase64sha256("lambda.zip")

  environment {
    variables = {
      QUEUE_URL      = aws_sqs_queue.transaction_queue.id
      DYNAMODB_TABLE = aws_dynamodb_table.transaction_table.name
    }
  }

  depends_on = [aws_sqs_queue.transaction_queue, aws_dynamodb_table.transaction_table]
}

resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.transaction_queue.arn
  function_name    = aws_lambda_function.transaction_processor.arn
  batch_size       = 10
}

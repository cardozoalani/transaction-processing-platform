resource "aws_iam_role" "lambda_role" {
  name = "lambda_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name   = "lambda_policy"
  role   = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Effect   = "Allow"
        Resource = aws_sqs_queue.transaction_queue.arn
      }
    ]
  })
}

resource "aws_sqs_queue" "transaction_queue" {
  name = "transaction-queue"
}

resource "aws_lambda_function" "transaction_processor" {
  function_name = "TransactionProcessor"
  filename      = "${path.module}/../lambda/lambda.zip"
  handler       = "complianceHandler.handler"
  runtime       = "nodejs14.x"
  source_code_hash = filebase64sha256("${path.module}/../lambda/lambda.zip")

  environment {
    variables = {
      QUEUE_URL         = "http://localstack.default.svc.cluster.local:4566/000000000000/transaction-queue"
      DYNAMODB_ENDPOINT = "http://localstack.default.svc.cluster.local:4566"
      SQS_ENDPOINT      = "http://localstack.default.svc.cluster.local:4566"
      AWS_REGION        = "us-east-1"
    }
  }

  role = aws_iam_role.lambda_role.arn
  timeout = 15
  depends_on = [ aws_sqs_queue.transaction_queue, aws_iam_role.lambda_role, aws_iam_role_policy.lambda_policy ]
}

resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.transaction_queue.arn
  function_name    = aws_lambda_function.transaction_processor.arn
  batch_size       = 10
}

resource "aws_dynamodb_table" "accounts_table" {
  name           = "AccountsTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "accountId"

  attribute {
    name = "accountId"
    type = "S"
  }

  tags = {
    Name        = "AccountsTable"
    Environment = "development"
  }
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
    name = "accountId"
    type = "S"
  }

  global_secondary_index {
    name               = "AccountIdIndex"
    hash_key           = "accountId"
    projection_type    = "ALL"
    read_capacity      = 5
    write_capacity     = 5
  }

  tags = {
    Name        = "TransactionsTable"
    Environment = "development"
  }
}

resource "aws_iam_role" "account_service_role" {
  name = "account_service_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "account_service_dynamodb_policy" {
  name = "AccountServiceDynamoDBPolicy"
  role = aws_iam_role.account_service_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.accounts_table.arn,
          aws_dynamodb_table.transaction_table.arn,
          "${aws_dynamodb_table.transaction_table.arn}/index/AccountIdIndex"
        ]
      }
    ]
  })
}

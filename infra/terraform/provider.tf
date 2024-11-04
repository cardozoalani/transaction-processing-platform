variable "region" {
  type    = string
  default = "us-east-2"
}

provider "aws" {
  region = var.region
}

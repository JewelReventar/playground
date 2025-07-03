resource "aws_ssm_parameter" "sqs_main_queue_url" {
  name        = "/${var.common.project_name}/${var.common.environment}/sqs/main-queue/url"
  description = "SQS Main Queue URL"
  type        = "String"
  value       = aws_sqs_queue.main_queue.url
  tags = {
    Environment      = var.common.environment
    Project          = var.common.project_name
    TerraformManaged = true
  }
}
resource "aws_ssm_parameter" "sqs_main_queue_arn" {
  name        = "/${var.common.project_name}/${var.common.environment}/sqs/main-queue/arn"
  description = "SQS Main Queue ARN"
  type        = "String"
  value       = aws_sqs_queue.main_queue.arn
  tags = {
    Environment      = var.common.environment
    Project          = var.common.project_name
    TerraformManaged = true
  }
}

resource "aws_sqs_queue" "main_queue" {
  name                        = "${var.common.project_name}-${var.common.environment}-main-queue"
  fifo_queue                  = false
  content_based_deduplication = false

  visibility_timeout_seconds = 30
  message_retention_seconds  = 345600
  delay_seconds              = 0

  tags = {
    Environment      = var.common.environment
    Project          = var.common.project_name
    TerraformManaged = true
  }
}

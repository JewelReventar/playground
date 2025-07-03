# SSM Parameters
# Defined project configurations
resource "aws_ssm_parameter" "hookbin_base_url" {
  name        = "/${var.common.project_name}/${var.common.environment}/hookbin/base-url"
  description = "Hookbin base URL"
  type        = "String"
  value       = var.external_variables.hookbin_base_url
}

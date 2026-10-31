import type { RegistryItem } from './schema.js';

export interface ValidationResult {
  safe: boolean;
  reason?: string;
}

export interface ItemAuditResult {
  valid: boolean;
  issues: string[];
}

export class SecurityAuditor {
  private dangerousPatterns: RegExp[] = [
    /[;&|`$]/, // Shell operators & command substitution
    /\b(rm\s+-rf|rmdir\s+\/s|del\s+\/f)\b/i,
    /\b(curl|wget|fetch)\b.*\|\s*(bash|sh|zsh|powershell|iex)/i,
    /\b(base64\s+-d|certutil\s+-decode)\b/i,
    /\b(sudo|su)\b/i,
    />\s*(\/etc\/|\/dev\/|C:\\Windows\\)/i,
  ];

  private allowedCommandPrefixes: string[] = [
    'npx -y skills add',
    'npx skills add',
    'npm install -g',
    'uv tool install',
    'brew install',
    'winget install',
    'curl -fsSL https://claude.ai/install.sh | bash',
    'irm https://claude.ai/install.ps1 | iex',
  ];

  validateInstallCommand(command: string): ValidationResult {
    const trimmed = command.trim();

    // Check against exact recognized safe commands first
    if (
      trimmed === 'curl -fsSL https://claude.ai/install.sh | bash' ||
      trimmed === 'irm https://claude.ai/install.ps1 | iex'
    ) {
      return { safe: true };
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return {
          safe: false,
          reason: `Command contains forbidden shell pattern: ${pattern.source}`,
        };
      }
    }

    // Must start with an approved prefix
    const hasAllowedPrefix = this.allowedCommandPrefixes.some((prefix) => trimmed.startsWith(prefix));
    if (!hasAllowedPrefix) {
      return {
        safe: false,
        reason: 'Command does not start with an authorized package manager prefix.',
      };
    }

    return { safe: true };
  }

  validateRepoUrl(url: string): ValidationResult {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return { safe: false, reason: 'Repository URL must use HTTPS.' };
      }
      if (!parsed.hostname.includes('github.com') && !parsed.hostname.includes('gitlab.com')) {
        return { safe: false, reason: 'Repository host must be github.com or gitlab.com.' };
      }
      return { safe: true };
    } catch {
      return { safe: false, reason: 'Invalid URL format.' };
    }
  }

  auditRegistryItem(item: RegistryItem): ItemAuditResult {
    const issues: string[] = [];

    const cmdResult = this.validateInstallCommand(item.installCommand);
    if (!cmdResult.safe) {
      issues.push(`Install command invalid: ${cmdResult.reason}`);
    }

    const urlResult = this.validateRepoUrl(item.repoUrl);
    if (!urlResult.safe) {
      issues.push(`Repository URL invalid: ${urlResult.reason}`);
    }

    if (item.trustScore < 50) {
      issues.push(`Trust score too low: ${item.trustScore}`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

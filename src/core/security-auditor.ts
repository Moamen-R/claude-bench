import type { RegistryItem } from './schema.js';

export interface ValidationResult {
  safe: boolean;
  reason?: string;
}

export interface ItemAuditResult {
  valid: boolean;
  issues: string[];
}

export const MIN_TRUST_SCORE = 50;

export class SecurityAuditor {
  private dangerousPatterns: RegExp[] = [
    /[\r\n]/, // Prevents newline-based multiline command injection
    /[;&|`$]/, // Shell operators & command substitution
    /\b(rm\s+-rf|rmdir\s+\/s|del\s+\/f)\b/i,
    /\b(curl|wget|fetch)\b.*\|\s*(bash|sh|zsh|powershell|iex)/i,
    /\b(base64\s+-d|certutil\s+-decode)\b/i,
    /\b(sudo|su)\s+/i,
    />\s*(\/etc\/|\/dev\/|C:\\Windows\\)/i,
  ];

  private allowedCommandPrefixes: string[] = [
    'npx -y skills add',
    'npx skills add',
    'npx -y @',
    'npx -y ',
    'npx ',
    'uvx ',
    'npm install -g',
    'uv tool install',
    'brew install',
    'winget install',
  ];

  validateInstallCommand(command: string): ValidationResult {
    if (!command || typeof command !== 'string') {
      return { safe: false, reason: 'Command must be a non-empty string.' };
    }

    const trimmed = command.trim();

    // Check against exact recognized safe bootstrap commands
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
    if (!url || typeof url !== 'string') {
      return { safe: false, reason: 'URL must be a non-empty string.' };
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return { safe: false, reason: 'Repository URL must use HTTPS.' };
      }
      // Exact hostname match to prevent subdomain spoofing (e.g. github.com.attacker.com)
      const allowedHosts = new Set(['github.com', 'gitlab.com']);
      if (!allowedHosts.has(parsed.hostname.toLowerCase())) {
        return { safe: false, reason: 'Repository host must be github.com or gitlab.com.' };
      }
      return { safe: true };
    } catch {
      return { safe: false, reason: 'Invalid URL format.' };
    }
  }

  auditRegistryItem(item: RegistryItem): ItemAuditResult {
    if (!item || typeof item !== 'object') {
      return { valid: false, issues: ['Item must be an object.'] };
    }

    const issues: string[] = [];

    const cmdResult = this.validateInstallCommand(item.installCommand);
    if (!cmdResult.safe) {
      issues.push(`Install command invalid: ${cmdResult.reason}`);
    }

    const urlResult = this.validateRepoUrl(item.repoUrl);
    if (!urlResult.safe) {
      issues.push(`Repository URL invalid: ${urlResult.reason}`);
    }

    const trustScore = typeof item.trustScore === 'number' ? item.trustScore : 0;
    if (trustScore < MIN_TRUST_SCORE) {
      issues.push(`Trust score ${trustScore} is below minimum required ${MIN_TRUST_SCORE}`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

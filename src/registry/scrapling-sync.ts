import fs from 'node:fs/promises';
import path from 'node:path';
import { RegistryItemSchema, type RegistryItem } from '../core/schema.js';
import { SecurityAuditor } from '../core/security-auditor.js';

export interface SyncResult {
  addedCount: number;
  rejectedCount: number;
  totalActive: number;
}

export class ScraplingSyncEngine {
  private auditor = new SecurityAuditor();

  constructor(private seedFilePath: string) {}

  async loadExisting(): Promise<RegistryItem[]> {
    try {
      const content = await fs.readFile(this.seedFilePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async mergeIncoming(incomingItems: RegistryItem[]): Promise<SyncResult> {
    const existing = await this.loadExisting();
    const existingIds = new Set(existing.map((item) => item.id));

    let addedCount = 0;
    let rejectedCount = 0;

    for (const item of incomingItems) {
      // 1. Zod Schema check
      const schemaCheck = RegistryItemSchema.safeParse(item);
      if (!schemaCheck.success) {
        rejectedCount++;
        continue;
      }

      // 2. Security Audit check
      const audit = this.auditor.auditRegistryItem(item);
      if (!audit.valid) {
        rejectedCount++;
        continue;
      }

      // 3. Deduplicate by ID
      if (!existingIds.has(item.id)) {
        existing.push(item);
        existingIds.add(item.id);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await fs.mkdir(path.dirname(this.seedFilePath), { recursive: true });
      await fs.writeFile(this.seedFilePath, JSON.stringify(existing, null, 2), 'utf8');
    }

    return {
      addedCount,
      rejectedCount,
      totalActive: existing.length,
    };
  }
}

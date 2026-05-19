import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { Lead } from '../models/Lead';
import { sendSuccess, sendError } from '../utils/response';
import {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  type LeadQuery,
} from '../validators/lead.validator';

const buildFilter = (
  query: Pick<LeadQuery, 'status' | 'source' | 'search'>,
  userId: string,
  isAdmin: boolean
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (!isAdmin) filter['createdBy'] = new mongoose.Types.ObjectId(userId);
  if (query.status) filter['status'] = query.status;
  if (query.source) filter['source'] = query.source;
  if (query.search) {
    filter['$or'] = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
};

const escapeCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}


export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createLeadSchema.parse(req.body);
    const lead = await Lead.create({
      ...parsed,
      email: parsed.email.toLowerCase(),
      createdBy: req.user!._id,
    });
    sendSuccess(res, lead, 'Lead created', 201);
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, err.issues[0]?.message ?? 'Validation error', 400);
      return;
    }
    sendError(res, 'Failed to create lead');
  }
};

export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = leadQuerySchema.parse(req.query);
    const isAdmin = req.user!.role === 'admin';
    const filter = buildFilter(query, req.user!._id, isAdmin);

    const skip = (query.page - 1) * query.limit;
    const sortOrder = query.sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(query.limit)
        .populate('createdBy', 'name email'),
      Lead.countDocuments(filter),
    ]);

    sendSuccess(res, leads, 'Leads fetched', 200, {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, err.issues[0]?.message ?? 'Invalid query parameters', 400);
      return;
    }
    sendError(res, 'Failed to fetch leads');
  }
};

export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const filter: Record<string, unknown> = { _id: req.params['id'] as string };
    if (!isAdmin) filter['createdBy'] = req.user!._id;

    const lead = await Lead.findOne(filter).populate('createdBy', 'name email');
    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }
    sendSuccess(res, lead);
  } catch {
    sendError(res, 'Failed to fetch lead');
  }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateLeadSchema.parse(req.body);
    const isAdmin = req.user!.role === 'admin';
    const filter: Record<string, unknown> = { _id: req.params['id'] as string };
    if (!isAdmin) filter['createdBy'] = req.user!._id;

    const update = {
      ...parsed,
      ...(parsed.email ? { email: parsed.email.toLowerCase() } : {}),
    };

    const lead = await Lead.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }
    sendSuccess(res, lead, 'Lead updated');
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, err.issues[0]?.message ?? 'Validation error', 400);
      return;
    }
    sendError(res, 'Failed to update lead');
  }
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params['id'] as string);
    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }
    sendSuccess(res, null, 'Lead deleted');
  } catch {
    sendError(res, 'Failed to delete lead');
  }
};

export const getLeadsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const baseFilter = isAdmin ? {} : { createdBy: new mongoose.Types.ObjectId(req.user!._id) };

    const [total, byStatus] = await Promise.all([
      Lead.countDocuments(baseFilter),
      Lead.aggregate<{ _id: string; count: number }>([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const stats: Record<string, number> = { total, New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
    for (const s of byStatus) {
      if (s._id in stats) stats[s._id] = s.count;
    }

    sendSuccess(res, stats, 'Stats fetched');
  } catch {
    sendError(res, 'Failed to fetch stats');
  }
};

export const importLeadsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const csv = req.body as string;
    if (!csv || typeof csv !== 'string' || !csv.trim()) {
      sendError(res, 'No CSV data provided', 400);
      return;
    }

    const lines = csv.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      sendError(res, 'CSV must have a header row and at least one data row', 400);
      return;
    }

    const headers = parseCSVLine(lines[0]!).map((h) => h.toLowerCase().trim());
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const statusIdx = headers.indexOf('status');
    const sourceIdx = headers.indexOf('source');

    if (nameIdx === -1 || emailIdx === -1 || sourceIdx === -1) {
      sendError(res, 'CSV must include Name, Email, and Source columns', 400);
      return;
    }

    const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
    const VALID_SOURCES = ['Website', 'Instagram', 'Referral'];

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]!.trim());
      const name = fields[nameIdx]?.trim() ?? '';
      const email = fields[emailIdx]?.trim().toLowerCase() ?? '';
      const rawStatus = fields[statusIdx]?.trim() ?? 'New';
      const source = fields[sourceIdx]?.trim() ?? '';

      const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : 'New';

      if (!name || !email || !source) {
        failed++;
        errors.push(`Row ${i + 1}: missing Name, Email, or Source`);
        continue;
      }
      if (!VALID_SOURCES.includes(source)) {
        failed++;
        errors.push(`Row ${i + 1}: invalid source "${source}" — must be Website, Instagram, or Referral`);
        continue;
      }

      try {
        await Lead.create({
          name,
          email,
          status: status as 'New' | 'Contacted' | 'Qualified' | 'Lost',
          source: source as 'Website' | 'Instagram' | 'Referral',
          createdBy: req.user!._id,
        });
        imported++;
      } catch (err: unknown) {
        failed++;
        errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Failed to save'}`);
      }
    }

    sendSuccess(res, { imported, failed, errors: errors.slice(0, 20) },
      `Imported ${imported} lead(s)${failed ? `, ${failed} skipped` : ''}`);
  } catch {
    sendError(res, 'Failed to import CSV');
  }
};

export const exportLeadsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = leadQuerySchema.parse(req.query);
    const isAdmin = req.user!.role === 'admin';
    const filter = buildFilter(query, req.user!._id, isAdmin);

    const sortOrder = query.sort === 'oldest' ? 1 : -1;
    const leads = await Lead.find(filter)
      .sort({ createdAt: sortOrder })
      .populate('createdBy', 'name email');

    const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
    const rows = leads.map((lead) => [
      escapeCsv(lead.name),
      escapeCsv(lead.email),
      escapeCsv(lead.status),
      escapeCsv(lead.source),
      escapeCsv(lead.createdAt.toISOString()),
    ]);

    const csv = [headers.map(escapeCsv), ...rows].map((row) => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, err.issues[0]?.message ?? 'Invalid query parameters', 400);
      return;
    }
    sendError(res, 'Failed to export leads');
  }
};

import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  importLeadsCSV,
  getLeadsStats,
} from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Static routes MUST come before /:id
router.get('/stats', getLeadsStats);
router.get('/export', exportLeadsCSV);
router.post('/import', importLeadsCSV);

router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', requireAdmin, deleteLead);

export default router;

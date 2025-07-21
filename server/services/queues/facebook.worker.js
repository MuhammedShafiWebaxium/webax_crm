import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.config.js';
import axios from 'axios';

const processFacebookLeads = async (job) => {
  const { pageId, accessToken } = job.data;
  
  try {
    // 1. Get fresh leads from Facebook API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}/leadgen_forms`,
      {
        params: {
          access_token: accessToken,
          fields: 'leads'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    // 2. Process leads
    const leads = response.data.data.flatMap(form => 
      form.leads?.data.map(lead => ({
        id: lead.id,
        form_id: form.id,
        ...lead.field_data
      })) || []
    );

    // 3. Store in DB (pseudo-code)
    await storeLeadsInDatabase(leads);

    console.log(`🔄 Synced ${leads.length} leads from Facebook`);
    return { success: true, count: leads.length };

  } catch (error) {
    console.error('Facebook leads sync failed:', {
      error: error.message,
      pageId,
      status: error.response?.status
    });
    throw error; // Will trigger retry
  }
};

// Initialize worker
export const facebookWorker = new Worker(
  'facebook-leads-queue',
  processFacebookLeads,
  {
    connection: redisConnection,
    concurrency: 3, // Process 3 jobs simultaneously
    settings: {
      lockDuration: 120000, // 2 minute job lock
      stalledInterval: 30000 // Check stalled jobs every 30s
    }
  }
);

// Event handlers
facebookWorker.on('completed', (job, result) => {
  console.log(`✅ Completed sync for page ${job.data.pageId} (${result.count} leads)`);
});

facebookWorker.on('failed', (job, err) => {
  console.error(`❌ Failed sync for page ${job?.data?.pageId}:`, err.message);
});
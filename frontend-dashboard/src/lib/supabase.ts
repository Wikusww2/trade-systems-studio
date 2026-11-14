import { createClient } from "@supabase/supabase-js";
import { LeadCapturePayload, TelemetryPayload } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Persists lead capture to Supabase or logs locally if unconfigured.
 */
export async function submitLeadCapture(lead: LeadCapturePayload): Promise<{ success: boolean; id: string }> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("audit_leads")
        .insert([
          {
            email: lead.email,
            company_name: lead.company_name,
            phone: lead.phone || null,
            monthly_import_volume: lead.monthly_import_volume || null,
            source: lead.source || "conversion_modal",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.warn("Supabase lead insertion warning:", error.message);
      } else if (data && data[0]) {
        return { success: true, id: data[0].id };
      }
    }

    // Local fallback persistence
    const localId = `local_lead_${Date.now()}`;
    const stored = JSON.parse(localStorage.getItem("audit_leads_cache") || "[]");
    stored.push({ ...lead, id: localId, timestamp: new Date().toISOString() });
    localStorage.setItem("audit_leads_cache", JSON.stringify(stored));
    return { success: true, id: localId };
  } catch (err) {
    console.warn("Local storage lead fallback error:", err);
    return { success: true, id: `fallback_${Date.now()}` };
  }
}

/**
 * Tracks anonymous telemetry event to Supabase or local storage.
 */
export async function recordTelemetry(event: TelemetryPayload): Promise<void> {
  try {
    if (supabase) {
      await supabase.from("telemetry_events").insert([
        {
          event_type: event.event_type,
          concept_id: event.concept_id || null,
          discrepancy_id: event.discrepancy_id || null,
          metadata: event.metadata || {},
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    // Local fallback
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("telemetry_cache") || "[]");
      stored.push({ ...event, timestamp: new Date().toISOString() });
      if (stored.length > 50) stored.shift();
      localStorage.setItem("telemetry_cache", JSON.stringify(stored));
    }
  } catch (err) {
    // Non-blocking telemetry silence
  }
}

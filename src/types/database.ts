// DeepLux Supabase Database Types
// Generated manually - run `supabase gen types` for auto-generation once connected

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'incomplete';
export type TrustLevel = 0 | 1 | 2 | 3;
export type PlanType = 'individual' | 'clinic' | 'bundle' | 'empresa';
export type BillingInterval = 'monthly' | 'annual' | 'lifetime' | 'free';
export type AccessLevel = 'full' | 'limited' | 'readonly' | 'none';
export type AccessSource = 'subscription' | 'seat' | 'trial' | 'manual' | 'free_tier';
export type PaymentProcessor = 'stripe' | 'conekta';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';
export type FlowType = 'clinic' | 'professional' | 'empresa';
export type EmpresaType = 'startup' | 'pyme' | 'corporativo' | 'hospital_privado' | 'aseguradora' | 'gobierno' | 'otro';
export type EmployeeCountRange = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';

export interface Database {
  public: {
    Tables: {
      user_types: {
        Row: {
          id: string;
          slug: string;
          label_es: string;
          requires_cedula: boolean;
          requires_specialty: boolean;
          default_plan_slug: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_types']['Insert']>;
      };
      professional_profiles: {
        Row: {
          id: string;
          user_id: string;
          user_type_id: string | null;
          professional_stage: string | null;
          cedula_profesional: string | null;
          cedula_especialidad: string | null;
          specialty: string | null;
          subspecialty: string | null;
          institution_affiliation: string | null;
          graduation_year: number | null;
          conacem_certified: boolean;
          conacem_expiry_year: number | null;
          trust_level: TrustLevel;
          curp: string | null;
          rfc: string | null;
          country_code: string;
          region_code: string | null;
          public_profile_slug: string | null;
          profile_photo_url: string | null;
          bio: string | null;
          is_public_profile: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['professional_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['professional_profiles']['Insert']>;
      };
      license_verifications: {
        Row: {
          id: string;
          profile_id: string;
          license_type: 'cedula_profesional' | 'cedula_especialidad' | 'conacem' | 'cofepris' | 'institutional';
          license_number: string | null;
          source: 'manual_upload' | 'sep_api' | 'conacem_api' | 'staff_review';
          status: VerificationStatus;
          evidence: Json;
          verified_at: string | null;
          verified_by: string | null;
          review_notes: string | null;
          rejection_reason: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['license_verifications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['license_verifications']['Insert']>;
      };
      clinic_profiles: {
        Row: {
          id: string;
          clinic_id: string;
          clinic_type: 'hospital' | 'clinica' | 'consultorio' | 'laboratorio' | 'rehabilitacion' | 'otro';
          cofepris_number: string | null;
          repris_number: string | null;
          rfc: string | null;
          razon_social: string | null;
          cfdi_regime: string | null;
          director_cedula: string | null;
          director_name: string | null;
          specialties: Json;
          staff_size: number | null;
          trust_level: TrustLevel;
          verification_status: VerificationStatus;
          country_code: string;
          region_code: string | null;
          website_url: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clinic_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clinic_profiles']['Insert']>;
      };
      empresa_profiles: {
        Row: {
          id: string;
          user_id: string;
          empresa_type: EmpresaType | null;
          razon_social: string | null;
          rfc: string | null;
          industry: string | null;
          employee_count_range: EmployeeCountRange | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          cargo_contacto: string | null;
          apps_interest: Json;
          num_medicos_estimado: number | null;
          website_url: string | null;
          logo_url: string | null;
          country_code: string;
          region_code: string | null;
          trust_level: TrustLevel;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['empresa_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['empresa_profiles']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          short_description: string | null;
          target_audience: 'individual' | 'clinic' | 'both';
          icon_url: string | null;
          app_url: string | null;
          color_hex: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      subscription_plans: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          plan_type: PlanType;
          billing_interval: BillingInterval;
          price_mxn_cents: number;
          price_usd_cents: number;
          price_mxn_annual_cents: number | null;
          price_usd_annual_cents: number | null;
          max_seats: number | null;
          stripe_price_id: string | null;
          stripe_price_id_annual: string | null;
          conekta_plan_id: string | null;
          conekta_plan_id_annual: string | null;
          features: Json;
          grace_period_days: number;
          trial_days: number;
          is_featured: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          subscriber_type: 'user' | 'clinic';
          user_id: string | null;
          clinic_id: string | null;
          plan_id: string;
          status: SubscriptionStatus;
          billing_interval: 'monthly' | 'annual' | 'free';
          trial_ends_at: string | null;
          grace_period_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          payment_processor: PaymentProcessor | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          conekta_subscription_id: string | null;
          conekta_customer_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      subscription_seats: {
        Row: {
          id: string;
          subscription_id: string;
          user_id: string;
          assigned_at: string;
          assigned_by: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['subscription_seats']['Row'], 'id' | 'assigned_at'>;
        Update: Partial<Database['public']['Tables']['subscription_seats']['Insert']>;
      };
      user_product_access: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          has_access: boolean;
          access_level: AccessLevel;
          access_source: AccessSource;
          subscription_id: string | null;
          expires_at: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_product_access']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_product_access']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          subscription_id: string;
          user_id: string | null;
          clinic_id: string | null;
          amount_cents: number;
          currency: string;
          tax_cents: number;
          subtotal_cents: number | null;
          status: 'pending' | 'paid' | 'failed' | 'refunded' | 'voided';
          payment_processor: PaymentProcessor | null;
          processor_invoice_id: string | null;
          processor_charge_id: string | null;
          cfdi_uuid: string | null;
          cfdi_serie: string | null;
          cfdi_folio: string | null;
          cfdi_pdf_url: string | null;
          cfdi_xml_url: string | null;
          cfdi_requested_at: string | null;
          cfdi_issued_at: string | null;
          cfdi_facturapi_id: string | null;
          period_start: string | null;
          period_end: string | null;
          billing_name: string | null;
          billing_rfc: string | null;
          billing_address: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      onboarding_sessions: {
        Row: {
          id: string;
          user_id: string;
          flow_id: string | null;
          user_type: FlowType;
          current_step: number;
          total_steps: number;
          completed_steps: Json;
          form_data: Json;
          selected_user_type_slug: string | null;
          selected_plan_slug: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['onboarding_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['onboarding_sessions']['Insert']>;
      };
      webhook_events: {
        Row: {
          id: string;
          processor: PaymentProcessor;
          event_id: string;
          event_type: string;
          payload: Json;
          status: 'received' | 'processing' | 'processed' | 'failed' | 'skipped';
          error_message: string | null;
          retry_count: number;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['webhook_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['webhook_events']['Insert']>;
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          before: Json | null;
          after: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      clinic_financials: {
        Row: {
          id: string;
          clinic_id: string;
          entry_type: 'income' | 'expense';
          category: string;
          amount_mxn_cents: number;
          description: string | null;
          reference_date: string;
          created_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clinic_financials']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clinic_financials']['Insert']>;
      };
      profile_completion_tasks: {
        Row: {
          id: string;
          user_type_id: string | null;
          task_key: string;
          label_es: string;
          description_es: string | null;
          unlocks_action: string | null;
          is_required: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profile_completion_tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profile_completion_tasks']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      recompute_user_product_access: {
        Args: { p_user_id: string };
        Returns: void;
      };
      is_clinic_admin: {
        Args: { p_clinic_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience type aliases
export type UserType = Database['public']['Tables']['user_types']['Row'];
export type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row'];
export type ClinicProfile = Database['public']['Tables']['clinic_profiles']['Row'];
export type LicenseVerification = Database['public']['Tables']['license_verifications']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionSeat = Database['public']['Tables']['subscription_seats']['Row'];
export type UserProductAccess = Database['public']['Tables']['user_product_access']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type OnboardingSession = Database['public']['Tables']['onboarding_sessions']['Row'];
export type WebhookEvent = Database['public']['Tables']['webhook_events']['Row'];
export type AuditLog = Database['public']['Tables']['audit_log']['Row'];
export type ProfileCompletionTask = Database['public']['Tables']['profile_completion_tasks']['Row'];
export type ClinicFinancial = Database['public']['Tables']['clinic_financials']['Row'];
export type EmpresaProfile = Database['public']['Tables']['empresa_profiles']['Row'];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_usage: {
        Row: {
          app_name: string
          created_at: string
          duration_minutes: number
          id: string
          last_used: string | null
          package_name: string | null
          times_opened: number
          usage_date: string
          user_id: string
        }
        Insert: {
          app_name: string
          created_at?: string
          duration_minutes?: number
          id?: string
          last_used?: string | null
          package_name?: string | null
          times_opened?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          app_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          last_used?: string | null
          package_name?: string | null
          times_opened?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_apps: {
        Row: {
          app_name: string
          blocked_at: string
          child_id: string
          created_at: string
          id: string
          is_blocked: boolean
          package_name: string | null
          parent_id: string
        }
        Insert: {
          app_name: string
          blocked_at?: string
          child_id: string
          created_at?: string
          id?: string
          is_blocked?: boolean
          package_name?: string | null
          parent_id: string
        }
        Update: {
          app_name?: string
          blocked_at?: string
          child_id?: string
          created_at?: string
          id?: string
          is_blocked?: boolean
          package_name?: string | null
          parent_id?: string
        }
        Relationships: []
      }
      danger_zones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          incident_type: string
          latitude: number
          longitude: number
          severity: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type: string
          latitude: number
          longitude: number
          severity?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type?: string
          latitude?: number
          longitude?: number
          severity?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          resolved_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      family_connections: {
        Row: {
          child_id: string | null
          connection_code: string | null
          created_at: string | null
          id: string
          parent_id: string | null
          status: string | null
        }
        Insert: {
          child_id?: string | null
          connection_code?: string | null
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
        }
        Update: {
          child_id?: string | null
          connection_code?: string | null
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      geofence_alerts: {
        Row: {
          child_id: string
          created_at: string
          event_type: string
          id: string
          is_read: boolean
          message: string
          parent_id: string
          safe_zone_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          event_type: string
          id?: string
          is_read?: boolean
          message: string
          parent_id: string
          safe_zone_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          event_type?: string
          id?: string
          is_read?: boolean
          message?: string
          parent_id?: string
          safe_zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_alerts_safe_zone_id_fkey"
            columns: ["safe_zone_id"]
            isOneToOne: false
            referencedRelation: "safe_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          location_latitude: number
          location_longitude: number
          safe_zone_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          location_latitude: number
          location_longitude: number
          safe_zone_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          location_latitude?: number
          location_longitude?: number
          safe_zone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_events_safe_zone_id_fkey"
            columns: ["safe_zone_id"]
            isOneToOne: false
            referencedRelation: "safe_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      parental_controls: {
        Row: {
          bedtime_end: string | null
          bedtime_mode_enabled: boolean | null
          bedtime_start: string | null
          child_id: string | null
          created_at: string | null
          id: string
          location_tracking_enabled: boolean | null
          parent_id: string | null
          school_mode_enabled: boolean | null
          school_mode_end: string | null
          school_mode_start: string | null
          screen_time_limit: number | null
          social_media_blocked: boolean | null
          updated_at: string | null
        }
        Insert: {
          bedtime_end?: string | null
          bedtime_mode_enabled?: boolean | null
          bedtime_start?: string | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          location_tracking_enabled?: boolean | null
          parent_id?: string | null
          school_mode_enabled?: boolean | null
          school_mode_end?: string | null
          school_mode_start?: string | null
          screen_time_limit?: number | null
          social_media_blocked?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bedtime_end?: string | null
          bedtime_mode_enabled?: boolean | null
          bedtime_start?: string | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          location_tracking_enabled?: boolean | null
          parent_id?: string | null
          school_mode_enabled?: boolean | null
          school_mode_end?: string | null
          school_mode_start?: string | null
          screen_time_limit?: number | null
          social_media_blocked?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          emergency_contact: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safe_zones: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          notify_on_entry: boolean
          notify_on_exit: boolean
          parent_id: string
          radius_meters: number
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          notify_on_entry?: boolean
          notify_on_exit?: boolean
          parent_id: string
          radius_meters?: number
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          notify_on_entry?: boolean
          notify_on_exit?: boolean
          parent_id?: string
          radius_meters?: number
          updated_at?: string
        }
        Relationships: []
      }
      screen_time_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      screen_time_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          accuracy: number | null
          battery_level: number | null
          id: string
          latitude: number
          longitude: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          battery_level?: number | null
          id?: string
          latitude: number
          longitude: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          battery_level?: number | null
          id?: string
          latitude?: number
          longitude?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

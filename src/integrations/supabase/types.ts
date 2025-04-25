export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_models: {
        Row: {
          accuracy: number
          created_at: string | null
          description: string | null
          id: string
          last_trained: string
          name: string
          type: string | null
          version: string
        }
        Insert: {
          accuracy: number
          created_at?: string | null
          description?: string | null
          id?: string
          last_trained: string
          name: string
          type?: string | null
          version: string
        }
        Update: {
          accuracy?: number
          created_at?: string | null
          description?: string | null
          id?: string
          last_trained?: string
          name?: string
          type?: string | null
          version?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          message: string
          port_id: string
          severity: string | null
          start_time: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          message: string
          port_id: string
          severity?: string | null
          start_time: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          message?: string
          port_id?: string
          severity?: string | null
          start_time?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      congestion_predictions: {
        Row: {
          confidence: number
          created_at: string | null
          estimated_duration: number
          id: string
          level: string | null
          model_used: string
          port_id: string
          timestamp: string
        }
        Insert: {
          confidence: number
          created_at?: string | null
          estimated_duration: number
          id?: string
          level?: string | null
          model_used: string
          port_id: string
          timestamp?: string
        }
        Update: {
          confidence?: number
          created_at?: string | null
          estimated_duration?: number
          id?: string
          level?: string | null
          model_used?: string
          port_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "congestion_predictions_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      delay_prediction_factors: {
        Row: {
          created_at: string | null
          factor: string
          id: string
          impact: number
          prediction_id: string
        }
        Insert: {
          created_at?: string | null
          factor: string
          id?: string
          impact: number
          prediction_id: string
        }
        Update: {
          created_at?: string | null
          factor?: string
          id?: string
          impact?: number
          prediction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delay_prediction_factors_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "delay_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      delay_predictions: {
        Row: {
          confidence_level: number
          created_at: string | null
          id: string
          model_used: string
          port_id: string
          predicted_delay: number
          timestamp: string
        }
        Insert: {
          confidence_level: number
          created_at?: string | null
          id?: string
          model_used: string
          port_id: string
          predicted_delay: number
          timestamp?: string
        }
        Update: {
          confidence_level?: number
          created_at?: string | null
          id?: string
          model_used?: string
          port_id?: string
          predicted_delay?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "delay_predictions_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      ports: {
        Row: {
          code: string
          country: string
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          size: string | null
        }
        Insert: {
          code: string
          country: string
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          size?: string | null
        }
        Update: {
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          size?: string | null
        }
        Relationships: []
      }
      shipping_data: {
        Row: {
          avg_wait_time: number
          congestion_level: string | null
          created_at: string | null
          delayed_vessels: number
          id: string
          port_id: string
          timestamp: string
          vessel_count: number
        }
        Insert: {
          avg_wait_time: number
          congestion_level?: string | null
          created_at?: string | null
          delayed_vessels: number
          id?: string
          port_id: string
          timestamp?: string
          vessel_count: number
        }
        Update: {
          avg_wait_time?: number
          congestion_level?: string | null
          created_at?: string | null
          delayed_vessels?: number
          id?: string
          port_id?: string
          timestamp?: string
          vessel_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipping_data_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          created_at: string | null
          humidity: number
          id: string
          port_id: string
          precipitation: number
          temperature: number
          timestamp: string
          visibility: number
          wave_height: number | null
          weather_type: string | null
          wind_direction: number
          wind_speed: number
        }
        Insert: {
          created_at?: string | null
          humidity: number
          id?: string
          port_id: string
          precipitation: number
          temperature: number
          timestamp?: string
          visibility: number
          wave_height?: number | null
          weather_type?: string | null
          wind_direction: number
          wind_speed: number
        }
        Update: {
          created_at?: string | null
          humidity?: number
          id?: string
          port_id?: string
          precipitation?: number
          temperature?: number
          timestamp?: string
          visibility?: number
          wave_height?: number | null
          weather_type?: string | null
          wind_direction?: number
          wind_speed?: number
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

import type { PaneSnapshot } from '@/stores/tabStore';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      analytics_filters: {
        Row: {
          created_at: string;
          filter_name: string;
          folder_paths: string[];
          id: number;
          operator: 'and' | 'or';
          repo_key: string;
        };
        Insert: {
          created_at?: string;
          filter_name: string;
          folder_paths: string[];
          id?: number;
          operator?: 'and' | 'or';
          repo_key: string;
        };
        Update: {
          created_at?: string;
          filter_name?: string;
          folder_paths?: string[];
          id?: number;
          operator?: 'and' | 'or';
          repo_key?: string;
        };
        Relationships: [];
      };
      note_views: {
        Row: {
          file_path: string;
          id: number;
          last_viewed_at: string;
          repo_key: string;
          view_count: number;
        };
        Insert: {
          file_path: string;
          id?: number;
          last_viewed_at?: string;
          repo_key: string;
          view_count?: number;
        };
        Update: {
          file_path?: string;
          id?: number;
          last_viewed_at?: string;
          repo_key?: string;
          view_count?: number;
        };
        Relationships: [];
      };
      vault_settings: {
        Row: {
          opened_tabs: PaneSnapshot | null;
          repo_key: string;
          sidebar_folders: string[];
          updated_at: string;
        };
        Insert: {
          opened_tabs?: PaneSnapshot | null;
          repo_key: string;
          sidebar_folders?: string[];
          updated_at?: string;
        };
        Update: {
          opened_tabs?: PaneSnapshot | null;
          repo_key?: string;
          sidebar_folders?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

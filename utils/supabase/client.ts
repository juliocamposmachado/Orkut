import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          photo_url: string | null
          status: string | null
          age: number | null
          location: string | null
          relationship_status: string | null
          birthday: string | null
          bio: string | null
          profile_views: number
          join_date: string
          last_active: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_url?: string | null
          status?: string | null
          age?: number | null
          location?: string | null
          relationship_status?: string | null
          birthday?: string | null
          bio?: string | null
          profile_views?: number
          join_date?: string
          last_active?: string
        }
        Update: {
          id?: string
          user_id?: string
          photo_url?: string | null
          status?: string | null
          age?: number | null
          location?: string | null
          relationship_status?: string | null
          birthday?: string | null
          bio?: string | null
          profile_views?: number
          join_date?: string
          last_active?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          post_type: string
          community_id: string | null
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          post_type?: string
          community_id?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          post_type?: string
          community_id?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
      }
      scraps: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          content: string
          created_at: string
          is_public: boolean
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          content: string
          created_at?: string
          is_public?: boolean
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          content?: string
          created_at?: string
          is_public?: boolean
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          creator_id: string
          image_url: string | null
          members_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          creator_id: string
          image_url?: string | null
          members_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          creator_id?: string
          image_url?: string | null
          members_count?: number
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: number
          title: string
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          created_at?: string
        }
      }
    }
  }
}

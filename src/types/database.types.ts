export interface UserProfile {
  id: string;
  user_id?: string;
  created_at: string;
  email?: string;
  full_name?: string;
  onboarding_completed?: boolean;
  department?: string;
  career_goal?: string;
  experience_level?: string;
  profile_image?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
    };
  };
}

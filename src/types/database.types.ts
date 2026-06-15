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

export interface ResumeTemplate {
  id: string;
  name: string;
  ats_score: number;
  recommended_role: string;
  best_for: string[];
  layout_type: string; // 'Single Column' | 'Two Column'
  page_length: string; // 'One Page' | 'Two Page' | 'Flexible'
  recruiter_rating: number; // 1-5
  created_at?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  category: string;
  role: string;
  template_id: string | null;
  template_version: string;
  status: string; // 'draft' | 'completed'
  resume_data?: any; // JSONB fields
  created_at: string;
  updated_at: string;
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
      resume_templates: {
        Row: ResumeTemplate;
        Insert: ResumeTemplate;
        Update: Partial<ResumeTemplate>;
      };
      resumes: {
        Row: Resume;
        Insert: Omit<Resume, 'id' | 'created_at' | 'updated_at' | 'status' | 'template_version' | 'template_id' | 'resume_data'> & {
          id?: string;
          template_id?: string | null;
          template_version?: string;
          status?: string;
          resume_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Resume>;
      };
    };
  };
}

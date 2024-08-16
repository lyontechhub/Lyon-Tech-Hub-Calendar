import { SupabaseClient } from '@supabase/supabase-js';

import { Calendar } from '../domain/Calendar';

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: number;
        };
        Insert: {
          id: number;
        };
        Update: {
          id: number;
        };
      };
    };
  };
}

export class CalendarPersistance {
  constructor(client: SupabaseClient<Database>) {}

  save(calendar: Calendar) {}
}

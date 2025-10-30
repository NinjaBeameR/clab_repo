export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      computers: {
        Row: {
          id: string
          name: string
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          student_id: string
          section: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          student_id: string
          section?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          student_id?: string
          section?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      allocations: {
        Row: {
          id: string
          student_id: string
          computer_id: string
          allocated_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          computer_id: string
          allocated_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          computer_id?: string
          allocated_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Computer = Database['public']['Tables']['computers']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Allocation = Database['public']['Tables']['allocations']['Row']

export interface ComputerWithCount extends Computer {
  student_count: number
}

export interface StudentWithComputer extends Student {
  computer_name: string | null
  computer_id: string | null
}

export interface AllocationWithDetails extends Allocation {
  student: Student
  computer: Computer
}

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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          password_hash: string
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          password_hash: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          password_hash?: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      assignment_questions: {
        Row: {
          assignment_id: string
          correct_answer: string | null
          created_at: string | null
          explanation: string | null
          id: string
          marks: number
          options: Json | null
          order_number: number
          question_text: string
          question_type: string
          rubric: string | null
          time_limit_seconds: number | null
        }
        Insert: {
          assignment_id: string
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json | null
          order_number: number
          question_text: string
          question_type: string
          rubric?: string | null
          time_limit_seconds?: number | null
        }
        Update: {
          assignment_id?: string
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json | null
          order_number?: number
          question_text?: string
          question_type?: string
          rubric?: string | null
          time_limit_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignment_eligible_students"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "assignment_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignment_type: string
          auto_grade_mcq: boolean | null
          created_at: string | null
          deadline: string
          description: string | null
          duration_minutes: number | null
          graded_count: number | null
          id: string
          instructions: string | null
          late_penalty_percentage: number | null
          late_submission_allowed: boolean | null
          max_attempts: number | null
          rubric_enabled: boolean | null
          section: string
          semester: string
          status: string
          subject_id: string | null
          submission_count: number | null
          teacher_id: string
          title: string
          total_marks: number
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string
          auto_grade_mcq?: boolean | null
          created_at?: string | null
          deadline: string
          description?: string | null
          duration_minutes?: number | null
          graded_count?: number | null
          id?: string
          instructions?: string | null
          late_penalty_percentage?: number | null
          late_submission_allowed?: boolean | null
          max_attempts?: number | null
          rubric_enabled?: boolean | null
          section: string
          semester: string
          status?: string
          subject_id?: string | null
          submission_count?: number | null
          teacher_id: string
          title: string
          total_marks?: number
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string
          auto_grade_mcq?: boolean | null
          created_at?: string | null
          deadline?: string
          description?: string | null
          duration_minutes?: number | null
          graded_count?: number | null
          id?: string
          instructions?: string | null
          late_penalty_percentage?: number | null
          late_submission_allowed?: boolean | null
          max_attempts?: number | null
          rubric_enabled?: boolean | null
          section?: string
          semester?: string
          status?: string
          subject_id?: string | null
          submission_count?: number | null
          teacher_id?: string
          title?: string
          total_marks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_assignments_subject"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assignments_teacher"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          present: boolean
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          present?: boolean
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          present?: boolean
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "assignment_eligible_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          assignment_id: string | null
          attendees: Json | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          live_class_id: string | null
          location: string | null
          notes: string | null
          priority: string | null
          recurring_end_date: string | null
          recurring_pattern: string | null
          reminder_minutes: number | null
          start_date: string
          status: string | null
          subject_id: string | null
          teacher_id: string
          title: string
          updated_at: string
          week_number: number | null
        }
        Insert: {
          all_day?: boolean | null
          assignment_id?: string | null
          attendees?: Json | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          live_class_id?: string | null
          location?: string | null
          notes?: string | null
          priority?: string | null
          recurring_end_date?: string | null
          recurring_pattern?: string | null
          reminder_minutes?: number | null
          start_date: string
          status?: string | null
          subject_id?: string | null
          teacher_id: string
          title: string
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          all_day?: boolean | null
          assignment_id?: string | null
          attendees?: Json | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          live_class_id?: string | null
          location?: string | null
          notes?: string | null
          priority?: string | null
          recurring_end_date?: string | null
          recurring_pattern?: string | null
          reminder_minutes?: number | null
          start_date?: string
          status?: string | null
          subject_id?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
          week_number?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          credits: number | null
          department_id: string | null
          duration: string | null
          id: string
          name: string
          semester: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          credits?: number | null
          department_id?: string | null
          duration?: string | null
          id?: string
          name: string
          semester: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number | null
          department_id?: string | null
          duration?: string | null
          id?: string
          name?: string
          semester?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          established_year: number | null
          head_name: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          established_year?: number | null
          head_name?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          established_year?: number | null
          head_name?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          created_at: string | null
          from_email: string | null
          from_name: string | null
          id: string
          resend_api_key: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          updated_at: string | null
          use_smtp: boolean | null
        }
        Insert: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          resend_api_key?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string | null
          use_smtp?: boolean | null
        }
        Update: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          resend_api_key?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string | null
          use_smtp?: boolean | null
        }
        Relationships: []
      }
      live_class_attendance: {
        Row: {
          duration_minutes: number | null
          id: string
          joined_at: string | null
          left_at: string | null
          live_class_id: string
          status: string | null
          student_id: string
        }
        Insert: {
          duration_minutes?: number | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          live_class_id: string
          status?: string | null
          student_id: string
        }
        Update: {
          duration_minutes?: number | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          live_class_id?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_live_class_attendance_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "assignment_eligible_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_live_class_attendance_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_class_attendance_live_class_id_fkey"
            columns: ["live_class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_classes: {
        Row: {
          attendance_recorded: boolean | null
          class_date: string
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          max_participants: number | null
          meeting_id: string | null
          meeting_link: string
          meeting_password: string | null
          notes: string | null
          platform: string
          recording_link: string | null
          reminder_sent: boolean | null
          section: string
          semester: string
          start_time: string
          status: string
          subject_id: string | null
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendance_recorded?: boolean | null
          class_date: string
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          max_participants?: number | null
          meeting_id?: string | null
          meeting_link: string
          meeting_password?: string | null
          notes?: string | null
          platform: string
          recording_link?: string | null
          reminder_sent?: boolean | null
          section: string
          semester: string
          start_time: string
          status?: string
          subject_id?: string | null
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendance_recorded?: boolean | null
          class_date?: string
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          max_participants?: number | null
          meeting_id?: string | null
          meeting_link?: string
          meeting_password?: string | null
          notes?: string | null
          platform?: string
          recording_link?: string | null
          reminder_sent?: boolean | null
          section?: string
          semester?: string
          start_time?: string
          status?: string
          subject_id?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_live_classes_subject"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_live_classes_teacher"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_configuration: {
        Row: {
          created_at: string
          id: string
          max_assignment_marks: number
          max_internal_marks: number
          max_practical_marks: number
          max_total_marks: number | null
          section: string
          semester: string
          subject_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_assignment_marks?: number
          max_internal_marks?: number
          max_practical_marks?: number
          max_total_marks?: number | null
          section: string
          semester: string
          subject_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_assignment_marks?: number
          max_internal_marks?: number
          max_practical_marks?: number
          max_total_marks?: number | null
          section?: string
          semester?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      marks_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_assignment_marks: number | null
          new_internal_marks: number | null
          new_practical_marks: number | null
          previous_assignment_marks: number | null
          previous_internal_marks: number | null
          previous_practical_marks: number | null
          reason: string | null
          student_marks_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_assignment_marks?: number | null
          new_internal_marks?: number | null
          new_practical_marks?: number | null
          previous_assignment_marks?: number | null
          previous_internal_marks?: number | null
          previous_practical_marks?: number | null
          reason?: string | null
          student_marks_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_assignment_marks?: number | null
          new_internal_marks?: number | null
          new_practical_marks?: number | null
          previous_assignment_marks?: number | null
          previous_internal_marks?: number | null
          previous_practical_marks?: number | null
          reason?: string | null
          student_marks_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_history_student_marks_id_fkey"
            columns: ["student_marks_id"]
            isOneToOne: false
            referencedRelation: "student_marks"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message_id: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_id: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_id?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_important: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          message_type: string
          recipient_filters: Json | null
          recipient_id: string | null
          recipient_type: string | null
          scheduled_at: string | null
          sender_id: string
          sender_type: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          message_type?: string
          recipient_filters?: Json | null
          recipient_id?: string | null
          recipient_type?: string | null
          scheduled_at?: string | null
          sender_id: string
          sender_type: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          message_type?: string
          recipient_filters?: Json | null
          recipient_id?: string | null
          recipient_type?: string | null
          scheduled_at?: string | null
          sender_id?: string
          sender_type?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      question_grades: {
        Row: {
          feedback: string | null
          graded_at: string | null
          graded_by: string
          id: string
          points_awarded: number
          question_id: string
          submission_id: string
        }
        Insert: {
          feedback?: string | null
          graded_at?: string | null
          graded_by: string
          id?: string
          points_awarded?: number
          question_id: string
          submission_id: string
        }
        Update: {
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string
          id?: string
          points_awarded?: number
          question_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_grades_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assignment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          notes: string | null
          priority: string | null
          reminder_minutes: number | null
          start_date: string
          status: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          priority?: string | null
          reminder_minutes?: number | null
          start_date: string
          status?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          priority?: string | null
          reminder_minutes?: number | null
          start_date?: string
          status?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_marks: {
        Row: {
          assignment_marks: number | null
          created_at: string
          id: string
          internal_marks: number | null
          practical_marks: number | null
          section: string
          semester: string
          student_id: string
          subject_id: string
          teacher_id: string
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          assignment_marks?: number | null
          created_at?: string
          id?: string
          internal_marks?: number | null
          practical_marks?: number | null
          section: string
          semester: string
          student_id: string
          subject_id: string
          teacher_id: string
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          assignment_marks?: number | null
          created_at?: string
          id?: string
          internal_marks?: number | null
          practical_marks?: number | null
          section?: string
          semester?: string
          student_id?: string
          subject_id?: string
          teacher_id?: string
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          answers: Json
          assignment_id: string
          attempt_number: number
          auto_graded_score: number | null
          file_attachments: Json | null
          graded_at: string | null
          graded_by: string | null
          grading_status: string
          id: string
          is_late: boolean | null
          manual_graded_score: number | null
          penalty_applied: number | null
          started_at: string | null
          student_id: string
          submitted_at: string | null
          teacher_feedback: string | null
          time_taken_minutes: number | null
          total_score: number | null
        }
        Insert: {
          answers?: Json
          assignment_id: string
          attempt_number?: number
          auto_graded_score?: number | null
          file_attachments?: Json | null
          graded_at?: string | null
          graded_by?: string | null
          grading_status?: string
          id?: string
          is_late?: boolean | null
          manual_graded_score?: number | null
          penalty_applied?: number | null
          started_at?: string | null
          student_id: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
        }
        Update: {
          answers?: Json
          assignment_id?: string
          attempt_number?: number
          auto_graded_score?: number | null
          file_attachments?: Json | null
          graded_at?: string | null
          graded_by?: string | null
          grading_status?: string
          id?: string
          is_late?: boolean | null
          manual_graded_score?: number | null
          penalty_applied?: number | null
          started_at?: string | null
          student_id?: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_submissions_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "assignment_eligible_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_student_submissions_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignment_eligible_students"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "student_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string
          enrollment_date: string | null
          id: string
          login_id: string
          mobile: string
          name: string
          password_hash: string
          profile_picture_url: string | null
          section: string
          semester: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email: string
          enrollment_date?: string | null
          id?: string
          login_id: string
          mobile: string
          name: string
          password_hash: string
          profile_picture_url?: string | null
          section: string
          semester: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string
          enrollment_date?: string | null
          id?: string
          login_id?: string
          mobile?: string
          name?: string
          password_hash?: string
          profile_picture_url?: string | null
          section?: string
          semester?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_assignments: {
        Row: {
          academic_year: string | null
          assigned_at: string
          course_id: string
          id: string
          section: string
          semester: string
          subject_id: string
        }
        Insert: {
          academic_year?: string | null
          assigned_at?: string
          course_id: string
          id?: string
          section: string
          semester: string
          subject_id: string
        }
        Update: {
          academic_year?: string | null
          assigned_at?: string
          course_id?: string
          id?: string
          section?: string
          semester?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_enrollments: {
        Row: {
          created_at: string
          enrollment_date: string
          id: string
          status: string
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          enrollment_date?: string
          id?: string
          status?: string
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          enrollment_date?: string
          id?: string
          status?: string
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "assignment_eligible_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "subject_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_enrollments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_materials: {
        Row: {
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          subject_id: string
          title: string
          uploaded_at: string
        }
        Insert: {
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          subject_id: string
          title: string
          uploaded_at?: string
        }
        Update: {
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          subject_id?: string
          title?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_topics: {
        Row: {
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          status: string | null
          subject_id: string
          topic_name: string
          updated_at: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          status?: string | null
          subject_id: string
          topic_name: string
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          status?: string | null
          subject_id?: string
          topic_name?: string
          updated_at?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          syllabus_url: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          syllabus_url?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          syllabus_url?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_courses: {
        Row: {
          assigned_at: string
          course_id: string
          id: string
          teacher_id: string
        }
        Insert: {
          assigned_at?: string
          course_id: string
          id?: string
          teacher_id: string
        }
        Update: {
          assigned_at?: string
          course_id?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string
          employee_id: string
          experience: string | null
          id: string
          mobile: string
          name: string
          password_hash: string
          profile_picture_url: string | null
          qualification: string | null
          subjects: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email: string
          employee_id: string
          experience?: string | null
          id?: string
          mobile: string
          name: string
          password_hash: string
          profile_picture_url?: string | null
          qualification?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string
          employee_id?: string
          experience?: string | null
          id?: string
          mobile?: string
          name?: string
          password_hash?: string
          profile_picture_url?: string | null
          qualification?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      assignment_eligible_students: {
        Row: {
          assignment_id: string | null
          assignment_section: string | null
          assignment_semester: string | null
          assignment_title: string | null
          has_submitted: boolean | null
          student_id: string | null
          student_login_id: string | null
          student_name: string | null
          student_section: string | null
          student_semester: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_grade_mcq_submission: {
        Args: { submission_id: string }
        Returns: number
      }
      bulk_insert_topics: {
        Args: { p_subject_id: string; p_topics: Json }
        Returns: {
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          status: string | null
          subject_id: string
          topic_name: string
          updated_at: string
          week_number: number | null
        }[]
      }
      generate_secure_password: {
        Args: { base_name: string; id_suffix: string }
        Returns: string
      }
      generate_student_login_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_teacher_employee_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_assignment_stats: {
        Args: { assignment_uuid: string }
        Returns: {
          total_eligible_students: number
          submitted_count: number
          graded_count: number
          pending_count: number
        }[]
      }
      get_total_marks_for_config: {
        Args: { config_id: string }
        Returns: number
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      update_assignment_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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

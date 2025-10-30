import { supabase } from '../lib/supabase';
import type { Computer, Student, Allocation, ComputerWithCount, StudentWithComputer } from '../lib/database.types';

export const computerService = {
  async getAll(): Promise<ComputerWithCount[]> {
    const { data: computers, error: computersError } = await (supabase
      .from('computers')
      .select('*')
      .order('name') as unknown) as { data: Computer[] | null; error: any };

    if (computersError) throw computersError;

    const { data: allocations, error: allocationsError } = await (supabase
      .from('allocations')
      .select('computer_id') as unknown) as { data: Array<{ computer_id: string }> | null; error: any };

    if (allocationsError) throw allocationsError;

    const allocationsList = allocations || [];
    const countMap = allocationsList.reduce((acc, alloc) => {
      acc[alloc.computer_id] = (acc[alloc.computer_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const computersList = computers || [];
    return computersList.map(computer => ({
      ...computer,
      student_count: countMap[computer.id] || 0
    }));
  },

  async getById(id: string): Promise<Computer | null> {
    const { data, error } = await supabase
      .from('computers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('No computer returned');
  return data;
  },

  async create(name: string, location?: string): Promise<Computer> {
    const { data, error } = await ((supabase.from('computers') as unknown as any)
      .insert({ name, location })
      .select()
      .single() as unknown) as { data: Computer | null; error: any };

  if (error) throw error;
  if (!data) throw new Error('No computer returned');
  return data;
  },

  async update(id: string, name: string, location?: string): Promise<Computer> {
    const { data, error } = await ((supabase.from('computers') as unknown as any)
      .update({ name, location })
      .eq('id', id)
      .select()
      .single() as unknown) as { data: Computer | null; error: any };

    if (error) throw error;
    if (!data) throw new Error('No computer returned');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('computers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const studentService = {
  async getAll(): Promise<StudentWithComputer[]> {
    const { data: students, error: studentsError } = await (supabase
      .from('students')
      .select('*')
      .order('name') as unknown) as { data: Student[] | null; error: any };

    if (studentsError) throw studentsError;

    const { data: allocations, error: allocationsError } = await (supabase
      .from('allocations')
      .select('student_id, computer_id, computers(name)')
      .order('student_id') as unknown) as { data: Array<any> | null; error: any };

    if (allocationsError) throw allocationsError;

    const allocationsList = allocations || [];
    const allocationMap = allocationsList.reduce((acc, alloc: any) => {
      acc[alloc.student_id] = {
        computer_id: alloc.computer_id,
        computer_name: alloc.computers?.name || null
      };
      return acc;
    }, {} as Record<string, { computer_id: string; computer_name: string | null }>);

    const studentsList = students || [];
    return studentsList.map(student => ({
      ...student,
      computer_id: allocationMap[student.id]?.computer_id || null,
      computer_name: allocationMap[student.id]?.computer_name || null
    }));
  },

  async getById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByComputerId(computerId: string): Promise<Student[]> {
    const { data: allocations, error: allocationsError } = await (supabase
      .from('allocations')
      .select('student_id')
      .eq('computer_id', computerId) as unknown) as { data: Array<{ student_id: string }> | null; error: any };

    if (allocationsError) throw allocationsError;

    const allocationsList = allocations || [];
    if (allocationsList.length === 0) return [];

    const studentIds = allocationsList.map(a => a.student_id);

    const { data: students, error: studentsError } = await (supabase
      .from('students')
      .select('*')
      .in('id', studentIds)
      .order('name') as unknown) as { data: Student[] | null; error: any };

    if (studentsError) throw studentsError;
    return students || [];
  },

  async create(name: string, studentId: string, classValue: string, section?: string): Promise<Student> {
    const { data, error } = await (((supabase.from('students') as unknown as any)
      .insert({ name, student_id: studentId, class: classValue, section })
      .select()
      .single() as unknown) as { data: Student | null; error: any });

  if (error) throw error;
  if (!data) throw new Error('No student returned');
  return data;
  },

  async update(id: string, name: string, studentId: string, classValue: string, section?: string): Promise<Student> {
    const { data, error } = await (((supabase.from('students') as unknown as any)
      .update({ name, student_id: studentId, class: classValue, section })
      .eq('id', id)
      .select()
      .single() as unknown) as { data: Student | null; error: any });

  if (error) throw error;
  if (!data) throw new Error('No student returned');
  return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const allocationService = {
  async getAll(): Promise<Allocation[]> {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .order('allocated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByComputerId(computerId: string): Promise<Allocation[]> {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .eq('computer_id', computerId)
      .order('allocated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByStudentId(studentId: string): Promise<Allocation | null> {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(studentId: string, computerId: string): Promise<Allocation> {
    await this.deleteByStudentId(studentId);

    const { data, error } = await (((supabase.from('allocations') as unknown as any)
      .insert({ student_id: studentId, computer_id: computerId })
      .select()
      .single() as unknown) as { data: Allocation | null; error: any });

    if (error) throw error;
    if (!data) throw new Error('No allocation returned');
    return data;
  },

  async update(id: string, computerId: string): Promise<Allocation> {
    const { data, error } = await (((supabase.from('allocations') as unknown as any)
      .update({ computer_id: computerId })
      .eq('id', id)
      .select()
      .single() as unknown) as { data: Allocation | null; error: any });

    if (error) throw error;
    if (!data) throw new Error('No allocation returned');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('allocations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByStudentId(studentId: string): Promise<void> {
    const { error } = await supabase
      .from('allocations')
      .delete()
      .eq('student_id', studentId);

    if (error) throw error;
  }
};

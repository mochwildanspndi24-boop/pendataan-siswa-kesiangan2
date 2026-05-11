import { useEffect, useState, useCallback, useRef } from 'react';
import { db, ref, onValue, set, update, remove, push, get } from '@/lib/firebase';
import type { Student, Class } from '@/lib/types';
import { INITIAL_CLASSES, INITIAL_STUDENTS } from '@/lib/seedData';

async function seedInitialData() {
  for (const cls of INITIAL_CLASSES) {
    await set(ref(db, `classes/${cls.id}`), {
      name: cls.name,
      createdAt: Date.now(),
    });
  }
  const studentsRef = ref(db, 'students');
  for (const student of INITIAL_STUDENTS) {
    const newRef = push(studentsRef);
    await set(newRef, {
      name: student.name,
      classId: student.classId,
      className: student.className,
      createdAt: Date.now(),
    });
  }
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const seedingRef = useRef(false);

  useEffect(() => {
    // Listen to classes
    const classesRef = ref(db, 'classes');
    const unsubscribeClasses = onValue(classesRef, async (snapshot) => {
      if (!snapshot.exists()) {
        if (seedingRef.current) return;
        seedingRef.current = true;
        await seedInitialData();
        return;
      }
      const data = snapshot.val() as Record<string, { name: string; createdAt: number }>;
      const classList: Class[] = Object.entries(data).map(([id, val]) => ({
        id,
        name: val.name,
        createdAt: val.createdAt,
      }));
      classList.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setClasses(classList);
    });

    // Listen to students
    const studentsRef = ref(db, 'students');
    const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setStudents([]);
        setLoading(false);
        return;
      }
      const data = snapshot.val() as Record<string, Omit<Student, 'id'>>;
      const studentList: Student[] = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));
      studentList.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentList);
      setLoading(false);
    });

    return () => {
      unsubscribeClasses();
      unsubscribeStudents();
    };
  }, []);

  const addClass = useCallback(async (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await set(ref(db, `classes/${id}`), { name, createdAt: Date.now() });
    return id;
  }, []);

  const renameClass = useCallback(async (classId: string, newName: string) => {
    await update(ref(db, `classes/${classId}`), { name: newName });
    // Update all students in this class
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);
    if (snapshot.exists()) {
      const updates: Record<string, string> = {};
      Object.entries(snapshot.val() as Record<string, Student>).forEach(([id, student]) => {
        if (student.classId === classId) {
          updates[`students/${id}/className`] = newName;
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
    }
  }, []);

  const deleteClass = useCallback(async (classId: string) => {
    await remove(ref(db, `classes/${classId}`));
    // Delete all students in this class
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);
    if (snapshot.exists()) {
      const deletePromises: Promise<void>[] = [];
      Object.entries(snapshot.val() as Record<string, Student>).forEach(([id, student]) => {
        if (student.classId === classId) {
          deletePromises.push(remove(ref(db, `students/${id}`)));
        }
      });
      await Promise.all(deletePromises);
    }
  }, []);

  const addStudent = useCallback(async (name: string, classId: string, className: string) => {
    const studentsRef = ref(db, 'students');
    const newRef = push(studentsRef);
    await set(newRef, { name, classId, className, createdAt: Date.now() });
  }, []);

  const editStudent = useCallback(
    async (studentId: string, name: string, classId: string, className: string) => {
      await update(ref(db, `students/${studentId}`), { name, classId, className });
    },
    []
  );

  const deleteStudent = useCallback(async (studentId: string) => {
    await remove(ref(db, `students/${studentId}`));
  }, []);

  const moveStudent = useCallback(async (studentId: string, newClassId: string, newClassName: string) => {
    await update(ref(db, `students/${studentId}`), {
      classId: newClassId,
      className: newClassName,
    });
  }, []);

  return {
    students,
    classes,
    loading,
    addClass,
    renameClass,
    deleteClass,
    addStudent,
    editStudent,
    deleteStudent,
    moveStudent,
  };
}

export function useSettings() {
  const [lateTime, setLateTimeState] = useState('06:30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = ref(db, 'settings/lateTime');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setLateTimeState(snapshot.val());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setLateTime = useCallback(async (time: string) => {
    await set(ref(db, 'settings/lateTime'), time);
    setLateTimeState(time);
  }, []);

  return { lateTime, setLateTime, loading };
}

export function useResetDatabase() {
  const resetAttendance = useCallback(async () => {
    await remove(ref(db, 'attendance'));
  }, []);

  const resetAll = useCallback(async () => {
    await remove(ref(db, 'attendance'));
    await remove(ref(db, 'students'));
    await remove(ref(db, 'classes'));
  }, []);

  return { resetAttendance, resetAll };
}

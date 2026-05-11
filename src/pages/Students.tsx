import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  X,
  GraduationCap,
  MoveRight,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useStudents } from '@/hooks/useStudents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Student } from '@/lib/types';

export default function Students() {
  const {
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
  } = useStudents();

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  // Dialogs
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [editClassOpen, setEditClassOpen] = useState(false);
  const [deleteClassOpen, setDeleteClassOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false);
  const [moveStudentOpen, setMoveStudentOpen] = useState(false);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [moveTargetClass, setMoveTargetClass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const classMatch = !selectedClass || s.classId === selectedClass;
      const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase());
      return classMatch && searchMatch;
    });
  }, [students, selectedClass, search]);

  const studentsByClass = useMemo(() => {
    const map: Record<string, Student[]> = {};
    classes.forEach((c) => {
      map[c.id] = students.filter((s) => s.classId === c.id);
    });
    return map;
  }, [students, classes]);

  const toggleClass = (classId: string) => {
    const next = new Set(expandedClasses);
    if (next.has(classId)) next.delete(classId);
    else next.add(classId);
    setExpandedClasses(next);
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    setSubmitting(true);
    try {
      await addClass(newClassName.trim());
      toast.success(`Kelas ${newClassName} berhasil ditambahkan`);
      setAddClassOpen(false);
      setNewClassName('');
    } catch {
      toast.error('Gagal menambahkan kelas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenameClass = async () => {
    if (!editClassName.trim() || !selectedClassId) return;
    setSubmitting(true);
    try {
      await renameClass(selectedClassId, editClassName.trim());
      toast.success('Nama kelas berhasil diubah');
      setEditClassOpen(false);
    } catch {
      toast.error('Gagal mengubah nama kelas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClassId) return;
    setSubmitting(true);
    try {
      await deleteClass(selectedClassId);
      toast.success('Kelas berhasil dihapus');
      setDeleteClassOpen(false);
      if (selectedClass === selectedClassId) setSelectedClass(null);
    } catch {
      toast.error('Gagal menghapus kelas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !newStudentClass) return;
    const cls = classes.find((c) => c.id === newStudentClass);
    if (!cls) return;
    setSubmitting(true);
    try {
      await addStudent(newStudentName.trim(), newStudentClass, cls.name);
      toast.success(`${newStudentName} berhasil ditambahkan ke ${cls.name}`);
      setAddStudentOpen(false);
      setNewStudentName('');
    } catch {
      toast.error('Gagal menambahkan siswa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent || !editStudentName.trim() || !editStudentClass) return;
    const cls = classes.find((c) => c.id === editStudentClass);
    if (!cls) return;
    setSubmitting(true);
    try {
      await editStudent(selectedStudent.id, editStudentName.trim(), editStudentClass, cls.name);
      toast.success('Data siswa berhasil diubah');
      setEditStudentOpen(false);
    } catch {
      toast.error('Gagal mengubah data siswa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await deleteStudent(selectedStudent.id);
      toast.success(`${selectedStudent.name} berhasil dihapus`);
      setDeleteStudentOpen(false);
    } catch {
      toast.error('Gagal menghapus siswa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveStudent = async () => {
    if (!selectedStudent || !moveTargetClass) return;
    const cls = classes.find((c) => c.id === moveTargetClass);
    if (!cls) return;
    setSubmitting(true);
    try {
      await moveStudent(selectedStudent.id, moveTargetClass, cls.name);
      toast.success(`${selectedStudent.name} dipindahkan ke ${cls.name}`);
      setMoveStudentOpen(false);
    } catch {
      toast.error('Gagal memindahkan siswa');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditClass = (classId: string, name: string) => {
    setSelectedClassId(classId);
    setEditClassName(name);
    setEditClassOpen(true);
  };

  const openDeleteClass = (classId: string) => {
    setSelectedClassId(classId);
    setDeleteClassOpen(true);
  };

  const openEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditStudentName(student.name);
    setEditStudentClass(student.classId);
    setEditStudentOpen(true);
  };

  const openDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setDeleteStudentOpen(true);
  };

  const openMoveStudent = (student: Student) => {
    setSelectedStudent(student);
    setMoveTargetClass('');
    setMoveStudentOpen(true);
  };

  return (
    <Layout title="Data Siswa">
      <div className="space-y-5">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{students.length} Total Siswa</span>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">{classes.length} Kelas</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddClassOpen(true)}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Kelas
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setNewStudentClass(selectedClass || '');
                setAddStudentOpen(true);
              }}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Siswa
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-2"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Class List with Accordion */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : search ? (
          // Search results flat view
          <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground">
                Hasil pencarian: {filteredStudents.length} siswa
              </p>
            </div>
            <div className="divide-y divide-border">
              {filteredStudents.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onEdit={openEditStudent}
                  onDelete={openDeleteStudent}
                  onMove={openMoveStudent}
                  showClass
                />
              ))}
            </div>
          </div>
        ) : (
          // Accordion by class
          <div className="space-y-3">
            {classes.map((cls) => {
              const classStudents = studentsByClass[cls.id] || [];
              const isExpanded = expandedClasses.has(cls.id);
              return (
                <div
                  key={cls.id}
                  className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden"
                >
                  {/* Class Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <button
                      onClick={() => toggleClass(cls.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-bold text-foreground">{cls.name}</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 ml-1">
                        {classStudents.length} siswa
                      </Badge>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClass(cls.id, cls.name)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Ganti nama kelas"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteClass(cls.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Hapus kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Students List */}
                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {classStudents.length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground text-sm">
                          Belum ada siswa di kelas ini
                        </div>
                      ) : (
                        classStudents.map((student) => (
                          <StudentRow
                            key={student.id}
                            student={student}
                            onEdit={openEditStudent}
                            onDelete={openDeleteStudent}
                            onMove={openMoveStudent}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Class Dialog */}
      <Dialog open={addClassOpen} onOpenChange={setAddClassOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Kelas Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Nama Kelas</Label>
            <Input
              placeholder="Contoh: XII TJKT 1"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClassOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddClass} disabled={!newClassName.trim() || submitting}>
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editClassOpen} onOpenChange={setEditClassOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ganti Nama Kelas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Nama Kelas Baru</Label>
            <Input
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameClass()}
            />
            <p className="text-xs text-muted-foreground">
              Semua siswa di kelas ini akan diperbarui secara otomatis.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditClassOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleRenameClass} disabled={!editClassName.trim() || submitting}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Class AlertDialog */}
      <AlertDialog open={deleteClassOpen} onOpenChange={setDeleteClassOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua siswa di kelas ini juga akan dihapus. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Siswa Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Siswa</Label>
              <Input
                placeholder="Nama lengkap siswa"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kelas</Label>
              <Select value={newStudentClass} onValueChange={setNewStudentClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAddStudent}
              disabled={!newStudentName.trim() || !newStudentClass || submitting}
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editStudentOpen} onOpenChange={setEditStudentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Data Siswa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Siswa</Label>
              <Input
                value={editStudentName}
                onChange={(e) => setEditStudentName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kelas</Label>
              <Select value={editStudentClass} onValueChange={setEditStudentClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudentOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleEditStudent}
              disabled={!editStudentName.trim() || !editStudentClass || submitting}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Student AlertDialog */}
      <AlertDialog open={deleteStudentOpen} onOpenChange={setDeleteStudentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedStudent?.name}</strong> akan dihapus dari sistem. Tindakan ini tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Student Dialog */}
      <Dialog open={moveStudentOpen} onOpenChange={setMoveStudentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pindahkan Siswa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Pindahkan <strong className="text-foreground">{selectedStudent?.name}</strong> dari{' '}
              <strong className="text-foreground">{selectedStudent?.className}</strong> ke:
            </p>
            <div className="space-y-1.5">
              <Label>Kelas Tujuan</Label>
              <Select value={moveTargetClass} onValueChange={setMoveTargetClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((c) => c.id !== selectedStudent?.classId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveStudentOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleMoveStudent}
              disabled={!moveTargetClass || submitting}
              className="gap-1.5"
            >
              <MoveRight className="w-4 h-4" />
              Pindahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function StudentRow({
  student,
  onEdit,
  onDelete,
  onMove,
  showClass = false,
}: {
  student: Student;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
  onMove: (s: Student) => void;
  showClass?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary">{student.name[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
        {showClass && <p className="text-xs text-muted-foreground">{student.className}</p>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(student)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
          title="Pindahkan"
        >
          <MoveRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(student)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(student)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

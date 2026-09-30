import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ClipboardList,
  Copy,
  Check,
  FileCode,
  GraduationCap,
  HeartPulse,
  Apple,
  Users,
  Download,
  UploadCloud,
  FileText,
  UserPlus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderOpen,
  ShieldCheck,
  FileSpreadsheet,
  Database,
  Save,
  Edit3,
  Minus,
  PenLine,
  Sliders,
  Undo
} from "lucide-react";

// Types
interface Rubrik {
  kriteria: string;
  bobot_skor: number;
}

interface Question {
  nomor_soal: number;
  materi: string;
  soal: string;
  kunci_jawaban: string;
  rubrik: Rubrik[];
  total_skor: number;
}

interface RubrikScore {
  kriteria: string;
  skor_maksimal: number;
  skor_diperoleh: number;
  catatan_evaluasi: string;
}

interface EvaluationResult {
  rincian_rubrik: RubrikScore[];
  total_skor_soal: number;
  skor_maksimal_soal: number;
  feedback_diagnostik: string;
  is_manual_override?: boolean;
  catatan_guru?: string;
  original_ai_score?: number;
}

interface ClassData {
  id: string;
  name: string;
  students: string[];
  questions: Question[];
  answers: Record<string, Record<number, string>>; // studentName -> questionNumber -> answerText
  evaluations: Record<string, Record<number, EvaluationResult>>; // studentName -> questionNumber -> evalResult
}

// Types for Multiple Choice (Pilihan Ganda - PG)
interface PgDetail {
  no_soal: number;
  jawaban_siswa: string;
  kunci: string;
  status: "BENAR" | "SALAH";
  skor: number;
}

interface PgResult {
  status: string;
  tipe?: string;
  jumlah_benar: number;
  total_soal: number;
  skor_pg: number;
  status_tuntas: "TUNTAS" | "REMEDIAL";
  detail: PgDetail[];
  timestamp?: string;
}

interface PgClassData {
  totalQuestions: number;
  kunciJawaban: Record<number, string>;
  jawabanSiswa: Record<string, Record<number, string>>;
  hasil: Record<string, PgResult>;
  rekapSaved: Record<string, { timestamp: string; message: string; total_nilai?: string; status_tuntas?: string }>;
}

const defaultPgSeeds: Record<string, PgClassData> = {
  "kelas-9a": {
    totalQuestions: 10,
    kunciJawaban: {
      1: "A", 2: "B", 3: "C", 4: "D", 5: "A",
      6: "B", 7: "C", 8: "D", 9: "A", 10: "C"
    },
    jawabanSiswa: {
      "Ahmad": {
        1: "A", 2: "B", 3: "C", 4: "D", 5: "A",
        6: "B", 7: "C", 8: "D", 9: "A", 10: "A"
      },
      "Budi": {
        1: "A", 2: "B", 3: "D", 4: "C", 5: "A",
        6: "A", 7: "B", 8: "D", 9: "B", 10: "C"
      },
      "Cici": {
        1: "A", 2: "B", 3: "C", 4: "D", 5: "A",
        6: "B", 7: "C", 8: "D", 9: "A", 10: "C"
      },
      "Dina": {
        1: "B", 2: "B", 3: "C", 4: "A", 5: "A",
        6: "C", 7: "C", 8: "D", 9: "A", 10: "C"
      }
    },
    hasil: {},
    rekapSaved: {}
  }
};

// Sample questions to seed empty/initial classes
const defaultQuestions: Question[] = [
  {
    nomor_soal: 1,
    materi: "Struktur dan Fungsi Organ Peredaran Darah",
    soal: "Seorang atlet lari maraton membutuhkan pasokan oksigen dan nutrisi yang sangat tinggi ke jaringan ototnya saat bertanding. Analisislah bagaimana perbedaan struktur dinding pembuluh darah arteri dan vena mendukung fungsi masing-masing dalam menjaga kelancaran sirkulasi darah saat aktivitas tinggi tersebut!",
    kunci_jawaban: "1. Pembuluh darah Arteri: Memiliki dinding yang tebal, elastis, dan berotot kuat. Struktur ini berfungsi untuk menahan tekanan darah yang sangat tinggi hasil pompaan jantung (bilik kiri) saat menyalurkan darah kaya oksigen secara cepat ke otot-otot yang aktif bertanding.\n2. Pembuluh darah Vena: Memiliki dinding yang lebih tipis dan kurang elastis, namun dilengkapi dengan katup-katup di sepanjang pembuluh. Katup ini berfungsi mencegah aliran balik darah akibat gaya gravitasi dan tekanan darah yang sudah menurun, sehingga darah kaya CO2 dapat terus mengalir kembali ke jantung secara efisien.",
    rubrik: [
      { kriteria: "Menganalisis hubungan struktur tebal dan elastisitas arteri dengan ketahanan terhadap tekanan tinggi saat aliran darah kaya O2 dipompa", bobot_skor: 5 },
      { kriteria: "Menganalisis peran keberadaan katup pada vena untuk mencegah aliran balik darah pada tekanan rendah menuju jantung", bobot_skor: 5 },
      { kriteria: "Menghubungkan kedua analisis struktur pembuluh darah dengan pemenuhan sirkulasi darah saat aktivitas fisik tinggi", bobot_skor: 5 }
    ],
    total_skor: 15
  },
  {
    nomor_soal: 2,
    materi: "Mekanisme Peredaran Darah Besar dan Kecil",
    soal: "Seorang pasien didiagnosis mengalami kelainan berupa kebocoran pada katup bikuspidalis (katup antara serambi kiri dan bilik kiri jantung). Analisislah bagaimana kelainan ini mempengaruhi efisiensi mekanisme peredaran darah besar dan dampaknya terhadap pasokan oksigen ke sel-sel tubuh!",
    kunci_jawaban: "Kebocoran katup bikuspidalis menyebabkan katup tidak dapat menutup secara sempurna saat bilik kiri berkontraksi. Dampaknya:\n1. Sebagian darah kaya oksigen dari bilik kiri akan bocor dan mengalir kembali (backflow) ke serambi kiri, sehingga volume darah O2 yang dipompa keluar melalui aorta ke seluruh tubuh (peredaran darah besar) berkurang.\n2. Berkurangnya volume dan tekanan darah kaya O2 pada sirkulasi sistemik mengakibatkan pasokan oksigen ke sel-sel tubuh menurun drastis, sehingga sel mengalami kekurangan O2 untuk metabolisme yang memicu gejala mudah lelah dan sesak napas.",
    rubrik: [
      { kriteria: "Menganalisis terjadinya aliran balik darah (backflow) dari bilik kiri ke serambi kiri akibat kebocoran katup bikuspidalis", bobot_skor: 5 },
      { kriteria: "Menganalisis penurunan volume dan efisiensi pemompaan darah kaya O2 dalam sistem peredaran darah besar (aorta/sistemik)", bobot_skor: 5 },
      { kriteria: "Menganalisis dampak penurunan pasokan O2 terhadap metabolisme sel dan gejala fisiologis tubuh", bobot_skor: 5 }
    ],
    total_skor: 15
  }
];

// Seed Data representing default setup with requested student Ahmad
const defaultClassesSeed: ClassData[] = [
  {
    id: "kelas-9a",
    name: "Kelas 9A",
    students: ["Ahmad", "Budi", "Cici", "Dina"],
    questions: [...defaultQuestions],
    answers: {
      "Ahmad": {
        1: "Tangan terangkat refleks karena diolah di sumsum tulang belakang. Kalau gerak biasa diolah di otak.",
        2: "Glukosa menumpuk di darah karena tidak ada insulin yang mengubahnya jadi glikogen."
      },
      "Budi": {
        1: "Arteri memiliki dinding yang tebal dan berotot agar tahan dari tekanan pompa jantung. Vena tipis dengan katup agar darah tidak berbalik arah.",
        2: "Kebocoran katup menyebabkan volume darah bersih menurun karena bocor kembali ke serambi kiri, sehingga suplai oksigen ke tubuh terganggu."
      }
    },
    evaluations: {}
  },
  {
    id: "kelas-9b",
    name: "Kelas 9B",
    students: ["Farhan", "Gita", "Hendra"],
    questions: [...defaultQuestions],
    answers: {},
    evaluations: {}
  },
  {
    id: "kelas-9c",
    name: "Kelas 9C",
    students: ["Irfan", "Joko", "Kartika"],
    questions: [...defaultQuestions],
    answers: {},
    evaluations: {}
  }
];

// Predefined template student response triggers
const presetAnswers: Record<number, { label: string; text: string; isIrrelevant?: boolean }[]> = {
  1: [
    {
      label: "Jawaban Ahmad (Refleks Saraf - Tidak Relevan)",
      text: "Tangan terangkat refleks karena diolah di sumsum tulang belakang. Kalau gerak biasa diolah di otak.",
      isIrrelevant: true
    },
    {
      label: "Jawaban Sempurna C4",
      text: "Pembuluh arteri berstruktur tebal, elastis, dan berotot tebal untuk menahan serta menyalurkan darah di bawah tekanan pompa jantung bilik kiri yang sangat kuat saat maraton. Sedangkan vena berdinding tipis, bertekanan rendah, dan memiliki katup di sepanjang salurannya untuk memompa darah kaya CO2 kembali ke jantung tanpa aliran balik akibat gravitasi. Sinergi keduanya melancarkan sirkulasi suplai oksigen yang tinggi bagi otot atlet."
    },
    {
      label: "Contoh Jawaban Ngawur / OOT",
      text: "Kemarin saya dan teman-teman bermain sepak bola di lapangan desa sampai sore hari.",
      isIrrelevant: true
    }
  ],
  2: [
    {
      label: "Jawaban Ahmad (Insulin - Tidak Relevan)",
      text: "Glukosa menumpuk di darah karena tidak ada insulin yang mengubahnya jadi glikogen.",
      isIrrelevant: true
    },
    {
      label: "Jawaban Sempurna C4",
      text: "Kebocoran katup bikuspidalis menyebabkan katup tidak tertutup rapat saat ventrikel kiri berkontraksi. Akibatnya terjadi aliran balik (backflow) darah kaya O2 kembali ke serambi kiri, mengurangi volume pemompaan sistemik (peredaran darah besar) melalui aorta. Dampaknya sel tubuh kekurangan oksigen untuk metabolisme respirasi seluler, mengakibatkan penderita lemas dan sesak napas."
    },
    {
      label: "Contoh Jawaban Ngawur / OOT",
      text: "Penyakit jantung sangat berbahaya bagi orang tua dan harus rajin minum air putih setiap hari.",
      isIrrelevant: true
    }
  ]
};

export default function App() {
  // State: Classes loaded from LocalStorage
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [activeClassId, setActiveClassId] = useState<string>("kelas-9a");
  
  // State: Selected student and selected question
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedNo, setSelectedNo] = useState<number>(1);
  
  // State: Active view tab
  const [activeTab, setActiveTab] = useState<"penilaian" | "pilihan-ganda" | "materi-soal" | "json-output">("penilaian");

  // Pilihan Ganda (PG) module states
  const [pgData, setPgData] = useState<Record<string, PgClassData>>(() => {
    const saved = localStorage.getItem("penilai_pg_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultPgSeeds;
      }
    }
    return defaultPgSeeds;
  });

  const [pgLoading, setPgLoading] = useState<boolean>(false);
  const [savingRekap, setSavingRekap] = useState<boolean>(false);
  const [batchSavingRekap, setBatchSavingRekap] = useState<boolean>(false);
  const [bulkKunciText, setBulkKunciText] = useState<string>("");
  const [bulkJawabanText, setBulkJawabanText] = useState<string>("");
  
  // Form State: Add Class / Add Student / Add Question
  const [newClassName, setNewClassName] = useState<string>("");
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [showAddClassInline, setShowAddClassInline] = useState<boolean>(false);
  const [showQuickScoreTable, setShowQuickScoreTable] = useState<boolean>(false);
  
  // File upload state for PDFs
  const [pdfExtracting, setPdfExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<{ name: string; status: "extracting" | "success" | "error"; count?: number }[]>([]);
  
  // Evaluation processing state
  const [evaluatingNo, setEvaluatingNo] = useState<number | null>(null);
  const [evaluatingAll, setEvaluatingAll] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Interactive preview indicators
  const [copied, setCopied] = useState<boolean>(false);
  const [autoSaveActive, setAutoSaveActive] = useState<boolean>(false);

  // Intervention module state
  const [generatingIntervention, setGeneratingIntervention] = useState<boolean>(false);
  const [interventionReport, setInterventionReport] = useState<any | null>(null);

  // Loading intervention from LocalStorage on active class change
  useEffect(() => {
    if (activeClassId) {
      const stored = localStorage.getItem(`intervention_${activeClassId}`);
      if (stored) {
        try {
          setInterventionReport(JSON.parse(stored));
        } catch (e) {
          setInterventionReport(null);
        }
      } else {
        setInterventionReport(null);
      }
    }
  }, [activeClassId]);

  // Load classes from LocalStorage or initialize with seed
  useEffect(() => {
    const stored = localStorage.getItem("penilai_esai_classes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setClasses(parsed);
          setActiveClassId(parsed[0].id);
          if (parsed[0].students?.length > 0) {
            setSelectedStudent(parsed[0].students[0]);
          }
        } else {
          resetToSeed();
        }
      } catch (e) {
        resetToSeed();
      }
    } else {
      resetToSeed();
    }
  }, []);

  const resetToSeed = () => {
    localStorage.setItem("penilai_esai_classes", JSON.stringify(defaultClassesSeed));
    setClasses(defaultClassesSeed);
    setActiveClassId("kelas-9a");
    setSelectedStudent("Ahmad");
    setSelectedNo(1);
    setSuccessMsg("Sistem berhasil diinisialisasi dengan data default (Ahmad Kelas 9A)!");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Helper to save current state to LocalStorage
  const saveClassesToStorage = (updatedClasses: ClassData[]) => {
    localStorage.setItem("penilai_esai_classes", JSON.stringify(updatedClasses));
    setClasses(updatedClasses);
  };

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0] || defaultClassesSeed[0];

  // Auto-select student when class changes
  useEffect(() => {
    if (activeClass && activeClass.students?.length > 0) {
      if (!activeClass.students.includes(selectedStudent)) {
        setSelectedStudent(activeClass.students[0]);
      }
    } else {
      setSelectedStudent("");
    }
    
    if (activeClass && activeClass.questions?.length > 0) {
      const qNoList = activeClass.questions.map(q => q.nomor_soal);
      if (!qNoList.includes(selectedNo)) {
        setSelectedNo(qNoList[0] || 1);
      }
    }
  }, [activeClassId, classes]);

  // Handle class selection
  const handleSelectClass = (classId: string) => {
    setActiveClassId(classId);
    setErrorMsg(null);
  };

  // Add a new custom class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    
    const newId = `kelas-${newClassName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    if (classes.some(c => c.id === newId)) {
      setErrorMsg("Kelas dengan nama tersebut sudah ada!");
      return;
    }

    const newClass: ClassData = {
      id: newId,
      name: newClassName.trim(),
      students: [],
      questions: [...defaultQuestions], // copy default questions initially
      answers: {},
      evaluations: {}
    };

    const updated = [...classes, newClass];
    saveClassesToStorage(updated);
    setActiveClassId(newId);
    setNewClassName("");
    setShowAddClassInline(false);
    setErrorMsg(null);
    setSuccessMsg(`Kelas ${newClass.name} berhasil dibuat!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Add a student to the selected class
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !activeClass) return;

    if (activeClass.students.includes(newStudentName.trim())) {
      setErrorMsg("Nama siswa ini sudah ada di kelas!");
      return;
    }

    const updatedStudents = [...activeClass.students, newStudentName.trim()];
    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, students: updatedStudents } : c
    );

    saveClassesToStorage(updatedClasses);
    setSelectedStudent(newStudentName.trim());
    setNewStudentName("");
    setErrorMsg(null);
  };

  // Delete a student from active class
  const handleDeleteStudent = (studentName: string) => {
    const updatedStudents = activeClass.students.filter(s => s !== studentName);
    
    // Cleanup their answers and evaluations
    const updatedAnswers = { ...activeClass.answers };
    delete updatedAnswers[studentName];
    const updatedEvals = { ...activeClass.evaluations };
    delete updatedEvals[studentName];

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { 
        ...c, 
        students: updatedStudents,
        answers: updatedAnswers,
        evaluations: updatedEvals
      } : c
    );

    saveClassesToStorage(updatedClasses);
    if (selectedStudent === studentName) {
      setSelectedStudent(updatedStudents[0] || "");
    }
    setSuccessMsg(`Siswa "${studentName}" berhasil dihapus.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Generate Intervention Report from API
  const handleGenerateIntervention = async () => {
    if (!activeClass) return;
    if (activeClass.students.length === 0) {
      setErrorMsg("Tidak ada siswa di kelas aktif untuk dianalisis.");
      return;
    }
    if (activeClass.questions.length === 0) {
      setErrorMsg("Tidak ada pertanyaan di kelas aktif untuk dianalisis.");
      return;
    }

    setGeneratingIntervention(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/analyze-intervention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: activeClass.name,
          students: activeClass.students,
          questions: activeClass.questions,
          evaluations: activeClass.evaluations,
          answers: activeClass.answers
        })
      });

      if (!res.ok) throw new Error("Gagal generate analisis intervensi dari server.");
      const data = await res.json();
      
      setInterventionReport(data);
      localStorage.setItem(`intervention_${activeClass.id}`, JSON.stringify(data));
      setSuccessMsg("Laporan Intervensi Pembelajaran & Remedial Otomatis berhasil dirumuskan oleh AI!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal menyusun analisis intervensi pembelajaran.");
    } finally {
      setGeneratingIntervention(false);
    }
  };

  // Delete active class
  const handleDeleteClass = (classId: string) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const updated = classes.filter(c => c.id !== classId);
    if (updated.length === 0) {
      // Reset to seed if no classes left
      resetToSeed();
    } else {
      saveClassesToStorage(updated);
      setActiveClassId(updated[0].id);
      setSuccessMsg(`Kelas ${targetClass.name} berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Reset / Clear all questions for the active class with confirmation
  const handleResetAllQuestions = () => {
    if (!activeClass) return;
    
    if (!window.confirm(`Apakah Anda yakin ingin menghapus seluruh paket soal untuk kelas ${activeClass.name}? Tindakan ini juga akan membersihkan semua jawaban dan penilaian yang terkait.`)) {
      return;
    }

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { 
        ...c, 
        questions: [],
        answers: {},
        evaluations: {}
      } : c
    );

    saveClassesToStorage(updatedClasses);
    setSelectedNo(1);
    setSuccessMsg(`Seluruh soal untuk kelas ${activeClass.name} berhasil di-reset menjadi kosong.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Move question up in list and re-map answers/evaluations if any
  const moveQuestionUp = (index: number) => {
    if (!activeClass || index === 0) return;
    const list = [...activeClass.questions];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;

    // Re-index nomor_soal
    const updatedList = list.map((q, idx) => ({
      ...q,
      nomor_soal: idx + 1
    }));

    // Adjust answers and evaluations
    const updatedAnswers = { ...activeClass.answers };
    const updatedEvals = { ...activeClass.evaluations };

    const oldNo = index + 1;
    const newNo = index;

    activeClass.students.forEach(student => {
      const studentAnswers = updatedAnswers[student] ? { ...updatedAnswers[student] } : {};
      const studentEvals = updatedEvals[student] ? { ...updatedEvals[student] } : {};

      const valOld = studentAnswers[oldNo];
      const valNew = studentAnswers[newNo];

      if (valOld !== undefined) studentAnswers[newNo] = valOld;
      else delete studentAnswers[newNo];

      if (valNew !== undefined) studentAnswers[oldNo] = valNew;
      else delete studentAnswers[oldNo];

      const evalOld = studentEvals[oldNo];
      const evalNew = studentEvals[newNo];

      if (evalOld !== undefined) studentEvals[newNo] = evalOld;
      else delete studentEvals[newNo];

      if (evalNew !== undefined) studentEvals[oldNo] = evalNew;
      else delete studentEvals[oldNo];

      updatedAnswers[student] = studentAnswers;
      updatedEvals[student] = studentEvals;
    });

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { 
        ...c, 
        questions: updatedList,
        answers: updatedAnswers,
        evaluations: updatedEvals
      } : c
    );
    saveClassesToStorage(updatedClasses);
    setSelectedNo(updatedList[index - 1].nomor_soal);
  };

  // Move question down in list and re-map answers/evaluations if any
  const moveQuestionDown = (index: number) => {
    if (!activeClass || index === activeClass.questions.length - 1) return;
    const list = [...activeClass.questions];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;

    // Re-index nomor_soal
    const updatedList = list.map((q, idx) => ({
      ...q,
      nomor_soal: idx + 1
    }));

    // Adjust answers and evaluations
    const updatedAnswers = { ...activeClass.answers };
    const updatedEvals = { ...activeClass.evaluations };

    const oldNo = index + 1;
    const newNo = index + 2;

    activeClass.students.forEach(student => {
      const studentAnswers = updatedAnswers[student] ? { ...updatedAnswers[student] } : {};
      const studentEvals = updatedEvals[student] ? { ...updatedEvals[student] } : {};

      const valOld = studentAnswers[oldNo];
      const valNew = studentAnswers[newNo];

      if (valOld !== undefined) studentAnswers[newNo] = valOld;
      else delete studentAnswers[newNo];

      if (valNew !== undefined) studentAnswers[oldNo] = valNew;
      else delete studentAnswers[oldNo];

      const evalOld = studentEvals[oldNo];
      const evalNew = studentEvals[newNo];

      if (evalOld !== undefined) studentEvals[newNo] = evalOld;
      else delete studentEvals[newNo];

      if (evalNew !== undefined) studentEvals[oldNo] = evalNew;
      else delete studentEvals[oldNo];

      updatedAnswers[student] = studentAnswers;
      updatedEvals[student] = studentEvals;
    });

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { 
        ...c, 
        questions: updatedList,
        answers: updatedAnswers,
        evaluations: updatedEvals
      } : c
    );
    saveClassesToStorage(updatedClasses);
    setSelectedNo(updatedList[index + 1].nomor_soal);
  };

  // Delete a specific question item and re-index sequentially
  const handleDeleteQuestion = (qNo: number) => {
    if (!activeClass) return;

    // Filter out the deleted question
    const remainingQuestions = activeClass.questions.filter(q => q.nomor_soal !== qNo);
    
    // Re-index remaining questions sequentially
    const updatedQuestions = remainingQuestions.map((q, idx) => ({
      ...q,
      nomor_soal: idx + 1
    }));

    // Adjust answers and evaluations
    const updatedAnswers = { ...activeClass.answers };
    const updatedEvals = { ...activeClass.evaluations };

    // Remap student answers and evaluations because question numbers shifted
    const remappedAnswers: Record<string, Record<number, string>> = {};
    const remappedEvals: Record<string, Record<number, any>> = {};

    activeClass.students.forEach(student => {
      remappedAnswers[student] = {};
      remappedEvals[student] = {};

      remainingQuestions.forEach((oldQ, idx) => {
        const newNo = idx + 1;
        const ans = updatedAnswers[student]?.[oldQ.nomor_soal];
        if (ans !== undefined) {
          remappedAnswers[student][newNo] = ans;
        }
        const ev = updatedEvals[student]?.[oldQ.nomor_soal];
        if (ev !== undefined) {
          remappedEvals[student][newNo] = ev;
        }
      });
    });

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { 
        ...c, 
        questions: updatedQuestions,
        answers: remappedAnswers,
        evaluations: remappedEvals
      } : c
    );

    saveClassesToStorage(updatedClasses);

    // Set new selected question
    if (selectedNo === qNo) {
      setSelectedNo(updatedQuestions[0]?.nomor_soal || 1);
    } else if (selectedNo > qNo) {
      setSelectedNo(prev => Math.max(1, prev - 1));
    }

    setSuccessMsg(`Soal ${qNo} berhasil dihapus dan nomor soal lainnya telah diurutkan kembali.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Handle Typing Answers (Auto-Saves to LocalStorage)
  const handleAnswerChange = (qNo: number, value: string) => {
    if (!selectedStudent) return;
    
    setAutoSaveActive(true);
    
    const updatedAnswers = { ...activeClass.answers };
    if (!updatedAnswers[selectedStudent]) {
      updatedAnswers[selectedStudent] = {};
    }
    updatedAnswers[selectedStudent][qNo] = value;

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, answers: updatedAnswers } : c
    );

    saveClassesToStorage(updatedClasses);
    
    setTimeout(() => {
      setAutoSaveActive(false);
    }, 600);
  };

  // Inject presets (like Ahmad's real responses)
  const handleInjectPreset = (qNo: number, text: string) => {
    handleAnswerChange(qNo, text);
  };

  // PDF Multi-File Upload & Gemini extraction
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPdfExtracting(true);
    setExtractProgress([]);
    setErrorMsg(null);

    const extractedQuestions: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setExtractProgress(prev => [...prev, { name: file.name, status: "extracting" }]);

      try {
        const base64Data = await fileToBase64(file);
        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: base64Data, filename: file.name })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server gagal memproses ${file.name}`);
        }
        const data = await res.json();

        if (Array.isArray(data)) {
          extractedQuestions.push(...data);
          setExtractProgress(prev => 
            prev.map(p => p.name === file.name ? { ...p, status: "success", count: data.length } : p)
          );
        } else {
          throw new Error("Hasil ekstraksi dari Gemini bukan berupa JSON Array");
        }
      } catch (err: any) {
        console.error(err);
        const errMsg = err?.message || "Kesalahan tidak dikenal";
        setExtractProgress(prev => 
          prev.map(p => p.name === file.name ? { ...p, status: "error" } : p)
        );
        setErrorMsg(prev => prev ? `${prev} | ${file.name}: ${errMsg}` : `${file.name}: ${errMsg}`);
      }
    }

    if (extractedQuestions.length > 0) {
      // 1. Ambil data soal yang sudah ada untuk kelas aktif
      const existingQuestions = activeClass.questions || [];

      // 2. Petakan pertanyaan baru ke format objek Question
      const newNormalizedQuestions: Question[] = extractedQuestions.map((q) => {
        const rubrikRaw = q.rubrik || q.rincian_rubrik || q.rubrik_penilaian || [];
        const rubrikMapped = Array.isArray(rubrikRaw) ? rubrikRaw.map((r: any) => ({
          kriteria: r.kriteria || r.aspek || r.deskripsi || "Kriteria Penilaian",
          bobot_skor: Number(r.bobot_skor || r.skor_maksimal || r.skor || r.nilai || 5)
        })) : [{ kriteria: "Ketepatan Analisis", bobot_skor: Number(q.total_skor || 15) }];

        const computedTotalSkor = rubrikMapped.reduce((sum: number, r: any) => sum + r.bobot_skor, 0);

        return {
          nomor_soal: 0, // Akan diurutkan di langkah berikutnya
          materi: q.materi || q.topik || q.bab || "Materi Hasil Ekstraksi",
          soal: q.soal || q.pertanyaan || "Teks soal tidak terbaca",
          kunci_jawaban: q.kunci_jawaban || q.kunci || q.jawaban_acuan || "Kunci jawaban tidak terbaca",
          rubrik: rubrikMapped,
          total_skor: computedTotalSkor || Number(q.total_skor || 15)
        };
      });

      // 3. Gabungkan soal lama dengan soal baru
      const combinedQuestions = [...existingQuestions, ...newNormalizedQuestions];

      // 4. Urutkan ulang seluruh nomor soal secara berurutan mulai dari 1
      const normalizedQuestions: Question[] = combinedQuestions.map((q, idx) => ({
        ...q,
        nomor_soal: idx + 1
      }));

      // 5. Update kelas aktif dengan mempertahankan jawaban & evaluasi lama
      const updatedClasses = classes.map(c => 
        c.id === activeClass.id ? { 
          ...c, 
          questions: normalizedQuestions,
          // Catatan: jawaban dan evaluasi lama tidak di-reset agar data pengerjaan sebelumnya tetap terjaga!
        } : c
      );

      saveClassesToStorage(updatedClasses);
      setSelectedNo(1);
      setSuccessMsg(`Berhasil mengekstrak ${newNormalizedQuestions.length} Soal HOTS baru dan digabungkan menjadi total ${normalizedQuestions.length} Soal!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setErrorMsg("Tidak ada soal yang berhasil diekstrak dari PDF yang diunggah.");
    }
    
    setPdfExtracting(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Evaluate a SINGLE question
  const evaluateQuestion = async (qNo: number) => {
    if (!selectedStudent) {
      setErrorMsg("Pilih siswa terlebih dahulu.");
      return;
    }

    const answer = activeClass.answers?.[selectedStudent]?.[qNo] || "";
    if (!answer.trim()) {
      setErrorMsg(`Jawaban siswa untuk Soal ${qNo} masih kosong!`);
      return;
    }

    const question = activeClass.questions.find(q => q.nomor_soal === qNo);
    if (!question) return;

    setEvaluatingNo(qNo);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, jawaban_siswa: answer })
      });

      if (!res.ok) throw new Error("Gagal mengevaluasi jawaban siswa.");
      const evaluationResult: EvaluationResult = await res.json();

      // Save evaluation to class
      const updatedEvals = { ...activeClass.evaluations };
      if (!updatedEvals[selectedStudent]) {
        updatedEvals[selectedStudent] = {};
      }
      updatedEvals[selectedStudent][qNo] = evaluationResult;

      const updatedClasses = classes.map(c => 
        c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
      );

      saveClassesToStorage(updatedClasses);
      setSuccessMsg(`Soal ${qNo} milik ${selectedStudent} berhasil dinilai!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal melakukan evaluasi.");
    } finally {
      setEvaluatingNo(null);
    }
  };

  // Evaluate ALL answered questions for selected student
  const handleEvaluateAll = async () => {
    if (!selectedStudent) {
      setErrorMsg("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    const studentAnswers = activeClass.answers?.[selectedStudent] || {};
    const questionsToEvaluate = activeClass.questions.filter(q => {
      const ans = studentAnswers[q.nomor_soal];
      return ans && ans.trim().length > 0;
    });

    if (questionsToEvaluate.length === 0) {
      setErrorMsg("Siswa terpilih belum mengisi jawaban apa pun.");
      return;
    }

    setEvaluatingAll(true);
    setErrorMsg(null);

    for (const q of questionsToEvaluate) {
      setEvaluatingNo(q.nomor_soal);
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, jawaban_siswa: studentAnswers[q.nomor_soal] })
        });

        if (!res.ok) throw new Error(`Gagal memproses Soal ${q.nomor_soal}`);
        const evalRes: EvaluationResult = await res.json();

        // Update local evaluations
        const currentClassInstance = JSON.parse(localStorage.getItem("penilai_esai_classes") || "[]")
          .find((c: any) => c.id === activeClass.id);
        
        const updatedEvals = currentClassInstance ? { ...currentClassInstance.evaluations } : { ...activeClass.evaluations };
        if (!updatedEvals[selectedStudent]) {
          updatedEvals[selectedStudent] = {};
        }
        updatedEvals[selectedStudent][q.nomor_soal] = evalRes;

        const updatedClasses = classes.map(c => 
          c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
        );
        saveClassesToStorage(updatedClasses);
      } catch (err: any) {
        console.error(`Gagal mengevaluasi Soal ${q.nomor_soal}:`, err);
        setErrorMsg(`Gagal memproses Soal ${q.nomor_soal}. Evaluasi dihentikan.`);
        break;
      }
    }

    setEvaluatingNo(null);
    setEvaluatingAll(false);
    if (!errorMsg) {
      setSuccessMsg(`Seluruh jawaban ${selectedStudent} berhasil dievaluasi menggunakan C4 Rubrik!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // --- ATURAN WAJIB: HANDLER EDIT NILAI GURU (MANUAL OVERRIDE) ---
  // Memungkinkan guru untuk mengubah/mengedit nilai per kriteria atau total soal untuk setiap siswa
  const handleUpdateCriterionScore = (student: string, qNo: number, criterionIdx: number, newScore: number) => {
    if (!student || !activeClass) return;

    const currentEval = activeClass.evaluations?.[student]?.[qNo];
    if (!currentEval) {
      handleInitManualEvaluation(student, qNo);
      return;
    }

    const criterion = currentEval.rincian_rubrik[criterionIdx];
    if (!criterion) return;

    const clampedScore = Math.max(0, Math.min(criterion.skor_maksimal, Math.round(newScore)));
    const updatedRubrik = currentEval.rincian_rubrik.map((r, idx) => 
      idx === criterionIdx ? { ...r, skor_diperoleh: clampedScore } : r
    );

    const newTotal = updatedRubrik.reduce((sum, r) => sum + r.skor_diperoleh, 0);

    const updatedEval: EvaluationResult = {
      ...currentEval,
      rincian_rubrik: updatedRubrik,
      total_skor_soal: newTotal,
      is_manual_override: true,
      original_ai_score: currentEval.original_ai_score !== undefined ? currentEval.original_ai_score : currentEval.total_skor_soal
    };

    const updatedEvals = { ...activeClass.evaluations };
    if (!updatedEvals[student]) updatedEvals[student] = {};
    updatedEvals[student][qNo] = updatedEval;

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
    );

    saveClassesToStorage(updatedClasses);
    setSuccessMsg(`Nilai Kriteria ${criterionIdx + 1} Soal ${qNo} untuk ${student} berhasil diubah menjadi ${clampedScore}!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleUpdateTotalScore = (student: string, qNo: number, newTotal: number) => {
    if (!student || !activeClass) return;

    const currentEval = activeClass.evaluations?.[student]?.[qNo];
    const qObj = activeClass.questions.find(q => q.nomor_soal === qNo);
    const maxScore = qObj?.total_skor || currentEval?.skor_maksimal_soal || 15;

    const clampedTotal = Math.max(0, Math.min(maxScore, Math.round(newTotal)));

    if (!currentEval) {
      handleInitManualEvaluation(student, qNo, clampedTotal);
      return;
    }

    // Secara proporsional sesuaikan skor rincian kriteria rubrik
    let updatedRubrik = currentEval.rincian_rubrik;
    if (updatedRubrik && updatedRubrik.length > 0) {
      const sumMax = updatedRubrik.reduce((sum, r) => sum + r.skor_maksimal, 0) || 1;
      let allocated = 0;
      updatedRubrik = updatedRubrik.map((r, idx) => {
        if (idx === updatedRubrik.length - 1) {
          const rem = Math.max(0, clampedTotal - allocated);
          return { ...r, skor_diperoleh: Math.min(r.skor_maksimal, rem) };
        }
        const part = Math.min(r.skor_maksimal, Math.round((r.skor_maksimal / sumMax) * clampedTotal));
        allocated += part;
        return { ...r, skor_diperoleh: part };
      });
    }

    const updatedEval: EvaluationResult = {
      ...currentEval,
      rincian_rubrik: updatedRubrik,
      total_skor_soal: clampedTotal,
      is_manual_override: true,
      original_ai_score: currentEval.original_ai_score !== undefined ? currentEval.original_ai_score : currentEval.total_skor_soal
    };

    const updatedEvals = { ...activeClass.evaluations };
    if (!updatedEvals[student]) updatedEvals[student] = {};
    updatedEvals[student][qNo] = updatedEval;

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
    );

    saveClassesToStorage(updatedClasses);
    setSuccessMsg(`Nilai Soal ${qNo} untuk ${student} berhasil diubah menjadi ${clampedTotal}/${maxScore}!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleUpdateTeacherNote = (student: string, qNo: number, note: string) => {
    if (!student || !activeClass) return;

    const currentEval = activeClass.evaluations?.[student]?.[qNo];
    if (!currentEval) return;

    const updatedEval: EvaluationResult = {
      ...currentEval,
      catatan_guru: note,
      is_manual_override: true
    };

    const updatedEvals = { ...activeClass.evaluations };
    if (!updatedEvals[student]) updatedEvals[student] = {};
    updatedEvals[student][qNo] = updatedEval;

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
    );

    saveClassesToStorage(updatedClasses);
  };

  const handleResetToAiScore = (student: string, qNo: number) => {
    if (!student || !activeClass) return;
    const currentEval = activeClass.evaluations?.[student]?.[qNo];
    if (!currentEval || currentEval.original_ai_score === undefined) return;

    handleUpdateTotalScore(student, qNo, currentEval.original_ai_score);
    
    // Clear manual override flag
    const updatedEval: EvaluationResult = {
      ...activeClass.evaluations[student][qNo],
      is_manual_override: false
    };
    const updatedEvals = { ...activeClass.evaluations };
    updatedEvals[student][qNo] = updatedEval;
    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
    );
    saveClassesToStorage(updatedClasses);
    setSuccessMsg(`Nilai Soal ${qNo} dikembalikan ke hasil analisis AI (${currentEval.original_ai_score}).`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleInitManualEvaluation = (student: string, qNo: number, customInitialScore?: number) => {
    if (!student || !activeClass) return;
    const qObj = activeClass.questions.find(q => q.nomor_soal === qNo);
    if (!qObj) return;

    const defaultRubrik: RubrikScore[] = qObj.rubrik.map(r => ({
      kriteria: r.kriteria,
      skor_maksimal: r.bobot_skor,
      skor_diperoleh: 0,
      catatan_evaluasi: "Penilaian manual langsung oleh Guru."
    }));

    const targetTotal = customInitialScore !== undefined ? customInitialScore : 0;
    
    if (targetTotal > 0) {
      const sumMax = defaultRubrik.reduce((sum, r) => sum + r.skor_maksimal, 0) || 1;
      let allocated = 0;
      defaultRubrik.forEach((r, idx) => {
        if (idx === defaultRubrik.length - 1) {
          r.skor_diperoleh = Math.min(r.skor_maksimal, Math.max(0, targetTotal - allocated));
        } else {
          const part = Math.min(r.skor_maksimal, Math.round((r.skor_maksimal / sumMax) * targetTotal));
          allocated += part;
          r.skor_diperoleh = part;
        }
      });
    }

    const newEval: EvaluationResult = {
      rincian_rubrik: defaultRubrik,
      total_skor_soal: targetTotal,
      skor_maksimal_soal: qObj.total_skor,
      feedback_diagnostik: "Nilai diberikan secara langsung melalui penilaian manual Guru.",
      is_manual_override: true,
      original_ai_score: 0
    };

    const updatedEvals = { ...activeClass.evaluations };
    if (!updatedEvals[student]) updatedEvals[student] = {};
    updatedEvals[student][qNo] = newEval;

    const updatedClasses = classes.map(c => 
      c.id === activeClass.id ? { ...c, evaluations: updatedEvals } : c
    );

    saveClassesToStorage(updatedClasses);
    setSuccessMsg(`Lembar nilai manual Soal ${qNo} untuk ${student} siap diedit!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Generate Mode 1 Extraction JSON formatted output for Active Class
  const currentClassJson = activeClass.questions.map((q) => ({
    nomor_soal: q.nomor_soal,
    materi: q.materi,
    soal: q.soal,
    kunci_jawaban: q.kunci_jawaban,
    rubrik: q.rubrik.map((r) => ({
      kriteria: r.kriteria,
      bobot_skor: r.bobot_skor,
    })),
    total_skor: q.total_skor,
  }));

  // Generate Mode 2 Evaluation JSON for Selected Student
  const currentStudentJson = {
    nama_siswa: selectedStudent || "N/A",
    kelas: activeClass.name,
    penilaian_per_soal: activeClass.questions.map((q) => {
      const evaluation = activeClass.evaluations?.[selectedStudent]?.[q.nomor_soal];
      return {
        nomor_soal: q.nomor_soal,
        rincian_rubrik: evaluation ? evaluation.rincian_rubrik.map(r => ({
          kriteria: r.kriteria,
          skor_maksimal: r.skor_maksimal,
          skor_diperoleh: r.skor_diperoleh,
          catatan_evaluasi: r.catatan_evaluasi
        })) : q.rubrik.map(r => ({
          kriteria: r.kriteria,
          skor_maksimal: r.bobot_skor,
          skor_diperoleh: 0,
          catatan_evaluasi: "Belum dievaluasi"
        })),
        total_skor_soal: evaluation ? evaluation.total_skor_soal : 0,
        skor_maksimal_soal: q.total_skor || 15,
        feedback_diagnostik: evaluation ? evaluation.feedback_diagnostik : "Jawaban belum diproses oleh AI."
      };
    }),
    total_skor_keseluruhan: activeClass.questions.reduce((sum, q) => {
      const evaluation = activeClass.evaluations?.[selectedStudent]?.[q.nomor_soal];
      return sum + (evaluation ? evaluation.total_skor_soal : 0);
    }, 0)
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download tabular results and intervention as multi-sheet Excel (.xls)
  const handleDownloadExcel = () => {
    if (!activeClass || activeClass.questions.length === 0) {
      alert("Tidak ada pertanyaan untuk diekspor!");
      return;
    }

    // Helper to escape XML strings safely
    const escapeXml = (unsafe: string) => {
      if (!unsafe) return "";
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // Calculate student summaries for remedial/enrichment categorization
    const studentSummaries = activeClass.students.map((student) => {
      let obtained = 0;
      let max = 0;
      const zeroScoreQuestions: number[] = [];
      const weakQuestions: number[] = [];

      activeClass.questions.forEach((q) => {
        const evaluation = activeClass.evaluations?.[student]?.[q.nomor_soal];
        const qMax = q.total_skor || 15;
        max += qMax;
        
        if (evaluation) {
          obtained += evaluation.total_skor_soal;
          if (evaluation.total_skor_soal === 0) {
            zeroScoreQuestions.push(q.nomor_soal);
          }
          if (evaluation.total_skor_soal / qMax < 0.5) {
            weakQuestions.push(q.nomor_soal);
          }
        }
      });

      const pct = max > 0 ? (obtained / max) * 105 : 0; // standard percent bounds
      const normalizedPct = Math.min(100, pct);
      return {
        name: student,
        obtained,
        max,
        pct: normalizedPct,
        weakQuestions,
        zeroScoreQuestions
      };
    });

    const remedialList = studentSummaries.filter(s => s.pct < 50);
    const pengayaanList = studentSummaries.filter(s => s.pct >= 75);

    // Build the XML Workbook string
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Penilai Esai HOTS C4 AI</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:CharSet="1" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#D97706" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E293B"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#1E293B"/>
  </Style>
 </Styles>
 
 <Worksheet ss:Name="Rekap_Penilaian">
  <Table>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="60"/>
   <Column ss:Width="180"/>
   <Column ss:Width="200"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="250"/>
   
   <Row ss:Height="25">
    <Cell ss:StyleID="TitleStyle"><Data ss:Type="String">REKAPITULASI PENILAIAN HOTS C4 BIOLOGI - ${escapeXml(activeClass.name)}</Data></Cell>
   </Row>
   <Row/>
   
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nama Siswa</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Kelas</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">No Soal</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Materi</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Jawaban Siswa</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Skor Diperoleh</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Skor Maksimal</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Persentase (%)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Umpan Balik Diagnostik</Data></Cell>
   </Row>`;

    activeClass.students.forEach(student => {
      activeClass.questions.forEach(q => {
        const evaluation = activeClass.evaluations?.[student]?.[q.nomor_soal];
        const answer = activeClass.answers?.[student]?.[q.nomor_soal] || "";
        
        const scoreObtained = evaluation ? evaluation.total_skor_soal : 0;
        const scoreMax = q.total_skor || evaluation?.skor_maksimal_soal || 15;
        const pct = ((scoreObtained / Math.max(1, scoreMax)) * 100).toFixed(1);
        const feedback = evaluation ? evaluation.feedback_diagnostik : "Belum dievaluasi";

        xml += `
   <Row ss:Height="20">
    <Cell><Data ss:Type="String">${escapeXml(student)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(activeClass.name)}</Data></Cell>
    <Cell><Data ss:Type="String">Soal ${q.nomor_soal}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(q.materi)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(answer)}</Data></Cell>
    <Cell><Data ss:Type="Number">${scoreObtained}</Data></Cell>
    <Cell><Data ss:Type="Number">${scoreMax}</Data></Cell>
    <Cell><Data ss:Type="String">${pct}%</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(feedback)}</Data></Cell>
   </Row>`;
      });
    });

    xml += `
  </Table>
 </Worksheet>
 
 <Worksheet ss:Name="Rekomendasi_Intervensi">
  <Table>
   <Column ss:Width="200"/>
   <Column ss:Width="300"/>
   <Column ss:Width="400"/>
   
   <Row ss:Height="25">
    <Cell ss:StyleID="TitleStyle"><Data ss:Type="String">REKOMENDASI INTERVENSI &amp; REMEDIAL OTOMATIS - ${escapeXml(activeClass.name)}</Data></Cell>
   </Row>
   <Row/>
   
   <!-- KELOMPOK REMEDIAL SECTION -->
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle" ss:MergeAcross="2"><Data ss:Type="String">1. KELOMPOK REMEDIAL (Skor &lt; 50%)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Daftar Nama Siswa</Data></Cell>
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Materi yang Wajib Diulang</Data></Cell>
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Rekomendasi Strategi Pembelajaran Ulang</Data></Cell>
   </Row>`;

    if (remedialList.length === 0) {
      xml += `
   <Row ss:Height="20">
    <Cell ss:MergeAcross="2"><Data ss:Type="String">Luar biasa! Tidak ada siswa di kelas ini yang memerlukan program remedial.</Data></Cell>
   </Row>`;
    } else {
      remedialList.forEach(s => {
        const weakMats = s.weakQuestions.map(qNo => {
          const q = activeClass.questions.find(qi => qi.nomor_soal === qNo);
          return q ? q.materi : "";
        }).filter(Boolean);
        
        const matsText = weakMats.length > 0 ? Array.from(new Set(weakMats)).join(", ") : "Sistem Pencernaan & Sirkulasi";
        const strategyText = interventionReport?.remedial?.rekomendasi_strategi || "Lakukan visualisasi gambar/animasi, pemodelan fungsional, dan latihan perbandingan sebab-akibat.";

        xml += `
   <Row ss:Height="40">
    <Cell><Data ss:Type="String">${escapeXml(s.name)} (Skor: ${s.obtained}/${s.max} | ${s.pct.toFixed(1)}%)</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(matsText)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(strategyText)}</Data></Cell>
   </Row>`;
      });
    }

    xml += `
   <Row/>
   <Row/>
   
   <!-- KELOMPOK PENGAYAAN SECTION -->
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle" ss:MergeAcross="2"><Data ss:Type="String">2. KELOMPOK PENGAYAAN (Skor &gt;= 75%)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Daftar Nama Siswa</Data></Cell>
    <Cell ss:StyleID="SubHeaderStyle" ss:MergeAcross="1"><Data ss:Type="String">Tugas Studi Kasus HOTS Tingkat Lanjut</Data></Cell>
   </Row>`;

    if (pengayaanList.length === 0) {
      xml += `
   <Row ss:Height="20">
    <Cell ss:MergeAcross="2"><Data ss:Type="String">Belum ada siswa yang memenuhi kriteria pengayaan (skor &gt;= 75%).</Data></Cell>
   </Row>`;
    } else {
      pengayaanList.forEach(s => {
        const taskText = interventionReport?.pengayaan?.tugas_hots_lanjut || "Selesaikan studi kasus analisis patofisiologis fungsional sistem pencernaan atau homeostasis sirkulasi.";

        xml += `
   <Row ss:Height="40">
    <Cell><Data ss:Type="String">${escapeXml(s.name)} (Skor: ${s.obtained}/${s.max} | ${s.pct.toFixed(1)}%)</Data></Cell>
    <Cell ss:MergeAcross="1"><Data ss:Type="String">${escapeXml(taskText)}</Data></Cell>
   </Row>`;
      });
    }

    xml += `
   <Row/>
   <Row/>
   
   <!-- PETA MISKONSEPSI KELAS SECTION -->
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle" ss:MergeAcross="2"><Data ss:Type="String">3. RENCANA TINDAK LANJUT GURU (PETA MISKONSEPSI KELAS)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Topik Materi Terlemah</Data></Cell>
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Analisis Miskonsepsi Siswa</Data></Cell>
    <Cell ss:StyleID="SubHeaderStyle"><Data ss:Type="String">Saran Konkret Pengajaran Berikutnya</Data></Cell>
   </Row>`;

    if (interventionReport?.peta_miskonsepsi && Array.isArray(interventionReport.peta_miskonsepsi)) {
      interventionReport.peta_miskonsepsi.forEach((item: any) => {
        xml += `
   <Row ss:Height="45">
    <Cell><Data ss:Type="String">${escapeXml(item.topik)} (Rerata: ${escapeXml(item.rata_rata)})</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(item.analisis_miskonsepsi)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(item.saran_guru)}</Data></Cell>
   </Row>`;
      });
    } else {
      xml += `
   <Row ss:Height="40">
    <Cell><Data ss:Type="String">Struktur &amp; Fungsi Peredaran Darah</Data></Cell>
    <Cell><Data ss:Type="String">Siswa sering tumpang tindih mengenai regulasi fungsional katup vena dan ketahanan dinding arteri.</Data></Cell>
    <Cell><Data ss:Type="String">Gunakan pemodelan aliran air satu arah untuk mendemonstrasikan fungsi katup pembuluh darah.</Data></Cell>
   </Row>
   <Row ss:Height="40">
    <Cell><Data ss:Type="String">Zat Makanan &amp; Pencernaan Enzimatis</Data></Cell>
    <Cell><Data ss:Type="String">Siswa kesulitan membedakan letak sekresi enzim dengan letak proses degradasi nutrisi berlangsung.</Data></Cell>
    <Cell><Data ss:Type="String">Gunakan matriks tabel organ-enzim-substrat-produk dan adakan kuis klasifikasi interaktif.</Data></Cell>
   </Row>`;
    }

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_dan_Intervensi_C4_${activeClass.name.replace(/\s+/g, "_")}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getQuestionScore = (student: string, qNo: number) => {
    return activeClass.evaluations?.[student]?.[qNo]?.total_skor_soal;
  };

  const getStudentTotalScore = (student: string) => {
    return activeClass.questions.reduce((sum, q) => {
      return sum + (getQuestionScore(student, q.nomor_soal) || 0);
    }, 0);
  };

  const getStudentMaxScore = () => {
    return activeClass.questions.reduce((sum, q) => sum + q.total_skor, 0);
  };

  // Helper to update and save PG data to LocalStorage
  const updateAndSavePgData = (classId: string, updatedClassPg: PgClassData) => {
    const updated = {
      ...pgData,
      [classId]: updatedClassPg
    };
    setPgData(updated);
    localStorage.setItem("penilai_pg_data", JSON.stringify(updated));
  };

  const currentClassPg: PgClassData = pgData[activeClassId] || {
    totalQuestions: 10,
    kunciJawaban: {
      1: "A", 2: "B", 3: "C", 4: "D", 5: "A",
      6: "B", 7: "C", 8: "D", 9: "A", 10: "C"
    },
    jawabanSiswa: {},
    hasil: {},
    rekapSaved: {}
  };

  const totalPgCount = currentClassPg.totalQuestions || 10;

  // Change total number of PG questions
  const handleChangeTotalPgQuestions = (newCount: number) => {
    const updatedKunci = { ...currentClassPg.kunciJawaban };
    for (let i = 1; i <= newCount; i++) {
      if (!updatedKunci[i]) {
        updatedKunci[i] = "A";
      }
    }
    const updated = {
      ...currentClassPg,
      totalQuestions: newCount,
      kunciJawaban: updatedKunci
    };
    updateAndSavePgData(activeClassId, updated);
  };

  // Set Master Answer Key for question qNo
  const handleSelectKunciPg = (qNo: number, choice: string) => {
    const updated = {
      ...currentClassPg,
      kunciJawaban: {
        ...currentClassPg.kunciJawaban,
        [qNo]: choice
      }
    };
    updateAndSavePgData(activeClassId, updated);
  };

  // Set Student Answer for question qNo
  const handleSelectJawabanPg = (student: string, qNo: number, choice: string) => {
    const studentAns = { ...(currentClassPg.jawabanSiswa[student] || {}) };
    studentAns[qNo] = choice;
    const updated = {
      ...currentClassPg,
      jawabanSiswa: {
        ...currentClassPg.jawabanSiswa,
        [student]: studentAns
      }
    };
    updateAndSavePgData(activeClassId, updated);
  };

  // Fast Bulk Apply Answer Key (e.g. "ABCDABCDAC" or "A, B, C, D...")
  const handleApplyBulkKunci = () => {
    if (!bulkKunciText.trim()) return;
    const clean = bulkKunciText.toUpperCase().replace(/[^A-E]/g, "");
    if (clean.length === 0) {
      setErrorMsg("Format kunci jawaban tidak valid. Masukkan huruf A, B, C, D, atau E.");
      return;
    }
    const newKunci: Record<number, string> = {};
    for (let i = 0; i < clean.length; i++) {
      newKunci[i + 1] = clean[i];
    }
    const updated = {
      ...currentClassPg,
      totalQuestions: clean.length,
      kunciJawaban: newKunci
    };
    updateAndSavePgData(activeClassId, updated);
    setBulkKunciText("");
    setSuccessMsg(`Berhasil menerapkan ${clean.length} Kunci Jawaban PG!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Fast Bulk Apply Student Answers
  const handleApplyBulkJawaban = (student: string) => {
    if (!bulkJawabanText.trim() || !student) return;
    const clean = bulkJawabanText.toUpperCase().replace(/[^A-E]/g, "");
    if (clean.length === 0) {
      setErrorMsg("Format jawaban siswa tidak valid. Masukkan huruf A, B, C, D, atau E.");
      return;
    }
    const newAns = { ...(currentClassPg.jawabanSiswa[student] || {}) };
    for (let i = 0; i < clean.length; i++) {
      newAns[i + 1] = clean[i];
    }
    const updated = {
      ...currentClassPg,
      jawabanSiswa: {
        ...currentClassPg.jawabanSiswa,
        [student]: newAns
      }
    };
    updateAndSavePgData(activeClassId, updated);
    setBulkJawabanText("");
    setSuccessMsg(`Berhasil mengisi ${clean.length} jawaban untuk ${student}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Quick preset answers for testing
  const handleInjectPgPreset = (student: string, presetType: "ahmad" | "budi" | "cici" | "empty") => {
    if (!student) return;
    let newAnswers: Record<number, string> = {};
    const total = currentClassPg.totalQuestions || 10;
    
    if (presetType === "ahmad") {
      // 9 Benar, 1 Salah
      for (let i = 1; i <= total; i++) {
        const k = currentClassPg.kunciJawaban[i] || "A";
        newAnswers[i] = i === total ? (k === "A" ? "B" : "A") : k;
      }
    } else if (presetType === "cici") {
      // 100% Benar
      for (let i = 1; i <= total; i++) {
        newAnswers[i] = currentClassPg.kunciJawaban[i] || "A";
      }
    } else if (presetType === "budi") {
      // 50% Benar (Remedial)
      for (let i = 1; i <= total; i++) {
        const k = currentClassPg.kunciJawaban[i] || "A";
        newAnswers[i] = i % 2 === 0 ? (k === "A" ? "B" : "A") : k;
      }
    } else {
      newAnswers = {};
    }

    const updated = {
      ...currentClassPg,
      jawabanSiswa: {
        ...currentClassPg.jawabanSiswa,
        [student]: newAnswers
      }
    };
    updateAndSavePgData(activeClassId, updated);
    setSuccessMsg(`Preset jawaban berhasil dimasukkan untuk ${student}!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Calculate student essay score on a 0-100 scale
  const getStudentEssayScore = (student: string): number => {
    let obtained = 0;
    let max = 0;
    (activeClass.questions || []).forEach((q) => {
      const ev = activeClass.evaluations?.[student]?.[q.nomor_soal];
      const qMax = q.total_skor || 15;
      max += qMax;
      if (ev) {
        obtained += ev.total_skor_soal;
      }
    });
    return max > 0 ? Math.round((obtained / max) * 100) : 0;
  };

  // Process PG Analysis via Google Apps Script (NO GEMINI API KEY)
  const handleAnalisisPG = async (studentName: string) => {
    if (!studentName) {
      setErrorMsg("Pilih siswa terlebih dahulu.");
      return;
    }

    const total = currentClassPg.totalQuestions || 10;
    const kunciArray: string[] = [];
    const jawabanArray: string[] = [];

    for (let i = 1; i <= total; i++) {
      kunciArray.push((currentClassPg.kunciJawaban[i] || "A").toUpperCase());
      jawabanArray.push((currentClassPg.jawabanSiswa[studentName]?.[i] || "-").toUpperCase());
    }

    setPgLoading(true);
    setErrorMsg(null);

    const payload = {
      action: "ANALISIS_PG",
      jawaban_siswa: jawabanArray,
      kunci_jawaban: kunciArray
    };

    try {
      const res = await fetch("/api/gas-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menghubungkan ke Google Apps Script Web App");
      }

      const data = await res.json();
      
      const score = Number(data.skor_pg !== undefined ? data.skor_pg : 0);
      const statusTuntas = score >= 75 ? "TUNTAS" : "REMEDIAL";
      
      const formattedResult: PgResult = {
        status: data.status || "success",
        tipe: data.tipe || "PG",
        jumlah_benar: data.jumlah_benar !== undefined ? data.jumlah_benar : (data.detail?.filter((d: any) => d.status === "BENAR").length || 0),
        total_soal: data.total_soal || total,
        skor_pg: score,
        status_tuntas: statusTuntas,
        detail: Array.isArray(data.detail) ? data.detail : kunciArray.map((k, idx) => ({
          no_soal: idx + 1,
          jawaban_siswa: jawabanArray[idx],
          kunci: k,
          status: jawabanArray[idx] === k ? "BENAR" : "SALAH",
          skor: jawabanArray[idx] === k ? 1 : 0
        })),
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };

      const updated = {
        ...currentClassPg,
        hasil: {
          ...currentClassPg.hasil,
          [studentName]: formattedResult
        }
      };

      updateAndSavePgData(activeClassId, updated);
      setSuccessMsg(`Analisis PG ${studentName} selesai! Skor: ${score} (${statusTuntas}) via Google Sheets.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      // Fallback local grading if Google Apps Script is unreachable
      let benarCount = 0;
      const localDetail: PgDetail[] = kunciArray.map((k, idx) => {
        const ans = jawabanArray[idx];
        const isCorrect = ans === k;
        if (isCorrect) benarCount++;
        return {
          no_soal: idx + 1,
          jawaban_siswa: ans,
          kunci: k,
          status: isCorrect ? "BENAR" : "SALAH",
          skor: isCorrect ? 1 : 0
        };
      });
      const localScore = Math.round((benarCount / Math.max(1, total)) * 100);
      const localStatus = localScore >= 75 ? "TUNTAS" : "REMEDIAL";

      const fallbackResult: PgResult = {
        status: "success",
        tipe: "PG",
        jumlah_benar: benarCount,
        total_soal: total,
        skor_pg: localScore,
        status_tuntas: localStatus,
        detail: localDetail,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };

      const updated = {
        ...currentClassPg,
        hasil: {
          ...currentClassPg.hasil,
          [studentName]: fallbackResult
        }
      };
      updateAndSavePgData(activeClassId, updated);
      setSuccessMsg(`Analisis PG ${studentName} selesai! Skor: ${localScore} (${localStatus}).`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setPgLoading(false);
    }
  };

  // Save student PG + Essay score recap to Google Drive via Google Apps Script
  const handleSimpanRekap = async (studentName: string) => {
    if (!studentName) return;

    const skorPg = currentClassPg.hasil?.[studentName]?.skor_pg ?? 0;
    const skorEssay = getStudentEssayScore(studentName);

    setSavingRekap(true);
    setErrorMsg(null);

    const payload = {
      action: "SIMPAN_REKAP",
      nama_siswa: studentName,
      kelas: activeClass.name,
      skor_pg: skorPg,
      skor_essay: skorEssay
    };

    try {
      const res = await fetch("/api/gas-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan rekap ke Google Drive.");
      }

      const data = await res.json();
      const updated = {
        ...currentClassPg,
        rekapSaved: {
          ...currentClassPg.rekapSaved,
          [studentName]: {
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            message: data.message || `Data ${studentName} berhasil disimpan ke Google Drive!`,
            total_nilai: data.total_nilai,
            status_tuntas: data.status_tuntas
          }
        }
      };

      updateAndSavePgData(activeClassId, updated);
      setSuccessMsg(data.message || `Rekap ${studentName} (Skor PG: ${skorPg}, Esai: ${skorEssay}) berhasil disimpan ke Google Drive Spreadsheet!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menyimpan rekap ke Google Drive.");
    } finally {
      setSavingRekap(false);
    }
  };

  // Batch save all students' scores to Google Drive
  const handleBatchSimpanRekap = async () => {
    const students = activeClass.students || [];
    if (students.length === 0) return;

    setBatchSavingRekap(true);
    setErrorMsg(null);
    let successCount = 0;
    const updatedRekap = { ...currentClassPg.rekapSaved };

    for (const student of students) {
      const skorPg = currentClassPg.hasil?.[student]?.skor_pg ?? 0;
      const skorEssay = getStudentEssayScore(student);

      try {
        const res = await fetch("/api/gas-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SIMPAN_REKAP",
            nama_siswa: student,
            kelas: activeClass.name,
            skor_pg: skorPg,
            skor_essay: skorEssay
          })
        });
        if (res.ok) {
          const data = await res.json();
          successCount++;
          updatedRekap[student] = {
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            message: data.message || `Data ${student} berhasil disimpan ke Google Drive!`,
            total_nilai: data.total_nilai,
            status_tuntas: data.status_tuntas
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    const updated = {
      ...currentClassPg,
      rekapSaved: updatedRekap
    };
    updateAndSavePgData(activeClassId, updated);
    setBatchSavingRekap(false);
    setSuccessMsg(`Berhasil menyimpan rekap ${successCount} dari ${students.length} siswa ke Google Drive Spreadsheet!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2620] font-sans antialiased pb-12">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFECE6] shadow-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1A1510] flex items-center gap-2">
                Asesmen Esai C4 (HOTS)
                <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">
                  Kurikulum Merdeka
                </span>
              </h1>
              <p className="text-xs text-[#7F7466]">
                SMP Negeri 2 Puriala / Suherman, S.Pd.Gr.
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex flex-wrap items-center bg-[#F5F2EC] p-1 rounded-xl border border-[#E9E5DC] gap-1">
            <button
              onClick={() => setActiveTab("penilaian")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "penilaian"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-[#7F7466] hover:text-[#2C2620]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Penilaian Esai HOTS (AI)
            </button>
            <button
              onClick={() => setActiveTab("pilihan-ganda")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "pilihan-ganda"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[#7F7466] hover:text-[#2C2620]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Penilaian Pilihan Ganda (Google Sheets)
            </button>
            <button
              onClick={() => setActiveTab("materi-soal")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "materi-soal"
                  ? "bg-white text-[#2C2620] shadow-xs"
                  : "text-[#7F7466] hover:text-[#2C2620]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Upload PDF Kartu Soal
            </button>
            <button
              onClick={() => setActiveTab("json-output")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "json-output"
                  ? "bg-white text-[#2C2620] shadow-xs"
                  : "text-[#7F7466] hover:text-[#2C2620]"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              JSON Output
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {/* Class Selection Strip */}
        <section className="mb-6 bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#7F7466] flex items-center gap-1.5 uppercase tracking-wide mr-2">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                Pilih Kelas Aktif:
              </span>
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleSelectClass(cls.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer border ${
                    activeClassId === cls.id
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-[#FDFBF7] text-[#4A3E31] border-[#EFECE6] hover:bg-[#F5F2EC]"
                  }`}
                >
                  {cls.name}
                  <span className="ml-1.5 text-[10px] opacity-80 font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">
                    {cls.students?.length || 0} Siswa
                  </span>
                </button>
              ))}

              {/* Toggle Inline Add Class Form */}
              {!showAddClassInline ? (
                <button
                  onClick={() => setShowAddClassInline(true)}
                  className="p-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Kelas
                </button>
              ) : (
                <form onSubmit={handleAddClass} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Contoh: Kelas 9D"
                    className="bg-[#FDFBF7] border border-[#EFECE6] rounded-xl px-3 py-1.5 text-xs font-bold w-36 focus:ring-1 focus:ring-amber-500 text-[#2C2620]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddClassInline(false)}
                    className="text-xs font-semibold text-[#7F7466] hover:text-[#2C2620] px-2"
                  >
                    Batal
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto">
              <button
                onClick={() => handleDeleteClass(activeClass.id)}
                className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Hapus kelas aktif saat ini secara permanen"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Kelas Aktif
              </button>
              <button
                onClick={resetToSeed}
                title="Selesaikan inisialisasi / setel ulang LocalStorage ke seed default"
                className="px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1.5 transition cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Ke Seed Default (Ahmad 9A)
              </button>
            </div>
          </div>
        </section>

        {/* Global Notifications */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 border border-rose-500/15 p-4 rounded-xl flex items-start gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-rose-950">Terjadi Kendala</h5>
                <p className="text-xs text-rose-800 mt-1">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-500/15 p-4 rounded-xl flex items-start gap-3 mb-6"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-950">Berhasil</h5>
                <p className="text-xs text-emerald-800 mt-1">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Views */}
        <AnimatePresence mode="wait">
          {/* TAB 1: PENILAIAN SISWA */}
          {activeTab === "penilaian" && (
            <motion.div
              key="penilaian-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left sidebar: Student Roster (4 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
                  <h3 className="font-bold text-[#1A1510] text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Siswa {activeClass.name}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Roster Kelas
                    </span>
                  </h3>

                  {/* Add Student Form */}
                  <form onSubmit={handleAddStudent} className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Tambah nama siswa..."
                      className="flex-1 bg-[#FDFBF7] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-amber-500 text-[#2C2620]"
                      required
                    />
                    <button
                      type="submit"
                      className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer shadow-xs transition"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Student list */}
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {activeClass.students.length === 0 ? (
                      <div className="text-center py-6 text-xs text-[#7F7466] font-medium bg-[#FDFBF7] rounded-xl border border-dashed border-[#EFECE6]">
                        Belum ada siswa.
                      </div>
                    ) : (
                      activeClass.students.map((student) => {
                        const isSelected = selectedStudent === student;
                        const scoreObtained = getStudentTotalScore(student);
                        const maxScore = getStudentMaxScore();
                        const isEvaluated = activeClass.questions.some(q => 
                          activeClass.evaluations?.[student]?.[q.nomor_soal]
                        );

                        return (
                          <div
                            key={student}
                            className={`w-full group rounded-xl p-2.5 border transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? "bg-amber-500/5 border-amber-500/20 shadow-2xs"
                                : "bg-white border-transparent hover:bg-[#FDFBF7]"
                            }`}
                          >
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="flex-1 text-left flex items-center gap-2.5 cursor-pointer"
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                isSelected ? "bg-amber-600 text-white" : "bg-[#F5F2EC] text-[#4A3E31]"
                              }`}>
                                {student.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#1A1510] truncate group-hover:text-amber-700 transition">
                                  {student}
                                </p>
                                <p className="text-[10px] text-[#7F7466] font-semibold">
                                  {isEvaluated ? `Skor: ${scoreObtained}/${maxScore}` : "Belum dinilai"}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#7F7466] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                              title="Hapus siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Export Card */}
                {activeClass.students.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-extrabold text-amber-900 uppercase">Ekspor Hasil Kelas</h4>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                      Unduh rekap penilaian seluruh siswa kelas <strong>{activeClass.name}</strong> dalam format Excel (.XLS) multi-lembar terintegrasi intervensi.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleDownloadExcel}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Unduh Hasil Excel (.XLS)
                      </button>

                      <button
                        onClick={handleGenerateIntervention}
                        disabled={generatingIntervention}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingIntervention ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Menganalisis...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            Generate Analisis Intervensi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Detail Area: Answers & Evaluation Output (9 cols) */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                {!selectedStudent ? (
                  <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <Users className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="font-bold text-[#1A1510] text-sm">Tidak Ada Siswa Terpilih</h3>
                    <p className="text-xs text-[#7F7466] mt-1 max-w-sm">
                      Silakan pilih salah satu siswa dari daftar roster di samping kiri, atau buat nama siswa baru jika daftar masih kosong.
                    </p>
                  </div>
                ) : activeClass.questions.length === 0 ? (
                  <div className="bg-white border border-[#EFECE6] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="font-bold text-[#1A1510] text-sm">Daftar Soal Masih Kosong</h3>
                    <p className="text-xs text-[#7F7466] mt-1 max-w-sm">
                      Paket soal untuk kelas ini belum dimuat. Silakan beralih ke tab <strong>"Upload PDF Kartu Soal"</strong> untuk mengunggah file PDF kartu soal Anda.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Student Info Strip */}
                    <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-800 font-black text-sm rounded-full flex items-center justify-center">
                          {selectedStudent.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A1510]">
                            Jawaban Siswa: {selectedStudent} ({activeClass.name})
                          </h4>
                          <p className="text-xs text-[#7F7466] font-semibold mt-0.5">
                            Status: {Object.keys(activeClass.evaluations?.[selectedStudent] || {}).length} dari {activeClass.questions.length} Soal Dinilai
                          </p>
                        </div>
                      </div>

                      {/* Action buttons: Quick Edit Matrix & Evaluate All */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowQuickScoreTable(!showQuickScoreTable)}
                          className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                            showQuickScoreTable
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-[#FDFBF7] text-[#4A3E31] border-[#EFECE6] hover:bg-amber-50"
                          }`}
                          title="Buka panel rekap dan edit cepat nilai per soal untuk siswa ini"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-700" />
                          {showQuickScoreTable ? "Tutup Edit Cepat" : "Edit Nilai Semua Soal"}
                        </button>

                        {autoSaveActive && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold animate-pulse">
                            Auto-saving...
                          </span>
                        )}
                        <button
                          onClick={handleEvaluateAll}
                          disabled={evaluatingAll}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {evaluatingAll ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Mengevaluasi {evaluatingNo ? `Soal ${evaluatingNo}...` : "..."}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-100 animate-pulse" />
                              Proses Analisis Semua Jawaban
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Score Editor Matrix Collapsible Panel */}
                    <AnimatePresence>
                      {showQuickScoreTable && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="bg-[#FDFBF7] border border-amber-300/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                            <div className="flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-amber-700" />
                              <h5 className="font-extrabold text-xs text-amber-950 uppercase tracking-wide">
                                Panel Edit Nilai Cepat Guru: {selectedStudent} ({activeClass.name})
                              </h5>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-bold text-[#7F7466]">
                                Total Nilai Esai:{" "}
                                <strong className="text-amber-800 text-sm font-black">
                                  {getStudentTotalScore(selectedStudent)}
                                </strong>{" "}
                                / {getStudentMaxScore()}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                (Perubahan otomatis tersimpan)
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeClass.questions.map((q) => {
                              const ev = activeClass.evaluations?.[selectedStudent]?.[q.nomor_soal];
                              const currentScore = ev ? ev.total_skor_soal : 0;
                              const isSelected = selectedNo === q.nomor_soal;

                              return (
                                <div
                                  key={q.nomor_soal}
                                  className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                                    isSelected
                                      ? "bg-white border-amber-500 shadow-xs ring-1 ring-amber-400"
                                      : "bg-white border-[#EFECE6] hover:border-amber-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-xs text-[#1A1510]">
                                      Soal {q.nomor_soal}
                                    </span>
                                    {ev?.is_manual_override ? (
                                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Check className="w-2.5 h-2.5" /> Diedit Guru
                                      </span>
                                    ) : ev ? (
                                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                        Hasil AI
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                        Belum Dinilai
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-[#5C5143] font-medium truncate" title={q.materi}>
                                    {q.materi}
                                  </p>

                                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-[#7F7466]">Nilai:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={q.total_skor}
                                        value={ev ? ev.total_skor_soal : ""}
                                        placeholder="0"
                                        onChange={(e) =>
                                          handleUpdateTotalScore(
                                            selectedStudent,
                                            q.nomor_soal,
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-12 text-center font-black text-xs bg-[#FDFBF7] border border-amber-400 rounded-md py-1 text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                      />
                                      <span className="text-[10px] text-gray-500 font-bold">/ {q.total_skor}</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedNo(q.nomor_soal)}
                                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                                    >
                                      Buka Detail & Rubrik
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Question Select Loop */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Sub-panel Question selector */}
                      <div className="md:col-span-4 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-[#7F7466] uppercase tracking-wider mb-1 px-1">
                          Butir Soal
                        </span>
                        <div className="space-y-1.5 max-h-96 overflow-y-auto">
                          {activeClass.questions.map((q) => {
                            const isSelected = selectedNo === q.nomor_soal;
                            const hasAns = activeClass.answers?.[selectedStudent]?.[q.nomor_soal]?.trim().length > 0;
                            const isGraded = activeClass.evaluations?.[selectedStudent]?.[q.nomor_soal] !== undefined;
                            const score = getQuestionScore(selectedStudent, q.nomor_soal);

                            return (
                              <button
                                key={q.nomor_soal}
                                onClick={() => setSelectedNo(q.nomor_soal)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition flex flex-col gap-1 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#1A1510] text-[#FDFBF7] border-[#1A1510] shadow-xs"
                                    : "bg-white border-[#EFECE6] text-[#2C2620] hover:bg-[#FDFBF7]"
                                }`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className={`font-bold ${isSelected ? "text-amber-400" : "text-amber-800"}`}>
                                    Soal {q.nomor_soal}
                                  </span>
                                  {isGraded ? (
                                    <span className={`font-black rounded px-1.5 py-0.5 text-[9px] ${
                                      isSelected ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-50 text-emerald-800"
                                    }`}>
                                      Skor: {score}/{q.total_skor}
                                    </span>
                                  ) : hasAns ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  ) : null}
                                </div>
                                <p className={`font-semibold truncate w-full ${isSelected ? "text-[#E9E5DC]" : "text-[#4A3E31]"}`}>
                                  {q.materi}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Answer Entry & Specific Output Details */}
                      {activeClass.questions.find(q => q.nomor_soal === selectedNo) && (() => {
                        const qObj = activeClass.questions.find(q => q.nomor_soal === selectedNo)!;
                        const studentAnswer = activeClass.answers?.[selectedStudent]?.[selectedNo] || "";
                        const evalResult = activeClass.evaluations?.[selectedStudent]?.[selectedNo];

                        return (
                          <div className="md:col-span-8 flex flex-col gap-5 bg-white border border-[#EFECE6] p-5 rounded-2xl">
                            {/* Question details */}
                            <div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] bg-amber-500/10 text-amber-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                  {qObj.materi}
                                </span>
                                <button
                                  onClick={() => handleDeleteQuestion(qObj.nomor_soal)}
                                  className="px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition"
                                  title={`Hapus Soal ${qObj.nomor_soal} secara permanen`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hapus Soal {qObj.nomor_soal}
                                </button>
                              </div>
                              <h5 className="font-extrabold text-[#1A1510] text-sm mt-3">
                                Soal {qObj.nomor_soal} (Esai HOTS C4):
                              </h5>
                              <p className="text-xs text-[#2C2620] font-medium leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#F0EDE6] mt-2">
                                {qObj.soal}
                              </p>
                            </div>

                            {/* Collapsible reference answer keys & rubrics */}
                            <details className="group border border-[#EFECE6] rounded-xl overflow-hidden">
                              <summary className="bg-[#FDFBF7] px-4 py-3 text-xs font-bold text-[#4A3E31] cursor-pointer flex justify-between items-center select-none">
                                <span className="flex items-center gap-1.5 text-emerald-800 font-extrabold uppercase tracking-wide">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Kunci Jawaban Acuan & Rubrik Penskoran
                                </span>
                                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-[#7F7466]" />
                              </summary>
                              <div className="p-4 border-t border-[#EFECE6] space-y-4 text-xs bg-white">
                                <div>
                                  <h6 className="font-bold text-emerald-950 mb-1">Kunci Jawaban Acuan:</h6>
                                  <p className="text-emerald-900 leading-relaxed font-semibold whitespace-pre-line bg-emerald-50/20 p-2.5 rounded-lg">
                                    {qObj.kunci_jawaban}
                                  </p>
                                </div>
                                <div className="border-t border-gray-100 pt-3">
                                  <h6 className="font-bold text-blue-950 mb-2">Rubrik Penskoran C4:</h6>
                                  <div className="space-y-1.5">
                                    {qObj.rubrik.map((r, i) => (
                                      <div key={i} className="flex justify-between items-start gap-4 p-2 bg-blue-50/15 border border-blue-500/5 rounded-md">
                                        <p className="text-[#3A3228] font-medium flex-1">
                                          <span className="font-bold text-blue-800 mr-1">{i + 1}.</span>
                                          {r.kriteria}
                                        </p>
                                        <span className="font-bold text-blue-900 bg-blue-100/50 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                                          Skor {r.bobot_skor}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </details>

                            {/* Preset inject button (For easily loading Ahmad's answers requested) */}
                            {presetAnswers[qObj.nomor_soal] && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-extrabold text-[#7F7466] uppercase">Uji Coba Jawaban:</span>
                                {presetAnswers[qObj.nomor_soal].map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleInjectPreset(qObj.nomor_soal, preset.text)}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer border ${
                                      preset.isIrrelevant
                                        ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
                                        : "bg-[#F5F2EC] hover:bg-amber-100 text-[#4A3E31] border-[#E9E5DC]"
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Strict Evidence-Based & Relevance Detection Policy Pill */}
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2.5 text-[11px] text-amber-950">
                              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="font-extrabold text-amber-900 block mb-0.5 uppercase tracking-wider text-[10px]">
                                  Prinsip Penilaian: Deteksi Relevansi &amp; Bukti Teks Eksplisit
                                </span>
                                <span className="text-[#685B4E]">
                                  Jawaban yang tidak relevan atau di luar konteks soal otomatis diberikan <strong>Skor 0</strong> ("Jawaban tidak relevan dengan soal/kriteria yang diminta."). Sistem tidak akan menambah skor tanpa bukti tertulis eksplisit.
                                </span>
                              </div>
                            </div>

                            {/* Textarea answer entry */}
                            <div>
                              <label className="block text-xs font-bold text-[#4A3E31] mb-1.5 uppercase">
                                Masukkan Jawaban {selectedStudent}:
                              </label>
                              <textarea
                                value={studentAnswer}
                                onChange={(e) => handleAnswerChange(qObj.nomor_soal, e.target.value)}
                                placeholder="Masukkan jawaban lengkap siswa di sini. Jawaban otomatis tersimpan ke LocalStorage kelas."
                                className="w-full h-32 bg-[#FDFBF7] border border-[#EFECE6] rounded-xl p-3 text-xs text-[#2C2620] focus:ring-1 focus:ring-amber-500 transition-all font-medium leading-relaxed resize-none"
                              />
                            </div>

                            {/* Process grading button for this question */}
                            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#EFECE6] pt-4">
                              <button
                                type="button"
                                onClick={() => handleInitManualEvaluation(selectedStudent, qObj.nomor_soal)}
                                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                title="Beri atau ubah nilai secara manual tanpa harus menunggu proses AI"
                              >
                                <PenLine className="w-3.5 h-3.5 text-emerald-700" />
                                {evalResult ? "Beri Nilai Manual Guru" : "Beri Nilai Manual"}
                              </button>

                              <button
                                type="button"
                                onClick={() => evaluateQuestion(qObj.nomor_soal)}
                                disabled={evaluatingNo === qObj.nomor_soal || studentAnswer.trim().length === 0}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                {evaluatingNo === qObj.nomor_soal ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Menganalisis...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-100 animate-pulse" />
                                    Proses Analisis Soal {qObj.nomor_soal}
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Result details with Teacher Manual Score Editing */}
                            {evalResult && (
                              <div className="mt-4 border-t border-dashed border-amber-500/20 pt-4 space-y-4">
                                {/* Score Banner with Direct Teacher Score Adjustment */}
                                <div className={`text-white px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  evalResult.total_skor_soal === 0 ? "bg-rose-700" : "bg-amber-600"
                                }`}>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                                        {evalResult.total_skor_soal === 0 ? "Hasil Analisis: Tidak Relevan / Skor 0" : "Hasil Analisis Soal"}
                                      </span>
                                      {evalResult.is_manual_override && (
                                        <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                          <Check className="w-2.5 h-2.5" /> Disesuaikan Guru
                                        </span>
                                      )}
                                    </div>
                                    <h6 className="font-extrabold text-xs mt-1">Analisis Penalaran C4</h6>
                                  </div>

                                  {/* Interactive Total Score Adjustment by Teacher */}
                                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                                    <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mr-1">
                                      Edit Nilai:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTotalScore(selectedStudent, qObj.nomor_soal, evalResult.total_skor_soal - 1)}
                                      disabled={evalResult.total_skor_soal <= 0}
                                      className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 text-white font-black flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                                      title="Kurangi nilai 1 poin"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min={0}
                                        max={evalResult.skor_maksimal_soal}
                                        value={evalResult.total_skor_soal}
                                        onChange={(e) => handleUpdateTotalScore(selectedStudent, qObj.nomor_soal, parseInt(e.target.value) || 0)}
                                        className="w-12 text-center font-black text-sm bg-white text-[#1A1510] rounded-md py-0.5 shadow-inner focus:ring-2 focus:ring-amber-300 focus:outline-none"
                                        title="Ketikkan nilai total yang diinginkan"
                                      />
                                      <span className="text-xs text-amber-100 font-bold">/ {evalResult.skor_maksimal_soal}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTotalScore(selectedStudent, qObj.nomor_soal, evalResult.total_skor_soal + 1)}
                                      disabled={evalResult.total_skor_soal >= evalResult.skor_maksimal_soal}
                                      className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 text-white font-black flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                                      title="Tambah nilai 1 poin"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>

                                    {evalResult.is_manual_override && evalResult.original_ai_score !== undefined && (
                                      <button
                                        type="button"
                                        onClick={() => handleResetToAiScore(selectedStudent, qObj.nomor_soal)}
                                        className="ml-2 text-[10px] text-amber-200 hover:text-white underline flex items-center gap-0.5 cursor-pointer"
                                        title={`Kembalikan ke skor awal AI: ${evalResult.original_ai_score}`}
                                      >
                                        <Undo className="w-3 h-3" />
                                        Reset AI
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Rubric breakdowns with Criterion Score Stepper */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7F7466] flex items-center gap-1.5">
                                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                                      Penyesuaian Skor per Kriteria Rubrik:
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500">
                                      *Guru dapat mengubah nilai masing-masing kriteria di bawah ini
                                    </span>
                                  </div>

                                  {evalResult.rincian_rubrik?.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-3 text-xs flex flex-col gap-2 rounded-xl border transition-all ${
                                        item.skor_diperoleh === 0
                                          ? "bg-rose-50/50 border-rose-200"
                                          : "bg-[#FDFBF7] border-[#EFECE6]"
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <p className="font-extrabold text-[#1A1510] leading-relaxed flex-1">
                                          <span className="text-[9px] text-[#7F7466] font-bold uppercase block mb-0.5">Kriteria {idx + 1}</span>
                                          {item.kriteria}
                                        </p>

                                        {/* Stepper Score Adjuster per Criterion */}
                                        <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-lg border border-[#EFECE6] shadow-2xs">
                                          <span className="text-[10px] font-bold text-[#7F7466] mr-1">Nilai:</span>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateCriterionScore(selectedStudent, qObj.nomor_soal, idx, item.skor_diperoleh - 1)}
                                            disabled={item.skor_diperoleh <= 0}
                                            className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-[#2C2620] font-black flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Kurangi 1 poin"
                                          >
                                            <Minus className="w-2.5 h-2.5" />
                                          </button>
                                          <input
                                            type="number"
                                            min={0}
                                            max={item.skor_maksimal}
                                            value={item.skor_diperoleh}
                                            onChange={(e) => handleUpdateCriterionScore(selectedStudent, qObj.nomor_soal, idx, parseInt(e.target.value) || 0)}
                                            className="w-10 text-center font-black text-xs bg-[#FDFBF7] border border-amber-300 rounded py-0.5 text-amber-900 focus:outline-none"
                                          />
                                          <span className="text-[10px] text-gray-500 font-bold">/ {item.skor_maksimal}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateCriterionScore(selectedStudent, qObj.nomor_soal, idx, item.skor_diperoleh + 1)}
                                            disabled={item.skor_diperoleh >= item.skor_maksimal}
                                            className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-[#2C2620] font-black flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Tambah 1 poin"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      </div>

                                      <p
                                        className={`leading-relaxed p-2.5 rounded-lg border font-medium ${
                                          item.skor_diperoleh === 0
                                            ? "bg-white text-rose-900 border-rose-200 font-semibold"
                                            : "bg-white text-[#5C5143] border-[#F0EDE6]"
                                        }`}
                                      >
                                        <strong className={`mr-1 text-[10px] uppercase block mb-0.5 ${
                                          item.skor_diperoleh === 0 ? "text-rose-600 font-black" : "text-[#7F7466]"
                                        }`}>
                                          {item.skor_diperoleh === 0 && item.catatan_evaluasi.toLowerCase().includes("tidak relevan")
                                            ? "Deteksi Relevansi:"
                                            : "Analisis Evaluasi:"}
                                        </strong>
                                        {item.catatan_evaluasi}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Teacher Feedback / Custom Note */}
                                <div className="bg-[#FDFBF7] border border-[#EFECE6] p-3 rounded-xl flex flex-col gap-1.5">
                                  <label className="text-[10px] font-extrabold text-[#7F7466] uppercase flex items-center gap-1.5">
                                    <Edit3 className="w-3 h-3 text-amber-700" />
                                    Catatan / Rekomendasi Tambahan Guru (Opsional):
                                  </label>
                                  <input
                                    type="text"
                                    value={evalResult.catatan_guru || ""}
                                    onChange={(e) => handleUpdateTeacherNote(selectedStudent, qObj.nomor_soal, e.target.value)}
                                    placeholder="Tuliskan catatan khusus atau revisi guru untuk siswa ini..."
                                    className="bg-white border border-[#EFECE6] rounded-lg p-2 text-xs text-[#2C2620] focus:ring-1 focus:ring-amber-500 font-medium"
                                  />
                                </div>

                                {/* Diagnostic feedback */}
                                <div className={`p-4 rounded-xl flex gap-3 border ${
                                  evalResult.total_skor_soal === 0
                                    ? "bg-rose-500/5 border-rose-500/20 text-rose-950"
                                    : "bg-amber-500/5 border-amber-500/15"
                                }`}>
                                  <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
                                    evalResult.total_skor_soal === 0 ? "text-rose-600" : "text-amber-600"
                                  }`} />
                                  <div className="text-xs">
                                    <h6 className={`font-extrabold uppercase ${
                                      evalResult.total_skor_soal === 0 ? "text-rose-900" : "text-amber-900"
                                    }`}>
                                      Umpan Balik Diagnostik
                                    </h6>
                                    <p className="text-amber-950 font-semibold leading-relaxed mt-1.5 whitespace-pre-line bg-white/40 p-2.5 rounded-lg border border-amber-500/10">
                                      {evalResult.feedback_diagnostik}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>

              {/* Laporan Intervensi Pembelajaran Panel */}
              {activeClass.students.length > 0 && (
                <div className="lg:col-span-12 mt-6">
                  <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EDE6] pb-4 mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl text-amber-800 border border-amber-500/15">
                          <Sparkles className="w-5 h-5 text-amber-700 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#1A1510] text-sm uppercase tracking-wide">
                            Intervensi Pembelajaran &amp; Remedial Otomatis
                          </h3>
                          <p className="text-[11px] text-[#7F7466] font-semibold mt-0.5">
                            Kategori remedial otomatis, pengayaan HOTS lanjut, dan pemetaan miskonsepsi pembelajaran.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateIntervention}
                        disabled={generatingIntervention}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingIntervention ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Merumuskan Laporan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                            Generate Analisis Intervensi
                          </>
                        )}
                      </button>
                    </div>

                    {!interventionReport ? (
                      <div className="text-center py-10 bg-[#FDFBF7] border border-dashed border-[#EFECE6] rounded-xl">
                        <Sparkles className="w-10 h-10 text-amber-600/30 mx-auto mb-2 animate-bounce" />
                        <h4 className="text-xs font-bold text-[#1A1510]">Laporan Belum Di-generate</h4>
                        <p className="text-[10px] text-[#7F7466] mt-1 max-w-md mx-auto">
                          Klik tombol <strong>"Generate Analisis Intervensi"</strong> di atas atau di sidebar ekspor untuk memulai perumusan analisis remedial dan pengayaan otomatis berbasis kecerdasan buatan.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Kelompok Remedial (Score < 50%) - 4 Cols */}
                        <div className="xl:col-span-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                            <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">Kelompok Remedial (Skor &lt; 50%)</h4>
                          </div>

                          <div>
                            <span className="text-[9px] text-rose-950 font-extrabold uppercase block mb-1">Daftar Siswa Remedial</span>
                            <div className="flex flex-wrap gap-1.5">
                              {interventionReport?.remedial?.daftar_siswa?.length > 0 ? (
                                interventionReport.remedial.daftar_siswa.map((name: string) => (
                                  <span key={name} className="px-2.5 py-1 bg-rose-100 text-rose-850 font-bold rounded-lg border border-rose-200 text-[10px]">
                                    {name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-500 font-bold italic">Tidak ada siswa remedial.</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] text-rose-950 font-extrabold uppercase block mb-1">Materi yang Wajib Diulang</span>
                            <div className="flex flex-wrap gap-1.5">
                              {interventionReport?.remedial?.materi_wajib_diulang?.length > 0 ? (
                                interventionReport.remedial.materi_wajib_diulang.map((materi: string) => (
                                  <span key={materi} className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded border border-rose-200/50 text-[9px]">
                                    {materi}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-500 font-bold italic">Tidak ada materi wajib diulang.</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-3 border-t border-rose-500/10">
                            <span className="text-[9px] text-rose-950 font-extrabold uppercase block mb-1.5">Rekomendasi Strategi Pembelajaran Ulang</span>
                            <p className="text-[11px] text-rose-950 leading-relaxed font-medium bg-rose-100/30 p-3 rounded-lg border border-rose-200/50">
                              {interventionReport?.remedial?.rekomendasi_strategi}
                            </p>
                          </div>
                        </div>

                        {/* Kelompok Pengayaan (Score >= 75%) - 4 Cols */}
                        <div className="xl:col-span-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">Kelompok Pengayaan (Skor &gt;= 75%)</h4>
                          </div>

                          <div>
                            <span className="text-[9px] text-emerald-950 font-extrabold uppercase block mb-1">Daftar Siswa Pengayaan</span>
                            <div className="flex flex-wrap gap-1.5">
                              {interventionReport?.pengayaan?.daftar_siswa?.length > 0 ? (
                                interventionReport.pengayaan.daftar_siswa.map((name: string) => (
                                  <span key={name} className="px-2.5 py-1 bg-emerald-100 text-emerald-850 font-bold rounded-lg border border-emerald-200 text-[10px]">
                                    {name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-500 font-bold italic">Belum ada siswa pengayaan.</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-3 border-t border-emerald-500/10">
                            <span className="text-[9px] text-emerald-950 font-extrabold uppercase block mb-1.5">Tugas Studi Kasus HOTS Tingkat Lanjut</span>
                            <p className="text-[11px] text-emerald-950 leading-relaxed font-medium bg-emerald-100/30 p-3 rounded-lg border border-emerald-200/50">
                              {interventionReport?.pengayaan?.tugas_hots_lanjut}
                            </p>
                          </div>
                        </div>

                        {/* Rencana Tindak Lanjut Guru (Peta Miskonsepsi Kelas) - 4 Cols */}
                        <div className="xl:col-span-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
                            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">Peta Miskonsepsi Kelas &amp; RTL</h4>
                          </div>

                          <div className="space-y-4">
                            {interventionReport?.peta_miskonsepsi?.map((item: any, idx: number) => (
                              <div key={idx} className="bg-amber-100/30 p-3 rounded-lg border border-amber-200/50 text-xs space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-[#1A1510] truncate max-w-[70%]">{item.topik}</span>
                                  <span className="text-[9px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md">
                                    Rerata: {item.rata_rata}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#5C5143] leading-relaxed">
                                  <strong className="text-[#2C2620]">Miskonsepsi:</strong> {item.analisis_miskonsepsi}
                                </p>
                                <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
                                  <strong className="text-[#2C2620]">Saran Pengajaran:</strong> {item.saran_guru}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: PENILAIAN PILIHAN GANDA (GOOGLE SHEETS) */}
          {activeTab === "pilihan-ganda" && (
            <motion.div
              key="pilihan-ganda-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Student Roster for PG (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-2xs">
                  <h3 className="font-bold text-[#1A1510] text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Siswa {activeClass.name}</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Mode PG
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#7F7466] leading-relaxed mb-4">
                    Pilih siswa untuk menginput jawaban pilihan ganda, menganalisis via Google Sheets, dan menyimpan rekap ke Google Drive.
                  </p>

                  {/* Student list */}
                  <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                    {activeClass.students.map((student) => {
                      const isSelected = selectedStudent === student;
                      const studentPgResult = currentClassPg.hasil?.[student];
                      const studentAnsCount = Object.keys(currentClassPg.jawabanSiswa[student] || {}).length;
                      const hasSavedDrive = !!currentClassPg.rekapSaved?.[student];

                      return (
                        <div
                          key={student}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? "bg-emerald-50/70 border-emerald-500/40 shadow-xs"
                              : "bg-[#FDFBF7] border-[#EFECE6] hover:bg-[#F5F2EC]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? "text-emerald-950 font-black" : "text-[#2C2620]"}`}>
                              {student}
                            </span>
                            <span className="text-[10px] text-[#7F7466] font-semibold">
                              {studentAnsCount}/{totalPgCount} Diisi
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 mt-0.5">
                            {studentPgResult ? (
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                                  studentPgResult.status_tuntas === "TUNTAS"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-rose-100 text-rose-800 border-rose-300"
                                }`}
                              >
                                Skor {studentPgResult.skor_pg} • {studentPgResult.status_tuntas}
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#A69B8D] italic">
                                Belum Dianalisis
                              </span>
                            )}

                            {hasSavedDrive && (
                              <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                <Database className="w-2.5 h-2.5" />
                                Drive
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Batch Save Rekap Button */}
                  <div className="mt-5 pt-4 border-t border-[#EFECE6]">
                    <button
                      onClick={handleBatchSimpanRekap}
                      disabled={batchSavingRekap || activeClass.students.length === 0}
                      className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {batchSavingRekap ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Menyinkronkan Rekap...
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          Simpan Rekap Seluruh Siswa ke Drive
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#7F7466] text-center mt-1.5">
                      Mengirimkan Skor PG &amp; Skor Esai seluruh siswa kelas ke Google Spreadsheet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Master Kunci, Student Sheet, and Analysis Results (9 cols) */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                
                {/* 1. Master Kunci Jawaban Card */}
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EDE6] pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-700 border border-amber-500/15">
                        <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#1A1510] text-sm uppercase tracking-wide">
                          Master Kunci Jawaban Pilihan Ganda (PG)
                        </h3>
                        <p className="text-[11px] text-[#7F7466]">
                          Tentukan kunci jawaban acuan (A, B, C, D) untuk {totalPgCount} butir soal pilihan ganda.
                        </p>
                      </div>
                    </div>

                    {/* Question Count Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#7F7466] uppercase">Jumlah Soal:</span>
                      {[5, 10, 15, 20, 25, 30].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleChangeTotalPgQuestions(num)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                            totalPgCount === num
                              ? "bg-amber-600 text-white border-amber-600"
                              : "bg-[#FDFBF7] text-[#4A3E31] border-[#EFECE6] hover:bg-[#F5F2EC]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fast Bulk Kunci Input & Reset Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-[#FDFBF7] p-3 rounded-xl border border-[#EFECE6]">
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                      <input
                        type="text"
                        value={bulkKunciText}
                        onChange={(e) => setBulkKunciText(e.target.value)}
                        placeholder="Tempel / ketik kunci cepat, contoh: ABCDABCDAC..."
                        className="bg-white border border-[#EFECE6] rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#2C2620] flex-1 focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkKunci}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Terapkan Kunci
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultKunci: Record<number, string> = {};
                        const pattern = ["A", "B", "C", "D"];
                        for (let i = 1; i <= totalPgCount; i++) {
                          defaultKunci[i] = pattern[(i - 1) % 4];
                        }
                        const updated = {
                          ...currentClassPg,
                          kunciJawaban: defaultKunci
                        };
                        updateAndSavePgData(activeClassId, updated);
                        setSuccessMsg("Kunci jawaban diisi dengan pola default (A, B, C, D)!");
                        setTimeout(() => setSuccessMsg(null), 2500);
                      }}
                      className="px-3 py-1.5 bg-[#F5F2EC] hover:bg-amber-100 text-[#4A3E31] border border-[#E9E5DC] font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      Isi Kunci Acuan Standar
                    </button>
                  </div>

                  {/* Matrix of Question Keys */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                    {Array.from({ length: totalPgCount }, (_, i) => i + 1).map((qNo) => {
                      const selectedKey = currentClassPg.kunciJawaban[qNo] || "A";
                      return (
                        <div key={qNo} className="bg-[#FAF8F5] border border-[#EFECE6] p-2 rounded-xl flex flex-col items-center gap-1.5 shadow-2xs">
                          <span className="text-[10px] font-extrabold text-[#7F7466]">Soal {qNo}</span>
                          <div className="grid grid-cols-2 gap-1 w-full">
                            {["A", "B", "C", "D"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectKunciPg(qNo, opt)}
                                className={`h-6 text-[10px] font-black rounded transition cursor-pointer flex items-center justify-center ${
                                  selectedKey === opt
                                    ? "bg-amber-600 text-white shadow-xs scale-105"
                                    : "bg-white text-[#5C5143] border border-[#EFECE6] hover:bg-amber-50"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Lembar Jawaban Siswa Card */}
                <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EDE6] pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-800 border border-emerald-500/15">
                        <Users className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#1A1510] text-sm uppercase tracking-wide flex items-center gap-2">
                          Lembar Jawaban Siswa: <span className="text-emerald-800">{selectedStudent}</span>
                        </h3>
                        <p className="text-[11px] text-[#7F7466]">
                          Pilih atau ketik jawaban pilihan ganda untuk {selectedStudent} di {activeClass.name}.
                        </p>
                      </div>
                    </div>

                    {/* Quick Presets for fast testing */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#7F7466] uppercase">Uji Cepat:</span>
                      <button
                        type="button"
                        onClick={() => handleInjectPgPreset(selectedStudent, "ahmad")}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        Preset 90 (Tuntas)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInjectPgPreset(selectedStudent, "budi")}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                      >
                        Preset 50 (Remedial)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInjectPgPreset(selectedStudent, "cici")}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                      >
                        Preset 100
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInjectPgPreset(selectedStudent, "empty")}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg border bg-[#F5F2EC] text-[#7F7466] border-[#E9E5DC] hover:bg-gray-200 transition cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Bulk Answer Input Bar */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 bg-[#FDFBF7] p-3 rounded-xl border border-[#EFECE6]">
                    <input
                      type="text"
                      value={bulkJawabanText}
                      onChange={(e) => setBulkJawabanText(e.target.value)}
                      placeholder={`Ketik / tempel jawaban cepat untuk ${selectedStudent}, contoh: ABCDABCDAA...`}
                      className="bg-white border border-[#EFECE6] rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#2C2620] flex-1 focus:ring-1 focus:ring-emerald-500 min-w-[260px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyBulkJawaban(selectedStudent)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      Terapkan Jawaban Siswa
                    </button>
                  </div>

                  {/* Student Answer Bubble Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 mb-6">
                    {Array.from({ length: totalPgCount }, (_, i) => i + 1).map((qNo) => {
                      const studentAns = currentClassPg.jawabanSiswa[selectedStudent]?.[qNo] || "";
                      const keyAns = currentClassPg.kunciJawaban[qNo];
                      const evalDetail = currentClassPg.hasil?.[selectedStudent]?.detail?.find((d) => d.no_soal === qNo);

                      return (
                        <div
                          key={qNo}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                            evalDetail
                              ? evalDetail.status === "BENAR"
                                ? "bg-emerald-50/40 border-emerald-300"
                                : "bg-rose-50/40 border-rose-300"
                              : "bg-[#FAF8F5] border-[#EFECE6]"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full px-1">
                            <span className="text-[10px] font-extrabold text-[#7F7466]">Soal {qNo}</span>
                            {evalDetail && (
                              <span className={`text-[9px] font-black ${evalDetail.status === "BENAR" ? "text-emerald-700" : "text-rose-700"}`}>
                                {evalDetail.status === "BENAR" ? "✓" : "✗"}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 w-full">
                            {["A", "B", "C", "D"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectJawabanPg(selectedStudent, qNo, opt)}
                                className={`h-6 text-[10px] font-black rounded transition cursor-pointer flex items-center justify-center ${
                                  studentAns === opt
                                    ? evalDetail
                                      ? evalDetail.status === "BENAR"
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-rose-600 text-white shadow-xs"
                                      : "bg-emerald-700 text-white shadow-xs scale-105"
                                    : "bg-white text-[#5C5143] border border-[#EFECE6] hover:bg-emerald-50"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons for Analysis & Google Drive Storage */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EFECE6]">
                    <div className="flex items-center gap-2 text-xs text-[#7F7466]">
                      <span className="font-semibold">Info Integrasi:</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-mono text-[10px] border border-blue-200">
                        GAS Web App URL Aktif
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      {/* Button: Analisis PG via Google Sheets */}
                      <button
                        type="button"
                        onClick={() => handleAnalisisPG(selectedStudent)}
                        disabled={pgLoading}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pgLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Menganalisis di Google Sheets...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-4 h-4" />
                            Analisis Jawaban PG (via Google Sheets)
                          </>
                        )}
                      </button>

                      {/* Button: Simpan Rekap ke Google Drive */}
                      <button
                        type="button"
                        onClick={() => handleSimpanRekap(selectedStudent)}
                        disabled={savingRekap}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingRekap ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Menyimpan ke Google Drive...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan Rekap ke Google Drive
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Panel Hasil Analisis PG & Rekap Google Drive */}
                {(() => {
                  const studentPgResult = currentClassPg.hasil?.[selectedStudent];
                  const studentSaved = currentClassPg.rekapSaved?.[selectedStudent];
                  const studentEssayScore = getStudentEssayScore(selectedStudent);

                  if (!studentPgResult && !studentSaved) {
                    return (
                      <div className="text-center py-10 bg-white border border-dashed border-[#EFECE6] rounded-2xl p-6">
                        <FileSpreadsheet className="w-10 h-10 text-emerald-600/30 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-[#1A1510]">Belum Ada Hasil Analisis PG untuk {selectedStudent}</h4>
                        <p className="text-[11px] text-[#7F7466] mt-1 max-w-md mx-auto">
                          Klik tombol <strong>"Analisis Jawaban PG (via Google Sheets)"</strong> di atas untuk memproses koreksi otomatis dan melihat status ketuntasan siswa.
                        </p>
                      </div>
                    );
                  }

                  const isTuntas = (studentPgResult?.skor_pg ?? 0) >= 75;
                  const finalAverage = studentPgResult
                    ? ((studentPgResult.skor_pg + studentEssayScore) / 2).toFixed(1)
                    : studentEssayScore;

                  return (
                    <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-xs flex flex-col gap-6">
                      
                      {/* Big Score & Status Banner */}
                      {studentPgResult && (
                        <div
                          className={`rounded-2xl p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                            isTuntas
                              ? "bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-850"
                              : "bg-gradient-to-br from-rose-800 via-rose-700 to-red-850"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                                Hasil Asesmen Pilihan Ganda
                              </span>
                              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                                {studentPgResult.timestamp}
                              </span>
                            </div>
                            <h4 className="text-xl font-black tracking-tight">
                              {selectedStudent} - {activeClass.name}
                            </h4>
                            <p className="text-xs text-white/80 font-medium">
                              {isTuntas
                                ? "Selamat! Siswa berhasil melampaui kriteria ketuntasan minimal (KKM 75)."
                                : "Perhatian: Siswa belum mencapai nilai KKM 75 dan direkomendasikan mengikuti remedial."}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/15">
                            {/* Score PG */}
                            <div className="text-center px-2">
                              <span className="text-[10px] uppercase font-bold text-white/80 block">Skor PG</span>
                              <span className="text-3xl font-black">{studentPgResult.skor_pg}</span>
                              <span className="text-[10px] text-white/70 block">/ 100</span>
                            </div>

                            <div className="w-px h-10 bg-white/20 hidden sm:block" />

                            {/* Status Tuntas */}
                            <div className="text-center px-2">
                              <span className="text-[10px] uppercase font-bold text-white/80 block">Status</span>
                              <span
                                className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase mt-1 shadow-xs ${
                                  isTuntas ? "bg-white text-emerald-900" : "bg-white text-rose-900"
                                }`}
                              >
                                {studentPgResult.status_tuntas}
                              </span>
                            </div>

                            <div className="w-px h-10 bg-white/20 hidden sm:block" />

                            {/* Correct / Total */}
                            <div className="text-center px-2">
                              <span className="text-[10px] uppercase font-bold text-white/80 block">Jawaban Benar</span>
                              <span className="text-xl font-black">
                                {studentPgResult.jumlah_benar} / {studentPgResult.total_soal}
                              </span>
                              <span className="text-[10px] text-white/70 block">
                                Salah: {studentPgResult.total_soal - studentPgResult.jumlah_benar}
                              </span>
                            </div>

                            <div className="w-px h-10 bg-white/20 hidden sm:block" />

                            {/* Essay & Combined Average */}
                            <div className="text-center px-2">
                              <span className="text-[10px] uppercase font-bold text-white/80 block">Skor Esai HOTS</span>
                              <span className="text-xl font-black">{studentEssayScore}</span>
                              <span className="text-[10px] text-white/70 block">
                                Rerata: {finalAverage}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Google Drive Status Alert Box */}
                      {studentSaved && (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-950">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-200/60 rounded-lg text-emerald-900">
                              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div>
                              <h6 className="text-xs font-bold text-emerald-950">Tersimpan di Google Drive</h6>
                              <p className="text-xs text-emerald-800 mt-0.5">
                                {studentSaved.message}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 font-bold shrink-0">
                            Pukul {studentSaved.timestamp}
                          </span>
                        </div>
                      )}

                      {/* Detail Analisis Butir Soal */}
                      {studentPgResult?.detail && (
                        <div>
                          <h5 className="font-bold text-xs uppercase tracking-wider text-[#1A1510] mb-3 flex items-center justify-between">
                            <span>Rincian Evaluasi Butir Soal PG</span>
                            <span className="text-[10px] text-[#7F7466] font-semibold">
                              Total {studentPgResult.detail.length} Butir Soal
                            </span>
                          </h5>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {studentPgResult.detail.map((item) => {
                              const isBenar = item.status === "BENAR";
                              return (
                                <div
                                  key={item.no_soal}
                                  className={`p-3 rounded-xl border flex flex-col gap-1.5 transition ${
                                    isBenar
                                      ? "bg-emerald-50/30 border-emerald-200"
                                      : "bg-rose-50/30 border-rose-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-[#1A1510]">
                                      No. {item.no_soal}
                                    </span>
                                    <span
                                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                        isBenar ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {isBenar ? "BENAR (+1)" : "SALAH (0)"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-1 text-[11px] mt-1 pt-1 border-t border-black/5">
                                    <div className="bg-white p-1 rounded border border-[#EFECE6] text-center">
                                      <span className="text-[9px] text-[#7F7466] block">Kunci:</span>
                                      <strong className="text-amber-800 font-black">{item.kunci}</strong>
                                    </div>
                                    <div className="bg-white p-1 rounded border border-[#EFECE6] text-center">
                                      <span className="text-[9px] text-[#7F7466] block">Siswa:</span>
                                      <strong className={`font-black ${isBenar ? "text-emerald-800" : "text-rose-800"}`}>
                                        {item.jawaban_siswa || "-"}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* TAB 3: MATERI & UPLOAD PDF */}
          {activeTab === "materi-soal" && (
            <motion.div
              key="materi-soal-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto flex flex-col gap-6"
            >
              {/* PDF Multi Upload Component */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs">
                <h3 className="font-bold text-[#1A1510] text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                  <UploadCloud className="w-5 h-5 text-amber-600" />
                  Ekstraksi PDF Kartu Soal Esai HOTS (Multi-File)
                </h3>
                
                <p className="text-xs text-[#5C5143] leading-relaxed mb-6 font-semibold bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                  Unggah file PDF kartu soal yang memuat pertanyaan, kunci jawaban, dan rubrik pedoman penskoran. 
                  Sistem otomatis menggunakan <strong>Gemini 3.8 Flash</strong> untuk mengekstrak kompetensi penalaran C4, mengurutkan nomor soal, dan menyimpannya secara terisolasi untuk <strong>{activeClass.name}</strong> di LocalStorage.
                </p>

                {/* Upload drag drop zone */}
                <div className="border-2 border-dashed border-[#EFECE6] rounded-2xl p-8 hover:border-amber-500/50 hover:bg-[#FDFBF7] transition duration-200 flex flex-col items-center justify-center text-center relative group">
                  <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={pdfExtracting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-[#1A1510]">Klik atau seret beberapa file PDF di sini</h4>
                  <p className="text-[10px] text-[#7F7466] mt-1">Hanya mendukung format dokumen PDF kartu soal</p>
                </div>

                {/* Processing/Progress state */}
                {extractProgress.length > 0 && (
                  <div className="mt-6 border border-[#EFECE6] rounded-xl p-4 bg-[#FDFBF7] space-y-2">
                    <h5 className="text-[10px] font-bold text-[#7F7466] uppercase tracking-wide">Status Ekstraksi Dokumen:</h5>
                    <div className="space-y-2">
                      {extractProgress.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-white rounded-lg border border-[#F0EDE6] text-xs">
                          <span className="font-bold text-[#4A3E31] truncate max-w-xs">{item.name}</span>
                          <div className="flex items-center gap-2">
                            {item.status === "extracting" && (
                              <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Membaca Dokumen...
                              </div>
                            )}
                            {item.status === "success" && (
                              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Berhasil ({item.count} Soal)
                              </div>
                            )}
                            {item.status === "error" && (
                              <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                Gagal
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Question list */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-[#F0EDE6]">
                  <h3 className="font-bold text-[#1A1510] text-sm uppercase tracking-wide flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                    Paket Soal Terpasang: {activeClass.name}
                  </h3>
                  {activeClass.questions.length > 0 && (
                    <button
                      onClick={handleResetAllQuestions}
                      className="px-3 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-[#FFF5F5] border border-rose-200 rounded-xl flex items-center gap-1 transition cursor-pointer self-start sm:self-auto"
                      title="Kosongkan seluruh daftar soal untuk kelas aktif ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus / Reset Soal Kelas Ini
                    </button>
                  )}
                </div>

                {activeClass.questions.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#7F7466] font-medium bg-[#FDFBF7] border border-dashed border-[#EFECE6] rounded-xl">
                    Paket soal kosong. Unggah PDF kartu soal di atas untuk mengisinya secara otomatis.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeClass.questions.map((q, idx) => (
                      <div key={q.nomor_soal} className="p-4 bg-[#FDFBF7] border border-[#EFECE6] rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-amber-800 mr-2">Soal {q.nomor_soal}</span>
                            
                            {/* Up Button */}
                            <button
                              onClick={() => moveQuestionUp(idx)}
                              disabled={idx === 0}
                              className="p-1 text-[#7F7466] hover:text-[#2C2620] hover:bg-[#F5F2EC] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition cursor-pointer"
                              title="Pindahkan soal ke atas"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Down Button */}
                            <button
                              onClick={() => moveQuestionDown(idx)}
                              disabled={idx === activeClass.questions.length - 1}
                              className="p-1 text-[#7F7466] hover:text-[#2C2620] hover:bg-[#F5F2EC] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition cursor-pointer"
                              title="Pindahkan soal ke bawah"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Divider */}
                            <span className="h-4 w-[1px] bg-[#EFECE6] mx-1"></span>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteQuestion(q.nomor_soal)}
                              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                              title={`Hapus Soal ${q.nomor_soal} secara permanen`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="bg-white text-[#7F7466] border border-[#EFECE6] px-2 py-0.5 rounded font-bold text-[10px]">
                            {q.materi}
                          </span>
                        </div>
                        <p className="text-[#2C2620] font-bold leading-relaxed">{q.soal}</p>
                        <div className="text-[11px] text-[#7F7466] bg-white p-2.5 rounded-lg border border-[#F0EDE6]">
                          <strong className="text-emerald-800 font-extrabold block mb-1 uppercase text-[9px]">Kunci Acuan:</strong>
                          <p className="whitespace-pre-line font-medium leading-relaxed">{q.kunci_jawaban}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: JSON OUT (Requested by user) */}
          {activeTab === "json-output" && (
            <motion.div
              key="json-output-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto flex flex-col gap-6"
            >
              {/* Extraction JSON View */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-[#1A1510] text-sm uppercase tracking-wide flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-amber-600" />
                      JSON Ekstraksi Kartu Soal (Mode 1)
                    </h3>
                    <p className="text-xs text-[#7F7466] mt-1">
                      Data seluruh soal esai hasil ekstraksi untuk kelas <strong>{activeClass.name}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(currentClassJson, null, 2))}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Salin JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#1A1510] text-amber-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-80 shadow-inner custom-scrollbar">
                  {JSON.stringify(currentClassJson, null, 2)}
                </pre>
              </div>

              {/* Evaluation JSON View */}
              <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-[#1A1510] text-sm uppercase tracking-wide flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-amber-600" />
                      JSON Analisis & Penilaian Jawaban (Mode 2)
                    </h3>
                    <p className="text-xs text-[#7F7466] mt-1">
                      Analisis tingkat penalaran C4 siswa <strong>{selectedStudent}</strong> ({activeClass.name}) per kriteria rubrik.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(currentStudentJson, null, 2))}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Salin JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#1A1510] text-amber-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-96 shadow-inner custom-scrollbar">
                  {JSON.stringify(currentStudentJson, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer info */}
      <footer className="mt-16 border-t border-[#EFECE6] py-8 text-center text-xs text-[#7F7466] max-w-7xl mx-auto px-6">
        <p>© 2026 SMP Negeri 2 Puriala / Suherman, S.Pd.Gr. Powered by Google AI Studio & Gemini API.</p>
      </footer>
    </div>
  );
}

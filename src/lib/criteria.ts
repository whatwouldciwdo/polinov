export interface CriterionOption {
  value: number;
  label: string;
}

export interface Criterion {
  id: number;
  title: string;
  focus: string;
  indicator: string;
  weight: number;
  weightPercent: string;
  options: CriterionOption[];
}

export const EVALUATION_CRITERIA: Criterion[] = [
  {
    id: 1,
    title: "Kejelasan Masalah/ Peluang",
    focus: "Problem/ opportunity statement, baseline, konteks unit",
    indicator:
      "Tingkat kejelasan masalah operasional PLN yang ingin diselesaikan, termasuk baseline kondisi awal dan urgensinya",
    weight: 0.1,
    weightPercent: "10%",
    options: [
      {
        value: 0,
        label:
          "0: Tidak terdapat problem/opportunity statement, baseline, dan konteks unit",
      },
      {
        value: 20,
        label:
          "20: Masalah operasional PLN tidak jelas, tanpa baseline kondisi awal dan urgensi",
      },
      {
        value: 40,
        label:
          "40: Problem statement ada namun umum, baseline dan urgensi belum menggambarkan kondisi operasional PLN",
      },
      {
        value: 60,
        label:
          "60: Masalah cukup jelas, baseline tersedia namun belum lengkap, urgensi mulai terlihat pada operasi unit",
      },
      {
        value: 80,
        label:
          "80: Masalah operasional PLN jelas, baseline kondisi awal lengkap, urgensi kuat dan relevan",
      },
      {
        value: 100,
        label:
          "100: Problem/opportunity sangat tajam, didukung baseline data rinci, urgensi kritikal terhadap kinerja operasi PLN",
      },
    ],
  },
  {
    id: 2,
    title: "Kualitas Solusi",
    focus:
      "Desain solusi, prinsip kerja, parameter teknis, pengujian, problem-solution fit",
    indicator:
      "Kelayakan teknis solusi, konsistensi desain dengan prinsip rekayasa, rasional teknis, serta level inovasi (novelty)",
    weight: 0.2,
    weightPercent: "20%",
    options: [
      {
        value: 0,
        label: "0: Tidak terdapat penjelasan desain solusi dan prinsip kerja",
      },
      {
        value: 20,
        label:
          "20: Solusi tidak relevan dengan problem, tidak memenuhi prinsip rekayasa",
      },
      {
        value: 40,
        label:
          "40: Desain solusi ada namun tidak konsisten dengan prinsip kerja dan parameter teknis",
      },
      {
        value: 60,
        label:
          "60: Solusi cukup logis, parameter teknis ada namun pengujian dan problem-solution fit belum kuat",
      },
      {
        value: 80,
        label:
          "80: Solusi layak teknis, desain konsisten dengan prinsip rekayasa, terdapat pengujian",
      },
      {
        value: 100,
        label:
          "100: Solusi sangat kuat, berbasis prinsip rekayasa, tervalidasi, memiliki rasional teknis tinggi dan level inovasi signifikan",
      },
    ],
  },
  {
    id: 3,
    title: "Bukti Implementasi & Kematangan (≥6 bulan)",
    focus: "Bukti pemasangan, operasi, dan stabilitas",
    indicator:
      "Tingkat implementasi nyata dan kematangan inovasi di lapangan",
    weight: 0.2,
    weightPercent: "20%",
    options: [
      {
        value: 0,
        label: "0: Tidak terdapat bukti pemasangan atau implementasi",
      },
      {
        value: 20,
        label: "20: Belum diimplementasikan dalam operasi",
      },
      {
        value: 40,
        label: "40: Implementasi terbatas pada tahap uji coba/pilot",
      },
      {
        value: 60,
        label: "60: Sudah terpasang dan beroperasi namun belum stabil",
      },
      {
        value: 80,
        label: "80: Sudah beroperasi stabil dalam kondisi lapangan",
      },
      {
        value: 100,
        label:
          "100: Implementasi matang (>6 bulan), stabil, dan terintegrasi dalam operasi PLN",
      },
    ],
  },
  {
    id: 4,
    title: "Dampak Nyata & Terukur (Value Realization)",
    focus: "Efisiensi (penghematan)/reliability/revenue/K3L",
    indicator:
      "Kejelasan manfaat inovasi dan metode pengukuran dampaknya",
    weight: 0.2,
    weightPercent: "20%",
    options: [
      {
        value: 0,
        label: "0: Tidak terdapat data manfaat atau metode pengukuran",
      },
      {
        value: 20,
        label:
          "20: Tidak menunjukkan dampak terhadap efisiensi/reliability/revenue/K3L",
      },
      {
        value: 40,
        label:
          "40: Dampak ada namun tidak terukur atau tidak jelas metode perhitungannya",
      },
      {
        value: 60,
        label:
          "60: Dampak terukur namun metode belum kuat atau belum konsisten",
      },
      {
        value: 80,
        label:
          "80: Dampak jelas dan terukur pada aspek efisiensi/reliability/revenue/K3L",
      },
      {
        value: 100,
        label:
          "100: Dampak signifikan dan terukur kuat dengan metodologi valid serta terdokumentasi",
      },
    ],
  },
  {
    id: 5,
    title: "Kesiapan Replikasi / Komersialisasi",
    focus: "Adopsi lintas unit dan potensi nilai ekonomi",
    indicator:
      "Potensi inovasi untuk direplikasi di unit lain dan/atau dikomersialisasikan",
    weight: 0.15,
    weightPercent: "15%",
    options: [
      {
        value: 0,
        label: "0: Tidak terdapat informasi replikasi atau komersialisasi",
      },
      {
        value: 20,
        label:
          "20: Tidak dapat direplikasi atau tidak memiliki nilai ekonomi",
      },
      {
        value: 40,
        label:
          "40: Potensi replikasi sangat terbatas dan tergantung kondisi spesifik",
      },
      {
        value: 60,
        label: "60: Berpotensi direplikasi dengan penyesuaian tertentu",
      },
      {
        value: 80,
        label: "80: Mudah direplikasi di unit lain PLN",
      },
      {
        value: 100,
        label:
          "100: Sangat scalable lintas unit dan memiliki potensi komersialisasi yang jelas",
      },
    ],
  },
  {
    id: 6,
    title: "Kepatuhan K3L, Regulasi, & Risiko",
    focus: "Keselamatan, lingkungan, kepatuhan internal",
    indicator: "Identifikasi risiko, kepatuhan terhadap K3L dan regulasi",
    weight: 0.05,
    weightPercent: "5%",
    options: [
      {
        value: 0,
        label: "0: Tidak terdapat pembahasan K3L, regulasi, dan risiko",
      },
      {
        value: 20,
        label:
          "20: Tidak mempertimbangkan aspek keselamatan, lingkungan, dan kepatuhan",
      },
      {
        value: 40,
        label: "40: Identifikasi risiko sangat terbatas",
      },
      {
        value: 60,
        label:
          "60: Risiko dan kepatuhan K3L diidentifikasi namun belum lengkap",
      },
      {
        value: 80,
        label: "80: Kepatuhan terhadap K3L dan regulasi baik, risiko terkelola",
      },
      {
        value: 100,
        label:
          "100: Fully compliant terhadap K3L dan regulasi, dengan identifikasi dan mitigasi risiko yang komprehensif",
      },
    ],
  },
  {
    id: 7,
    title: "Kualitas Makalah & Bukti Pendukung",
    focus: "Struktur, data, keterlacakan",
    indicator: "Kualitas penulisan dan kelengkapan dokumen",
    weight: 0.1,
    weightPercent: "10%",
    options: [
      {
        value: 0,
        label: "0: Tidak terdapat dokumen atau bukti pendukung",
      },
      {
        value: 20,
        label: "20: Dokumen tidak terstruktur dan tidak dapat ditelusuri",
      },
      {
        value: 40,
        label: "40: Struktur ada namun data tidak lengkap",
      },
      {
        value: 60,
        label:
          "60: Dokumen cukup terstruktur, data tersedia namun keterlacakan terbatas",
      },
      {
        value: 80,
        label: "80: Dokumen baik, data lengkap dan dapat ditelusuri",
      },
      {
        value: 100,
        label:
          "100: Dokumen sangat lengkap, terstruktur, berbasis data, dan fully traceable",
      },
    ],
  },
];

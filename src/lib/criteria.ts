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
    title: "Financial Validation",
    focus: "Validitas perhitungan, asumsi, bukti realisasi, kemampuan menjawab pertanyaan finansial",
    indicator: "Validitas perhitungan, asumsi, bukti realisasi, kemampuan menjawab pertanyaan finansial",
    weight: 0.25,
    weightPercent: "25%",
    options: [
      {
        value: 0,
        label: "0: Tidak dapat dijelaskan",
      },
      {
        value: 20,
        label: "20: Penjelasan lemah",
      },
      {
        value: 40,
        label: "40: Formula ada namun asumsi lemah",
      },
      {
        value: 60,
        label: "60: Formula dan data cukup kuat",
      },
      {
        value: 80,
        label: "80: Formula tervalidasi",
      },
      {
        value: 100,
        label: "100: Tervalidasi penuh dan dapat dipertahankan",
      },
    ],
  },
  {
    id: 2,
    title: "Operational Validation",
    focus: "KPI Before vs After",
    indicator: "KPI Before vs After",
    weight: 0.2,
    weightPercent: "20%",
    options: [
      {
        value: 0,
        label: "0: Tidak ada peningkatan",
      },
      {
        value: 20,
        label: "20: Peningkatan kecil",
      },
      {
        value: 40,
        label: "40: Moderat",
      },
      {
        value: 60,
        label: "60: Signifikan",
      },
      {
        value: 80,
        label: "80: Besar & konsisten",
      },
      {
        value: 100,
        label: "100: Transformasional",
      },
    ],
  },
  {
    id: 3,
    title: "K3L, Regulatory & Risk Validation",
    focus: "Compliance, risk reduction, safety improvement",
    indicator: "Compliance, risk reduction, safety improvement",
    weight: 0.2,
    weightPercent: "20%",
    options: [
      {
        value: 0,
        label: "0: Tidak comply",
      },
      {
        value: 20,
        label: "20: Compliance tidak jelas",
      },
      {
        value: 40,
        label: "40: Minimum comply",
      },
      {
        value: 60,
        label: "60: Compliance terverifikasi",
      },
      {
        value: 80,
        label: "80: Risk reduction terbukti",
      },
      {
        value: 100,
        label: "100: Dampak safety & risk sangat signifikan",
      },
    ],
  },
  {
    id: 4,
    title: "Strategic Contribution",
    focus: "Kontribusi aktual kepada Strategic Themes & Iconic Moves",
    indicator: "Kontribusi aktual kepada Strategic Themes & Iconic Moves",
    weight: 0.15,
    weightPercent: "15%",
    options: [
      {
        value: 0,
        label: "0: Tidak ada",
      },
      {
        value: 20,
        label: "20: Rendah",
      },
      {
        value: 40,
        label: "40: Mendukung satu sasaran",
      },
      {
        value: 60,
        label: "60: Kontribusi jelas",
      },
      {
        value: 80,
        label: "80: Kontribusi besar",
      },
      {
        value: 100,
        label: "100: Accelerator transformasi PLN IP",
      },
    ],
  },
  {
    id: 5,
    title: "Sustainability Verification",
    focus: "Ketahanan hasil & stabilitas operasional",
    indicator: "Ketahanan hasil & stabilitas operasional",
    weight: 0.1,
    weightPercent: "10%",
    options: [
      {
        value: 0,
        label: "0: Tidak berkelanjutan",
      },
      {
        value: 20,
        label: "20: Belum stabil",
      },
      {
        value: 40,
        label: "40: Terbatas",
      },
      {
        value: 60,
        label: "60: Stabil",
      },
      {
        value: 80,
        label: "80: Berkelanjutan",
      },
      {
        value: 100,
        label: "100: Telah menjadi business-as-usual",
      },
    ],
  },
  {
    id: 6,
    title: "Replication Readiness",
    focus: "Kesiapan adopsi di unit lain",
    indicator: "Kesiapan adopsi di unit lain",
    weight: 0.05,
    weightPercent: "5%",
    options: [
      {
        value: 0,
        label: "0: Tidak siap",
      },
      {
        value: 20,
        label: "20: Sulit direplikasi",
      },
      {
        value: 40,
        label: "40: Replikasi terbatas",
      },
      {
        value: 60,
        label: "60: Siap direplikasi",
      },
      {
        value: 80,
        label: "80: Mudah direplikasi",
      },
      {
        value: 100,
        label: "100: Siap menjadi corporate standard",
      },
    ],
  },
  {
    id: 7,
    title: "Quality of Implementation",
    focus: "Kematangan implementasi & user adoption",
    indicator: "Kematangan implementasi & user adoption",
    weight: 0.05,
    weightPercent: "5%",
    options: [
      {
        value: 0,
        label: "0: Belum matang",
      },
      {
        value: 20,
        label: "20: Banyak masalah",
      },
      {
        value: 40,
        label: "40: Dasar",
      },
      {
        value: 60,
        label: "60: Baik",
      },
      {
        value: 80,
        label: "80: Matang",
      },
      {
        value: 100,
        label: "100: Best Practice",
      },
    ],
  },
];

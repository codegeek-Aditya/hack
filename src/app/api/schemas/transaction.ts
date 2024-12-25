interface transaction {
  diagnosisId?: string;
  caseId?: string;
  hospitalId: string;
  patientId?: string;
  patientName?: string;
  amount: number;
  approved: boolean;
}

export type { transaction };

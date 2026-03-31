export type DisplayStatus = 'SUBMITTED' | 'MISSED' | 'LATE' | 'NOT SUBMITTED'|'GRADED';

export function deriveSubmissionStatus(
  submittedAt: Date | null,
  dueAt: Date,
  status:String
): DisplayStatus {
  const now = new Date();

  if (!submittedAt) {
    return now > dueAt ? 'MISSED' : 'NOT SUBMITTED';
  }

  if (submittedAt > dueAt) {
    return 'LATE';
  }

  if (status === 'GRADED') {
    return 'GRADED';
  }

  return 'SUBMITTED';
}
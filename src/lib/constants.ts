export const WIZARD_STEPS = [
  { number: 1, label: 'テーマ選択', path: '/theme', icon: 'Palette' },
  { number: 2, label: '入力', path: '/input', icon: 'FileText' },
  { number: 3, label: '設定', path: '/config', icon: 'Settings' },
  { number: 4, label: '生成', path: '/generate', icon: 'Sparkles' },
  { number: 5, label: '修正', path: '/refine', icon: 'MessageSquare' },
  { number: 6, label: 'エクスポート', path: '/export', icon: 'Download' },
] as const;

export const AUDIENCE_LABELS: Record<string, string> = {
  pharmacy_undergrad: '薬学部学生（学部3-4年生）',
  grad_student: '大学院生（修士・博士課程）',
  researcher: '研究者・専門家',
  general: '一般聴衆',
};

export const DEPTH_LABELS: Record<string, string> = {
  brief: '簡潔',
  standard: '標準',
  detailed: '詳細',
};

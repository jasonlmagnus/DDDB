export const exportToText = (
  request: string,
  discipline: string,
  fearDig: string,
  valueDig: string,
  realityDig: string,
  buildPrompt: string
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `My_Dig_${timestamp}.txt`;

  const content = `STOP → DIG → BUILD Workshop Output
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════

YOUR REQUEST
───────────────────────────────────────────────────────
Discipline: ${discipline}
Request: ${request}

═══════════════════════════════════════════════════════

FEAR DIG
───────────────────────────────────────────────────────
${fearDig || 'Not completed'}

═══════════════════════════════════════════════════════

VALUE DIG
───────────────────────────────────────────────────────
${valueDig || 'Not completed'}

═══════════════════════════════════════════════════════

REALITY DIG
───────────────────────────────────────────────────────
${realityDig || 'Not completed'}

═══════════════════════════════════════════════════════

BUILD PROMPT
───────────────────────────────────────────────────────
${buildPrompt}

═══════════════════════════════════════════════════════
End of Workshop Output
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


import type { ClientSession } from '@/types'
import { maskSessionId, scoreToColor } from '@/lib/utils'

function scoreBar(score: number, color: string): string {
  return `<div class="score-bar-container">
    <div class="score-bar-fill" style="width:${score}%;background:${color}"></div>
  </div>`
}

function radarSVG(scores: {
  emotional: number
  financial: number
  foundational: number
  coreValues: number
  conflictStyle: number
}): string {
  const cx = 200, cy = 200, r = 160
  const axes = [
    { label: 'Emotional\nAlignment', score: scores.emotional },
    { label: 'Financial\nHarmony', score: scores.financial },
    { label: 'Values\nAlignment', score: scores.coreValues },
    { label: 'Conflict\nCompatibility', score: scores.conflictStyle },
    { label: 'Life Vision\nAlignment', score: scores.foundational },
  ]
  const n = axes.length
  const angle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2

  const gridLines = [20, 40, 60, 80, 100].map((pct) => {
    const pr = (r * pct) / 100
    const points = axes.map((_, i) => {
      const a = angle(i)
      return `${cx + pr * Math.cos(a)},${cy + pr * Math.sin(a)}`
    }).join(' ')
    return `<polygon points="${points}" fill="none" stroke="#EDE8E2" stroke-width="1"/>`
  }).join('\n')

  const axisLines = axes.map((_, i) => {
    const a = angle(i)
    return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="#EDE8E2" stroke-width="1"/>`
  }).join('\n')

  const dataPoints = axes.map((ax, i) => {
    const a = angle(i)
    const pr = (r * ax.score) / 100
    return `${cx + pr * Math.cos(a)},${cy + pr * Math.sin(a)}`
  }).join(' ')

  const labels = axes.map((ax, i) => {
    const a = angle(i)
    const lr = r + 30
    const x = cx + lr * Math.cos(a)
    const y = cy + lr * Math.sin(a)
    const lines = ax.label.split('\n')
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#1A1614">
      ${lines.map((l, j) => `<tspan x="${x}" dy="${j === 0 ? 0 : 14}">${l}</tspan>`).join('')}
    </text>`
  }).join('\n')

  return `<svg width="400" height="400" viewBox="0 0 400 400">
    ${gridLines}
    ${axisLines}
    <polygon points="${dataPoints}" fill="#B8955A" fill-opacity="0.3" stroke="#B8955A" stroke-width="2"/>
    ${axes.map((ax, i) => {
      const a = angle(i)
      const pr = (r * ax.score) / 100
      return `<circle cx="${cx + pr * Math.cos(a)}" cy="${cy + pr * Math.sin(a)}" r="4" fill="#B8955A"/>`
    }).join('\n')}
    ${labels}
  </svg>`
}

export function buildReportHTML(session: ClientSession): string {
  const { scores, aiNarrative, partnerAData, partnerBData } = session
  if (!scores || !aiNarrative) return '<html><body>Report data unavailable.</body></html>'

  const genDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const overall = scores.overall
  const overallColor = scoreToColor(overall)

  const riskGrid = ['HIGH_DTI', 'INCOME_IMBALANCE', 'LOW_SAVINGS', 'EMOTIONAL_AVOIDANCE', 'CONFLICT_ESCALATION', 'SPENDING_EXTREMES'].map(id => {
    const flag = scores.riskFlags.find(f => f.id === id)
    if (!flag) {
      return `<div class="risk-cell risk-ok"><div class="risk-id">${id.replace(/_/g,' ')}</div><div class="risk-status">Not Triggered</div></div>`
    }
    const cls = flag.severity === 'high' ? 'risk-high' : 'risk-moderate'
    return `<div class="risk-cell ${cls}"><div class="risk-id">${flag.label}</div><div class="risk-status">${flag.severity.toUpperCase()}</div></div>`
  }).join('')

  const discussionQs = aiNarrative.discussionQuestions.map((q, i) =>
    `<div class="discussion-q"><span class="q-num">${i + 1}.</span><span class="q-text">${q}</span></div>`
  ).join('')

  const financialRows = [
    ['Debt-to-Income', scores.sectionBreakdown.financial.dtiScore],
    ['Income Balance', scores.sectionBreakdown.financial.incomeBalanceScore],
    ['Savings Buffer', scores.sectionBreakdown.financial.savingsBufferScore],
    ['Spending Compatibility', scores.sectionBreakdown.financial.spendingCompatScore],
    ['Risk Tolerance Match', scores.sectionBreakdown.financial.riskCompatScore],
    ['Single-Income Resilience', scores.sectionBreakdown.financial.stressSimScore],
  ].map(([label, score]) => `
    <tr>
      <td>${label}</td>
      <td>${score}/100</td>
      <td>${scoreBar(score as number, scoreToColor(score as number))}</td>
    </tr>`).join('')

  const emotionalRows = [
    ['Core Values', scores.sectionBreakdown.emotional.coreValues],
    ['Conflict Style', scores.sectionBreakdown.emotional.conflictStyle],
    ['Emotional Stability', scores.sectionBreakdown.emotional.emotionalStability],
    ['Lifestyle Vision', scores.sectionBreakdown.emotional.lifestyleVision],
  ].map(([label, score]) => `
    <tr>
      <td>${label}</td>
      <td>${score}/100</td>
      <td>${scoreBar(score as number, scoreToColor(score as number))}</td>
    </tr>`).join('')

  const triggeredFlags = scores.riskFlags.length === 0
    ? '<p class="no-flags">No significant risk indicators were detected in this assessment.</p>'
    : scores.riskFlags.map(f => `
        <div class="flag-card flag-${f.severity}">
          <div class="flag-header"><span class="flag-label">${f.label}</span><span class="flag-badge">${f.severity.toUpperCase()}</span></div>
          <p class="flag-desc">${f.description}</p>
        </div>`).join('')

  const radar = radarSVG({
    emotional: scores.emotional,
    financial: scores.financial,
    foundational: scores.foundational,
    coreValues: scores.sectionBreakdown.emotional.coreValues,
    conflictStyle: scores.sectionBreakdown.emotional.conflictStyle,
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; background: #F7F3EE; color: #1A1614; font-size: 13px; line-height: 1.6; }
  h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; }
  .page { width: 210mm; min-height: 297mm; padding: 20mm; page-break-after: always; position: relative; background: #F7F3EE; }
  .page:last-child { page-break-after: avoid; }

  /* COVER */
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: #1A1614; color: #F7F3EE; }
  .cover .wordmark { font-family: Georgia, serif; font-size: 48px; color: #B8955A; letter-spacing: 4px; margin-bottom: 16px; }
  .cover .tagline { font-size: 14px; color: #8A7F76; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 60px; }
  .cover .title { font-size: 24px; color: #F7F3EE; margin-bottom: 24px; }
  .cover .meta { font-size: 12px; color: #8A7F76; margin-top: 60px; line-height: 2; }
  .cover .session-id { font-family: 'Courier New', monospace; font-size: 11px; color: #B8955A; }
  .cover .confidential { margin-top: 40px; font-size: 10px; color: #8A7F76; border: 1px solid #8A7F76; padding: 8px 16px; }

  /* SECTION HEADER */
  .section-header { border-bottom: 2px solid #B8955A; padding-bottom: 12px; margin-bottom: 24px; }
  .section-header h2 { font-size: 20px; color: #1A1614; }
  .section-header .sub { font-size: 11px; color: #8A7F76; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* SCORE DISPLAY */
  .overall-score { text-align: center; margin: 24px 0; }
  .overall-score .number { font-family: Georgia, serif; font-size: 80px; color: ${overallColor}; line-height: 1; }
  .overall-score .label { font-size: 12px; color: #8A7F76; letter-spacing: 2px; text-transform: uppercase; }
  .three-scores { display: flex; gap: 20px; margin: 20px 0; }
  .score-box { flex: 1; background: #EDE8E2; padding: 16px; text-align: center; }
  .score-box .s-num { font-size: 32px; font-family: Georgia, serif; }
  .score-box .s-label { font-size: 10px; color: #8A7F76; text-transform: uppercase; letter-spacing: 1px; }
  .ai-summary { font-size: 13px; line-height: 1.8; color: #1A1614; background: white; padding: 16px; border-left: 3px solid #B8955A; }

  /* TABLES */
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #EDE8E2; padding: 8px 10px; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 10px; border-bottom: 1px solid #EDE8E2; font-size: 12px; }
  .score-bar-container { background: #EDE8E2; height: 8px; border-radius: 4px; overflow: hidden; width: 100%; }
  .score-bar-fill { height: 100%; border-radius: 4px; }

  /* RISK GRID */
  .risk-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 16px 0; }
  .risk-cell { padding: 12px; border-radius: 4px; }
  .risk-ok { background: #EDE8E2; }
  .risk-moderate { background: #FFF3E0; border-left: 3px solid #E67E22; }
  .risk-high { background: #FFEBEE; border-left: 3px solid #C0392B; }
  .risk-id { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .risk-status { font-size: 10px; color: #8A7F76; margin-top: 4px; }

  /* FLAG CARDS */
  .flag-card { padding: 16px; margin: 12px 0; border-radius: 4px; }
  .flag-moderate { background: #FFF3E0; border-left: 4px solid #E67E22; }
  .flag-high { background: #FFEBEE; border-left: 4px solid #C0392B; }
  .flag-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .flag-label { font-size: 13px; font-weight: 500; }
  .flag-badge { font-size: 10px; padding: 2px 8px; border-radius: 12px; }
  .flag-moderate .flag-badge { background: #E67E22; color: white; }
  .flag-high .flag-badge { background: #C0392B; color: white; }
  .flag-desc { font-size: 12px; line-height: 1.7; }
  .no-flags { background: #E8F5E9; padding: 16px; border-left: 4px solid #27AE60; font-size: 13px; }

  /* DISCUSSION */
  .discussion-q { display: flex; gap: 12px; margin: 12px 0; padding-bottom: 12px; border-bottom: 1px solid #EDE8E2; }
  .q-num { font-family: Georgia, serif; font-size: 18px; color: #B8955A; min-width: 28px; }
  .q-text { font-size: 13px; line-height: 1.7; padding-top: 4px; }

  /* RADAR */
  .radar-container { display: flex; justify-content: center; margin: 20px 0; }

  /* INSIGHTS */
  .insight-text { font-size: 13px; line-height: 1.8; color: #1A1614; margin: 16px 0; }

  /* DISCLAIMER */
  .disclaimer { font-size: 11px; line-height: 1.7; color: #8A7F76; background: #EDE8E2; padding: 20px; }
</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <div class="wordmark">BeforeYes</div>
  <div class="tagline">Pre-Marriage Compatibility Intelligence</div>
  <div class="title">Compatibility Intelligence Report</div>
  <div class="meta">
    Session Reference: <span class="session-id">${maskSessionId(session.sessionId)}</span><br/>
    Generated: ${genDate}
  </div>
  <div class="confidential">CONFIDENTIAL — For the named parties only. Not for distribution.</div>
</div>

<!-- PAGE 2: EXECUTIVE SUMMARY -->
<div class="page">
  <div class="section-header">
    <h2>Executive Summary</h2>
    <div class="sub">Overall Compatibility Assessment</div>
  </div>
  <div class="overall-score">
    <div class="number">${overall}</div>
    <div class="label">Overall Compatibility Score / 100</div>
  </div>
  <div class="three-scores">
    <div class="score-box">
      <div class="s-num" style="color:${scoreToColor(scores.emotional)}">${scores.emotional}</div>
      <div class="s-label">Emotional</div>
    </div>
    <div class="score-box">
      <div class="s-num" style="color:${scoreToColor(scores.financial)}">${scores.financial}</div>
      <div class="s-label">Financial</div>
    </div>
    <div class="score-box">
      <div class="s-num" style="color:${scoreToColor(scores.foundational)}">${scores.foundational}</div>
      <div class="s-label">Foundational</div>
    </div>
  </div>
  <div class="ai-summary">${aiNarrative.summary}</div>
</div>

<!-- PAGE 3: RADAR -->
<div class="page">
  <div class="section-header">
    <h2>Compatibility Radar</h2>
    <div class="sub">Five-Axis Overview</div>
  </div>
  <div class="radar-container">${radar}</div>
  <div class="insight-text">${aiNarrative.emotionalInsights}</div>
</div>

<!-- PAGE 4–5: EMOTIONAL BREAKDOWN -->
<div class="page">
  <div class="section-header">
    <h2>Emotional Compatibility</h2>
    <div class="sub">Values, Conflict, Stability & Vision</div>
  </div>
  <table>
    <thead><tr><th>Dimension</th><th>Score</th><th>Indicator</th></tr></thead>
    <tbody>${emotionalRows}</tbody>
  </table>
  <div class="insight-text">${aiNarrative.emotionalInsights}</div>
  <div class="insight-text">${aiNarrative.foundationalInsights}</div>
</div>

<!-- PAGE 6–7: FINANCIAL SIMULATION -->
<div class="page">
  <div class="section-header">
    <h2>Financial Compatibility</h2>
    <div class="sub">Debt, Savings, Spending & Resilience</div>
  </div>
  <table>
    <thead><tr><th>Metric</th><th>Score</th><th>Indicator</th></tr></thead>
    <tbody>${financialRows}</tbody>
  </table>
  <div class="insight-text">${aiNarrative.financialInsights}</div>
</div>

<!-- PAGE 8: RISK HEATMAP -->
<div class="page">
  <div class="section-header">
    <h2>Risk Indicator Overview</h2>
    <div class="sub">Six Potential Risk Dimensions</div>
  </div>
  <div class="risk-grid">${riskGrid}</div>
  <div class="insight-text">${aiNarrative.redFlagContext}</div>
</div>

<!-- PAGE 9: RED FLAG DETAIL -->
<div class="page">
  <div class="section-header">
    <h2>Risk Indicators — Detail</h2>
    <div class="sub">Triggered Indicators Only</div>
  </div>
  ${triggeredFlags}
</div>

<!-- PAGES 10–12: DISCUSSION BLUEPRINT -->
<div class="page">
  <div class="section-header">
    <h2>15 Questions Worth Having Before You Say Yes</h2>
    <div class="sub">Discussion Blueprint</div>
  </div>
  <p style="font-size:12px;color:#8A7F76;margin-bottom:20px;">These questions are generated from your specific compatibility patterns. Use them as conversation starters — not a checklist.</p>
  ${discussionQs}
</div>

<!-- DISCLAIMER -->
<div class="page">
  <div class="section-header">
    <h2>Important Disclaimer</h2>
  </div>
  <div class="disclaimer">
    <p>${aiNarrative.disclaimer}</p>
    <p style="margin-top:16px;">BeforeYes is not a therapy service, counseling platform, legal advisor, or financial planning tool. This report does not establish any professional relationship. Scores are algorithmic indicators derived from self-reported data and should not be treated as medical, psychological, or financial advice. All individuals considering marriage are encouraged to consult qualified relationship counselors, financial advisors, and legal professionals as appropriate.</p>
    <p style="margin-top:16px;font-size:10px;">Report generated by BeforeYes | ${genDate} | Session ${maskSessionId(session.sessionId)}</p>
  </div>
</div>

</body>
</html>`
}

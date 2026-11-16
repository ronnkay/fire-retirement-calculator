const strategies = {
  traditional: { name: "Traditional FIRE", icon: "🌿", short: "Standard financial independence", multiplier: 1, description: "Build a portfolio that can cover your desired living expenses without relying on employment income. This is the commonly used baseline FIRE approach." },
  lean: { name: "Lean FIRE", icon: "🌱", short: "Minimalist retirement", multiplier: 0.7, description: "Reach financial independence with a smaller portfolio by keeping expenses relatively low and choosing a more minimalist lifestyle. This calculator uses 70% of your base spending as an illustrative default." },
  fat: { name: "Fat FIRE", icon: "🏡", short: "Higher-spending retirement", multiplier: 2, description: "Build a larger portfolio to support higher spending, more travel, and greater lifestyle flexibility. This calculator uses 200% of your base spending as an illustrative default." },
  chubby: { name: "Chubby FIRE", icon: "☀️", short: "Comfort with flexibility", multiplier: 1.5, description: "A comfortable middle ground between traditional and Fat FIRE. This calculator uses 150% of your base spending as an illustrative default." },
  barista: { name: "Barista FIRE", icon: "☕", short: "Investments + part-time work", multiplier: 1, description: "Leave full-time work while using part-time income to cover some expenses. The portfolio target is based on the gap between annual spending and expected part-time income." },
  coast: { name: "Coast FIRE", icon: "🌊", short: "Let compounding do the work", multiplier: 1, description: "Invest enough early that your existing portfolio may grow to your retirement target by your chosen age without further contributions. The Coast FIRE checkpoint estimates the amount needed today." },
  slow: { name: "Slow FIRE", icon: "🐢", short: "A gradual path to freedom", multiplier: 1, description: "Take a more gradual approach to financial independence while maintaining a sustainable lifestyle. This calculator uses a 3.5% default withdrawal rate for this strategy." }
};
const $ = id => document.getElementById(id);
let selectedStrategy = "traditional";
const fields = ["currentAge", "retirementAge", "currentInvestments", "monthlyInvestment", "annualSpending", "baristaIncome", "annualReturn", "withdrawalRate", "inflationRate"];
const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
const number = id => Math.max(0, Number($(id).value) || 0);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function buildStrategyCards() {
  $("strategyGrid").innerHTML = Object.entries(strategies).map(([key, item]) => `
    <button class="strategy-card ${key === selectedStrategy ? "active" : ""}" data-strategy="${key}" type="button" aria-pressed="${key === selectedStrategy}">
      <div class="strategy-icon">${item.icon}</div><span class="strategy-name">${item.name}</span><span class="strategy-sub">${item.short}</span>
    </button>`).join("");
  document.querySelectorAll("[data-strategy]").forEach(button => button.addEventListener("click", () => {
    selectedStrategy = button.dataset.strategy;
    buildStrategyCards();
    updateCalculator();
  }));
}
function getInputs() {
  const currentAge = clamp(number("currentAge"), 0, 100);
  const retirementAge = clamp(number("retirementAge"), currentAge, 110);
  const currentInvestments = number("currentInvestments");
  const monthlyInvestment = number("monthlyInvestment");
  const annualSpending = number("annualSpending") * strategies[selectedStrategy].multiplier;
  const baristaIncome = selectedStrategy === "barista" ? number("baristaIncome") : 0;
  const spendingGap = Math.max(0, annualSpending - baristaIncome);
  const returnRate = number("annualReturn") / 100;
  const withdrawalRate = selectedStrategy === "slow" ? 0.035 : number("withdrawalRate") / 100;
  const inflationRate = number("inflationRate") / 100;
  return { currentAge, retirementAge, currentInvestments, monthlyInvestment, annualSpending, spendingGap, returnRate, withdrawalRate, inflationRate };
}
function portfolioAtYear(years, start, monthly, annualReturn) {
  if (years <= 0) return start;
  const months = Math.round(years * 12);
  const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  if (monthlyRate === 0) return start + monthly * months;
  return start * Math.pow(1 + monthlyRate, months) + monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}
function yearsToGoal(start, monthly, annualReturn, goal) {
  if (start >= goal) return 0;
  for (let year = 0; year <= 100; year += 1) {
    if (portfolioAtYear(year, start, monthly, annualReturn) >= goal) return year;
  }
  return null;
}
function updateCalculator() {
  const s = strategies[selectedStrategy];
  const v = getInputs();
  const goal = v.withdrawalRate > 0 ? v.spendingGap / v.withdrawalRate : Infinity;
  const years = v.retirementAge - v.currentAge;
  const projected = portfolioAtYear(years, v.currentInvestments, v.monthlyInvestment, v.returnRate);
  const fireYears = yearsToGoal(v.currentInvestments, v.monthlyInvestment, v.returnRate, goal);
  const fireAge = fireYears === null ? null : v.currentAge + fireYears;
  const coastTarget = goal / Math.pow(1 + v.returnRate, years);
  const currentProgress = goal > 0 ? clamp(v.currentInvestments / goal * 100, 0, 100) : 100;
  const futureProgress = goal > 0 ? clamp(projected / goal * 100, 0, 100) : 100;

  $("strategyDescription").textContent = s.description;
  $("baristaIncomeField").classList.toggle("hidden", selectedStrategy !== "barista");
  $("coastPanel").classList.toggle("hidden", selectedStrategy !== "coast");
  $("returnLabel").textContent = `${(v.returnRate * 100).toFixed(1)}%`;
  $("withdrawalLabel").textContent = `${(v.withdrawalRate * 100).toFixed(2).replace(/0$/, "")}%`;
  $("inflationLabel").textContent = `${(v.inflationRate * 100).toFixed(2).replace(/0$/, "")}%`;
  $("withdrawalRate").disabled = selectedStrategy === "slow";

  $("fireNumber").textContent = Number.isFinite(goal) ? money(goal) : "—";
  $("fireNumberCaption").textContent = selectedStrategy === "barista"
    ? `Portfolio needed after accounting for ${money(number("baristaIncome"))} in annual part-time income.`
    : "Estimated portfolio needed to support your retirement spending.";
  $("currentValue").textContent = money(v.currentInvestments);
  $("projectedValue").textContent = money(projected);
  $("yearsValue").textContent = years.toString();
  $("fireAgeValue").textContent = fireAge === null ? "100+" : fireAge.toString();
  $("currentProgressLabel").textContent = `${currentProgress.toFixed(1)}%`;
  $("currentProgressBar").style.width = `${currentProgress}%`;
  $("remainingText").textContent = `${money(Math.max(0, goal - v.currentInvestments))} remaining to your target`;
  $("futureProgressLabel").textContent = `${futureProgress.toFixed(1)}%`;
  $("futureProgressBar").style.width = `${futureProgress}%`;
  $("futureStatus").textContent = projected >= goal ? "Your projection reaches your FIRE number by your target retirement age." : "Your projection is below your FIRE number at your target retirement age.";

  $("coastNumber").textContent = money(coastTarget);
  $("coastStatus").textContent = v.currentInvestments >= coastTarget
    ? "You appear to have reached your Coast FIRE checkpoint under these assumptions. Your current portfolio is projected to reach the target without additional contributions."
    : `You are approximately ${money(coastTarget - v.currentInvestments)} below your estimated Coast FIRE checkpoint.`;

  drawChart(v, goal, years);
}
function drawChart(v, goal, years) {
  const canvas = $("growthChart");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(300, rect.width * dpr);
  canvas.height = 240 * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const width = canvas.width / dpr, height = 240;
  const pad = { left: 55, right: 12, top: 16, bottom: 32 };
  const chartW = width - pad.left - pad.right, chartH = height - pad.top - pad.bottom;
  const points = [];
  const steps = Math.max(1, Math.min(35, years));
  for (let i = 0; i <= steps; i++) {
    const year = years * i / steps;
    points.push({ age: v.currentAge + year, value: portfolioAtYear(year, v.currentInvestments, v.monthlyInvestment, v.returnRate) });
  }
  const maxValue = Math.max(goal, ...points.map(p => p.value), 1) * 1.12;
  const x = i => pad.left + (i / steps) * chartW;
  const y = value => pad.top + chartH - (value / maxValue) * chartH;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "10px DM Sans, sans-serif";
  ctx.fillStyle = "#849188";
  ctx.strokeStyle = "#edf1ee";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const val = maxValue * i / 4, yy = y(val);
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(val >= 1e6 ? `$${(val / 1e6).toFixed(1)}m` : `$${Math.round(val / 1000)}k`, pad.left - 8, yy + 3);
  }
  ctx.strokeStyle = "#d6a84f"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.left, y(goal)); ctx.lineTo(width - pad.right, y(goal)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#16734f"; ctx.lineWidth = 2.7; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value)));
  ctx.stroke();
  const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  gradient.addColorStop(0, "rgba(22,115,79,.18)"); gradient.addColorStop(1, "rgba(22,115,79,0)");
  ctx.lineTo(x(steps), height - pad.bottom); ctx.lineTo(x(0), height - pad.bottom); ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
  ctx.fillStyle = "#849188"; ctx.textAlign = "center";
  const labels = [0, Math.round(steps / 2), steps];
  [...new Set(labels)].forEach(i => ctx.fillText(`Age ${Math.round(points[i].age)}`, x(i), height - 9));
}
function buildGuide() {
  $("guideGrid").innerHTML = Object.values(strategies).map(s => `
    <article class="guide-card"><div class="strategy-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.description}</p></article>`).join("");
}
function reset() {
  const defaults = { currentAge: 25, retirementAge: 60, currentInvestments: 50000, monthlyInvestment: 1500, annualSpending: 50000, baristaIncome: 20000, annualReturn: 7, withdrawalRate: 4, inflationRate: 2.5 };
  Object.entries(defaults).forEach(([id, value]) => $(id).value = value);
  selectedStrategy = "traditional";
  buildStrategyCards();
  updateCalculator();
}
fields.forEach(id => $(id).addEventListener("input", updateCalculator));
$("resetButton").addEventListener("click", reset);
window.addEventListener("resize", () => drawChart(getInputs(), getInputs().spendingGap / getInputs().withdrawalRate, getInputs().retirementAge - getInputs().currentAge));
buildStrategyCards();
buildGuide();
updateCalculator();

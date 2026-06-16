// app.js
import { calculateTax } from './calculator.js';

// --- State Variables ---
let currentTab = 'same'; // 'same' or 'diff'
let currentViewMode = 'compare'; // 'compare', '82', or '83'
let currentNavTab = 'calc'; // 'calc' or 'features'
let deferredPrompt = null;

// --- DOM Elements ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const installBtn = document.getElementById('install-btn');
const pwaBanner = document.getElementById('pwa-banner');
const bannerInstallBtn = document.getElementById('banner-install-btn');

// Top Navigation Elements
const navCalcBtn = document.getElementById('nav-calc');
const navFeaturesBtn = document.getElementById('nav-features');
const navAiBtn = document.getElementById('nav-ai');
const calculatorView = document.getElementById('calculator-view');
const featuresView = document.getElementById('features-view');
const aiUseView = document.getElementById('ai-use-view');

// View Mode Elements
const viewCompareBtn = document.getElementById('view-compare');
const view82Btn = document.getElementById('view-82');
const view83Btn = document.getElementById('view-83');

const tabSameBtn = document.getElementById('tab-same');
const tabDiffBtn = document.getElementById('tab-diff');
const mainContentLayout = document.getElementById('main-content-layout');

// Copy Buttons, Reset Button and Tabs Container
const btnCopyToB = document.getElementById('btn-copy-to-b');
const btnCopyToA = document.getElementById('btn-copy-to-a');
const btnReset = document.getElementById('btn-reset');
const ycotekSwitch = document.getElementById('ycotek-mode');
const structureTabsContainer = document.getElementById('structure-tabs-container');

// Comparison selector (New vs New / Existing vs New)
const diffModeContainer = document.getElementById('diff-mode-container');
const diffModeSelect = document.getElementById('diff-mode-select');

// Profile A elements
const basicInputA = document.getElementById('basic-a');
const allowanceInputA = document.getElementById('allowance-a');
const bonusInputA = document.getElementById('bonus-a');
const splitBonusSwitchA = document.getElementById('split-bonus-a');
const statusSwitchA = document.getElementById('status-a'); // switch checkbox
const remoteSelectA = document.getElementById('remote-a');
const ssfSwitchA = document.getElementById('ssf-a');
const epfSwitchA = document.getElementById('epf-a');
const citInputA = document.getElementById('cit-a'); // numeric input
const lifeInputA = document.getElementById('life-a');
const healthInputA = document.getElementById('health-a');
const medicalInputA = document.getElementById('medical-a');
const femaleSwitchA = document.getElementById('female-a');

// Profile B elements (used in 'different' structures mode)
const cardProfileB = document.getElementById('card-profile-b');
const basicInputB = document.getElementById('basic-b');
const allowanceInputB = document.getElementById('allowance-b');
const bonusInputB = document.getElementById('bonus-b');
const splitBonusSwitchB = document.getElementById('split-bonus-b');
const statusSwitchB = document.getElementById('status-b'); // switch checkbox
const remoteSelectB = document.getElementById('remote-b');
const ssfSwitchB = document.getElementById('ssf-b');
const epfSwitchB = document.getElementById('epf-b');
const citInputB = document.getElementById('cit-b'); // numeric input
const lifeInputB = document.getElementById('life-b');
const healthInputB = document.getElementById('health-b');
const medicalInputB = document.getElementById('medical-b');
const femaleSwitchB = document.getElementById('female-b');

// Result elements (General layout containers)
const savingCalloutEl = document.getElementById('saving-callout');
const savingCalloutTextEl = document.getElementById('saving-callout-text');
const savingCalloutValueEl = document.getElementById('saving-callout-value');

const comparisonTableBody = document.getElementById('comparison-table-body');
const slabBreakdown82El = document.getElementById('slab-breakdown-82');
const slabBreakdown83El = document.getElementById('slab-breakdown-83');

const tableHeaderA = document.getElementById('table-hdr-a');
const tableHeaderB = document.getElementById('table-hdr-b');

// --- PWA Registration & Lifecycle ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully!', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
  pwaBanner.classList.remove('hidden');
});

const handlePwaInstallation = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`PWA installation choice: ${outcome}`);
  deferredPrompt = null;
  installBtn.classList.add('hidden');
  pwaBanner.classList.add('hidden');
};

installBtn.addEventListener('click', handlePwaInstallation);
bannerInstallBtn.addEventListener('click', handlePwaInstallation);

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

themeToggleBtn.addEventListener('click', toggleTheme);

// --- Retirement Mutual Exclusivity Rules ---
ssfSwitchA.addEventListener('change', (e) => {
  if (e.target.selected && epfSwitchA.selected) {
    epfSwitchA.selected = false;
  }
  triggerRecalculation();
});
epfSwitchA.addEventListener('change', (e) => {
  if (e.target.selected && ssfSwitchA.selected) {
    ssfSwitchA.selected = false;
  }
  triggerRecalculation();
});
ssfSwitchB.addEventListener('change', (e) => {
  if (e.target.selected && epfSwitchB.selected) {
    epfSwitchB.selected = false;
  }
  triggerRecalculation();
});
epfSwitchB.addEventListener('change', (e) => {
  if (e.target.selected && ssfSwitchB.selected) {
    ssfSwitchB.selected = false;
  }
  triggerRecalculation();
});

// --- Tab Controls ---
tabSameBtn.addEventListener('click', () => {
  if (currentTab === 'same') return;
  currentTab = 'same';
  triggerRecalculation();
});

tabDiffBtn.addEventListener('click', () => {
  if (currentTab === 'diff') return;
  currentTab = 'diff';
  triggerRecalculation();
});

// --- Copy Profile Details Handlers ---
btnCopyToB.addEventListener('click', () => {
  basicInputB.value = basicInputA.value;
  allowanceInputB.value = allowanceInputA.value;
  bonusInputB.value = bonusInputA.value;
  splitBonusSwitchB.selected = splitBonusSwitchA.selected;
  statusSwitchB.selected = statusSwitchA.selected;
  remoteSelectB.value = remoteSelectA.value;
  ssfSwitchB.selected = ssfSwitchA.selected;
  epfSwitchB.selected = epfSwitchA.selected;
  citInputB.value = citInputA.value;
  lifeInputB.value = lifeInputA.value;
  healthInputB.value = healthInputA.value;
  medicalInputB.value = medicalInputA.value;
  femaleSwitchB.selected = femaleSwitchA.selected;
  triggerRecalculation();
});

btnCopyToA.addEventListener('click', () => {
  basicInputA.value = basicInputB.value;
  allowanceInputA.value = allowanceInputB.value;
  bonusInputA.value = bonusInputB.value;
  splitBonusSwitchA.selected = splitBonusSwitchB.selected;
  statusSwitchA.selected = statusSwitchB.selected;
  remoteSelectA.value = remoteSelectB.value;
  ssfSwitchA.selected = ssfSwitchB.selected;
  epfSwitchA.selected = epfSwitchB.selected;
  citInputA.value = citInputB.value;
  lifeInputA.value = lifeInputB.value;
  healthInputA.value = healthInputB.value;
  medicalInputA.value = medicalInputB.value;
  femaleSwitchA.selected = femaleSwitchB.selected;
  triggerRecalculation();
});

// --- Reset Calculator Handler ---
btnReset.addEventListener('click', () => {
  // Reset all Profile A values
  basicInputA.value = 75000;
  allowanceInputA.value = 15000;
  bonusInputA.value = 100000;
  splitBonusSwitchA.selected = false;
  statusSwitchA.selected = false;
  remoteSelectA.value = 'None';
  ssfSwitchA.selected = true;
  epfSwitchA.selected = false;
  citInputA.value = 0;
  lifeInputA.value = 25000;
  healthInputA.value = 0;
  medicalInputA.value = 0;
  femaleSwitchA.selected = false;

  // Reset all Profile B values
  basicInputB.value = 90000;
  allowanceInputB.value = 20000;
  bonusInputB.value = 120000;
  splitBonusSwitchB.selected = false;
  statusSwitchB.selected = false;
  remoteSelectB.value = 'None';
  ssfSwitchB.selected = true;
  epfSwitchB.selected = false;
  citInputB.value = 0;
  lifeInputB.value = 25000;
  healthInputB.value = 0;
  medicalInputB.value = 0;
  femaleSwitchB.selected = false;

  // Reset states
  currentTab = 'same';
  currentViewMode = 'compare';
  diffModeSelect.value = '82_vs_83';
  currentNavTab = 'calc';
  if (ycotekSwitch) {
    ycotekSwitch.selected = false;
    applyYcotekMode(false);
  }

  // Sync navigation view
  switchNavTab('calc');
  switchViewMode('compare');
});

// Watch comparison basis select dropdown
diffModeSelect.addEventListener('change', triggerRecalculation);

// Watch YCOTEK Mode switch
if (ycotekSwitch) {
  ycotekSwitch.addEventListener('change', (e) => {
    applyYcotekMode(e.target.selected);
    triggerRecalculation();
  });
}

// --- State Persistence ---
function saveInputsToLocalStorage() {
  const state = {
    currentTab,
    currentViewMode,
    currentNavTab,
    diffMode: diffModeSelect.value,
    basicA: basicInputA.value,
    allowanceA: allowanceInputA.value,
    bonusA: bonusInputA.value,
    splitBonusA: splitBonusSwitchA.selected,
    statusA: statusSwitchA.selected,
    remoteA: remoteSelectA.value,
    ssfA: ssfSwitchA.selected,
    epfA: epfSwitchA.selected,
    citA: citInputA.value,
    lifeA: lifeInputA.value,
    healthA: healthInputA.value,
    medicalA: medicalInputA.value,
    femaleA: femaleSwitchA.selected,

    basicB: basicInputB.value,
    allowanceB: allowanceInputB.value,
    bonusB: bonusInputB.value,
    splitBonusB: splitBonusSwitchB.selected,
    statusB: statusSwitchB.selected,
    remoteB: remoteSelectB.value,
    ssfB: ssfSwitchB.selected,
    epfB: epfSwitchB.selected,
    citB: citInputB.value,
    lifeB: lifeInputB.value,
    healthB: healthInputB.value,
    medicalB: medicalInputB.value,
    femaleB: femaleSwitchB.selected,
    ycotekMode: ycotekSwitch ? ycotekSwitch.selected : false
  };
  localStorage.setItem('nepal_tax_calc_state', JSON.stringify(state));
}

function loadInputsFromLocalStorage() {
  const serialized = localStorage.getItem('nepal_tax_calc_state');
  if (!serialized) return;
  try {
    const state = JSON.parse(serialized);
    
    // Load tab
    if (state.currentTab) {
      currentTab = state.currentTab;
    }

    // Load Navigation Tab
    if (state.currentNavTab) {
      switchNavTab(state.currentNavTab);
    }

    // Load View Mode
    if (state.currentViewMode) {
      switchViewMode(state.currentViewMode);
    }

    if (state.diffMode !== undefined) {
      diffModeSelect.value = state.diffMode;
    }

    // Load Profile A
    if (state.basicA !== undefined) basicInputA.value = state.basicA;
    if (state.allowanceA !== undefined) allowanceInputA.value = state.allowanceA;
    if (state.bonusA !== undefined) bonusInputA.value = state.bonusA;
    if (state.splitBonusA !== undefined) splitBonusSwitchA.selected = state.splitBonusA;
    if (state.statusA !== undefined) statusSwitchA.selected = state.statusA;
    if (state.remoteA !== undefined) remoteSelectA.value = state.remoteA;
    if (state.ssfA !== undefined) ssfSwitchA.selected = state.ssfA;
    if (state.epfA !== undefined) epfSwitchA.selected = state.epfA;
    if (state.citA !== undefined) citInputA.value = state.citA;
    if (state.lifeA !== undefined) lifeInputA.value = state.lifeA;
    if (state.healthA !== undefined) healthInputA.value = state.healthA;
    if (state.medicalA !== undefined) medicalInputA.value = state.medicalA;
    if (state.femaleA !== undefined) femaleSwitchA.selected = state.femaleA;

    // Load Profile B
    if (state.basicB !== undefined) basicInputB.value = state.basicB;
    if (state.allowanceB !== undefined) allowanceInputB.value = state.allowanceB;
    if (state.bonusB !== undefined) bonusInputB.value = state.bonusB;
    if (state.splitBonusB !== undefined) splitBonusSwitchB.selected = state.splitBonusB;
    if (state.statusB !== undefined) statusSwitchB.selected = state.statusB;
    if (state.remoteB !== undefined) remoteSelectB.value = state.remoteB;
    if (state.ssfB !== undefined) ssfSwitchB.selected = state.ssfB;
    if (state.epfB !== undefined) epfSwitchB.selected = state.epfB;
    if (state.citB !== undefined) citInputB.value = state.citB;
    if (state.lifeB !== undefined) lifeInputB.value = state.lifeB;
    if (state.healthB !== undefined) healthInputB.value = state.healthB;
    if (state.medicalB !== undefined) medicalInputB.value = state.medicalB;
    if (state.femaleB !== undefined) femaleSwitchB.selected = state.femaleB;

    if (state.ycotekMode !== undefined && ycotekSwitch) {
      ycotekSwitch.selected = state.ycotekMode;
      applyYcotekMode(state.ycotekMode);
    }

  } catch (e) {
    console.error("Failed to parse persisted state", e);
  }
}

// --- Navigation Controls ---
navCalcBtn.addEventListener('click', () => {
  switchNavTab('calc');
});

navFeaturesBtn.addEventListener('click', () => {
  switchNavTab('features');
});

navAiBtn.addEventListener('click', () => {
  switchNavTab('ai');
});

function switchNavTab(tab) {
  currentNavTab = tab;
  navCalcBtn.classList.toggle('active', tab === 'calc');
  navFeaturesBtn.classList.toggle('active', tab === 'features');
  navAiBtn.classList.toggle('active', tab === 'ai');
  
  if (tab === 'calc') {
    calculatorView.classList.remove('hidden');
    featuresView.classList.add('hidden');
    aiUseView.classList.add('hidden');
  } else if (tab === 'features') {
    featuresView.classList.remove('hidden');
    calculatorView.classList.add('hidden');
    aiUseView.classList.add('hidden');
  } else if (tab === 'ai') {
    aiUseView.classList.remove('hidden');
    calculatorView.classList.add('hidden');
    featuresView.classList.add('hidden');
  }
  saveInputsToLocalStorage();
}

// --- View Mode Controls ---
viewCompareBtn.addEventListener('click', () => {
  switchViewMode('compare');
});

view82Btn.addEventListener('click', () => {
  switchViewMode('82');
});

view83Btn.addEventListener('click', () => {
  switchViewMode('83');
});

function switchViewMode(mode) {
  currentViewMode = mode;
  
  // Update active status on buttons
  viewCompareBtn.classList.toggle('active', mode === 'compare');
  view82Btn.classList.toggle('active', mode === '82');
  view83Btn.classList.toggle('active', mode === '83');

  // Toggle layout classes on container for CSS styling
  mainContentLayout.classList.toggle('view-mode-82', mode === '82');
  mainContentLayout.classList.toggle('view-mode-83', mode === '83');

  triggerRecalculation();
}

// --- Bind all inputs to trigger Recalculation ---
const inputsToWatch = [
  basicInputA, allowanceInputA, bonusInputA, remoteSelectA, citInputA, lifeInputA, healthInputA, medicalInputA,
  basicInputB, allowanceInputB, bonusInputB, remoteSelectB, citInputB, lifeInputB, healthInputB, medicalInputB
];
inputsToWatch.forEach(input => {
  input.addEventListener('input', triggerRecalculation);
  input.addEventListener('change', triggerRecalculation);
});

// Watch custom switches
[
  statusSwitchA, ssfSwitchA, epfSwitchA, femaleSwitchA, splitBonusSwitchA,
  statusSwitchB, ssfSwitchB, epfSwitchB, femaleSwitchB, splitBonusSwitchB
].forEach(sw => {
  sw.addEventListener('change', triggerRecalculation);
});

// --- YCOTEK Mode Helper ---
function applyYcotekMode(isYcotek) {
  const labelAllowanceA = document.querySelector('label[for="allowance-a"]');
  const labelAllowanceB = document.querySelector('label[for="allowance-b"]');
  const labelCitA = document.querySelector('label[for="cit-a"]');
  const labelCitB = document.querySelector('label[for="cit-b"]');

  if (isYcotek) {
    document.body.classList.add('ycotek-active');
    if (labelAllowanceA) labelAllowanceA.textContent = "Allowance + Add allowance (Lunch, Transport, Mobile, ...)";
    if (labelAllowanceB) labelAllowanceB.textContent = "Allowance + Add allowance (Lunch, Transport, Mobile, ...)";
    if (labelCitA) labelCitA.textContent = "CIT (Staff's Contribution)";
    if (labelCitB) labelCitB.textContent = "CIT (Staff's Contribution)";

    splitBonusSwitchA.selected = false;
    splitBonusSwitchB.selected = false;

    remoteSelectA.value = 'None';
    remoteSelectB.value = 'None';
    remoteSelectA.disabled = true;
    remoteSelectB.disabled = true;

    healthInputA.value = 0;
    healthInputB.value = 0;
    healthInputA.disabled = true;
    healthInputB.disabled = true;

    medicalInputA.value = 0;
    medicalInputB.value = 0;
    medicalInputA.disabled = true;
    medicalInputB.disabled = true;

    ssfSwitchA.selected = false;
    ssfSwitchB.selected = false;
    ssfSwitchA.disabled = true;
    ssfSwitchB.disabled = true;

    epfSwitchA.selected = true;
    epfSwitchB.selected = true;
    epfSwitchA.disabled = true;
    epfSwitchB.disabled = true;
  } else {
    document.body.classList.remove('ycotek-active');
    if (labelAllowanceA) labelAllowanceA.textContent = "Monthly Allowances (NPR)";
    if (labelAllowanceB) labelAllowanceB.textContent = "Monthly Allowances (NPR)";
    if (labelCitA) labelCitA.textContent = "Monthly Citizen Investment Trust (CIT) Contribution (NPR)";
    if (labelCitB) labelCitB.textContent = "Monthly Citizen Investment Trust (CIT) Contribution (NPR)";

    remoteSelectA.disabled = false;
    remoteSelectB.disabled = false;
    healthInputA.disabled = false;
    healthInputB.disabled = false;
    medicalInputA.disabled = false;
    medicalInputB.disabled = false;

    ssfSwitchA.disabled = false;
    ssfSwitchB.disabled = false;
    epfSwitchA.disabled = false;
    epfSwitchB.disabled = false;
  }
}

// --- Core Controller Calculation ---
function triggerRecalculation() {
  // Update structure tab buttons active state
  tabSameBtn.classList.toggle('active', currentTab === 'same');
  tabDiffBtn.classList.toggle('active', currentTab === 'diff');

  // Handle layout visibility based on View Mode and Salary Structure Tab
  if (currentViewMode === 'compare') {
    structureTabsContainer.classList.remove('hidden');
    
    if (currentTab === 'same') {
      cardProfileB.classList.add('hidden');
      diffModeContainer.classList.add('hidden');
      mainContentLayout.classList.remove('dual-input-layout');
      document.getElementById('input-container').classList.remove('dual-inputs');
      
      btnCopyToB.classList.add('hidden');
      btnCopyToA.classList.add('hidden');
    } else {
      cardProfileB.classList.remove('hidden');
      diffModeContainer.classList.remove('hidden');
      mainContentLayout.classList.add('dual-input-layout');
      document.getElementById('input-container').classList.add('dual-inputs');
      
      btnCopyToB.classList.remove('hidden');
      btnCopyToA.classList.remove('hidden');
    }
  } else {
    structureTabsContainer.classList.add('hidden');
    cardProfileB.classList.add('hidden');
    diffModeContainer.classList.add('hidden');
    mainContentLayout.classList.remove('dual-input-layout');
    document.getElementById('input-container').classList.remove('dual-inputs');
    
    btnCopyToB.classList.add('hidden');
    btnCopyToA.classList.add('hidden');
  }

  // Determine comparison settings for Profile A
  const yearA = (currentTab === 'diff' && diffModeSelect.value === '83_vs_83' && currentViewMode === 'compare') ? '2083_84' : '2082_83';

  // Update input profile A card title dynamically
  const profileATitleEl = document.getElementById('profile-a-title');
  if (profileATitleEl) {
    if (currentViewMode !== 'compare') {
      profileATitleEl.textContent = "Salary Profile Details";
    } else if (currentTab === 'same') {
      profileATitleEl.textContent = "Salary Profile Details";
    } else {
      profileATitleEl.textContent = `Salary Profile A (${yearA === '2083_84' ? 'FY 83/84' : 'FY 82/83'})`;
    }
  }

  // Update result card headers dynamically
  const cardTitle82 = document.querySelector('.result-card.existing .card-title span:last-child');
  const cardTitle83 = document.querySelector('.result-card.new .card-title span:last-child');
  
  if (currentViewMode !== 'compare' || currentTab === 'same') {
    if (cardTitle82) cardTitle82.textContent = "FY 2082/83 (Existing)";
    if (cardTitle83) cardTitle83.textContent = "FY 2083/84 (New Slabs)";
    tableHeaderA.textContent = "FY 2082/83";
    tableHeaderB.textContent = "FY 2083/84";
  } else {
    if (yearA === '2083_84') {
      if (cardTitle82) cardTitle82.textContent = "Profile A (FY 2083/84)";
      if (cardTitle83) cardTitle83.textContent = "Profile B (FY 2083/84)";
      tableHeaderA.textContent = "Profile A (FY 2083/84)";
      tableHeaderB.textContent = "Profile B (FY 2083/84)";
    } else {
      if (cardTitle82) cardTitle82.textContent = "Profile A (FY 2082/83)";
      if (cardTitle83) cardTitle83.textContent = "Profile B (FY 2083/84)";
      tableHeaderA.textContent = "Profile A (FY 2082/83)";
      tableHeaderB.textContent = "Profile B (FY 2083/84)";
    }
  }

  const isYcotek = ycotekSwitch ? ycotekSwitch.selected : false;
  const basicSalaryValA = parseFloat(basicInputA.value) || 0;
  let citValA = parseFloat(citInputA.value) || 0;
  if (isYcotek) {
    citValA = Math.max(0, citValA - (basicSalaryValA * 0.10));
  }

  // Read Profile A inputs
  const inputsA = {
    monthlyBasicSalary: basicSalaryValA,
    monthlyAllowances: parseFloat(allowanceInputA.value) || 0,
    annualBonus: parseFloat(bonusInputA.value) || 0,
    filingStatus: statusSwitchA.selected ? 'married' : 'single',
    remoteArea: remoteSelectA.value,
    useSSF: ssfSwitchA.selected,
    useEPF: epfSwitchA.selected,
    citMonthly: citValA,
    lifeInsurancePremium: parseFloat(lifeInputA.value) || 0,
    healthInsurancePremium: parseFloat(healthInputA.value) || 0,
    medicalExpenses: parseFloat(medicalInputA.value) || 0,
    femaleTaxpayer: femaleSwitchA.selected,
    splitBonus: splitBonusSwitchA.selected
  };

  // Read Profile B inputs (depends on mode)
  let inputsB;
  if (currentViewMode !== 'compare' || currentTab === 'same') {
    inputsB = { ...inputsA };
  } else {
    const basicSalaryValB = parseFloat(basicInputB.value) || 0;
    let citValB = parseFloat(citInputB.value) || 0;
    if (isYcotek) {
      citValB = Math.max(0, citValB - (basicSalaryValB * 0.10));
    }
    inputsB = {
      monthlyBasicSalary: basicSalaryValB,
      monthlyAllowances: parseFloat(allowanceInputB.value) || 0,
      annualBonus: parseFloat(bonusInputB.value) || 0,
      filingStatus: statusSwitchB.selected ? 'married' : 'single',
      remoteArea: remoteSelectB.value,
      useSSF: ssfSwitchB.selected,
      useEPF: epfSwitchB.selected,
      citMonthly: citValB,
      lifeInsurancePremium: parseFloat(lifeInputB.value) || 0,
      healthInsurancePremium: parseFloat(healthInputB.value) || 0,
      medicalExpenses: parseFloat(medicalInputB.value) || 0,
      femaleTaxpayer: femaleSwitchB.selected,
      splitBonus: splitBonusSwitchB.selected
    };
  }

  // Calculate results
  const res82 = calculateTax({ ...inputsA, year: yearA });
  const res83 = calculateTax({ ...inputsB, year: '2083_84' });

  // Update Summary Cards
  updateSummaryCard('82', res82);
  updateSummaryCard('83', res83);

  // Update Saving Callout
  updateSavingCallout(res82, res83);

  // Update Detailed Breakdown Table
  updateDetailedTable(res82, res83, inputsA, inputsB);

  // Update Progressive Slab breakdowns
  updateSlabDisplay(slabBreakdown82El, res82);
  updateSlabDisplay(slabBreakdown83El, res83);

  // Draw Charts
  drawDonutChart('chart-svg-82', res82);
  drawDonutChart('chart-svg-83', res83);

  // Save State
  saveInputsToLocalStorage();
}

// --- Summary Updater Helper ---
function updateSummaryCard(suffix, results) {
  const isSplit = (suffix === '82') ? splitBonusSwitchA.selected : (currentTab === 'same' ? splitBonusSwitchA.selected : splitBonusSwitchB.selected);
  const bonusVal = (suffix === '82') ? (parseFloat(bonusInputA.value) || 0) : (currentTab === 'same' ? (parseFloat(bonusInputA.value) || 0) : (parseFloat(bonusInputB.value) || 0));

  // 1. Cash-in-Hand
  document.getElementById(`cash-monthly-${suffix}`).textContent = 'Rs. ' + Math.round(results.netCashInHandMonthly).toLocaleString('en-NP') + ' / mo';
  document.getElementById(`cash-annual-${suffix}`).textContent = 'Rs. ' + Math.round(results.netCashInHandAnnual).toLocaleString('en-NP') + ' / yr';
  
  const cashNoteEl = document.getElementById(`cash-monthly-note-${suffix}`);
  if (!isSplit && bonusVal > 0) {
    cashNoteEl.textContent = `(+Rs. ${Math.round(results.bonusAfterTax).toLocaleString('en-NP')} bonus when taken)`;
  } else {
    cashNoteEl.textContent = '';
  }

  // 2. Income Tax
  const monthlyTax = isSplit ? results.finalTaxLiability / 12 : results.taxWithoutBonus / 12;
  document.getElementById(`tax-monthly-${suffix}`).textContent = 'Rs. ' + Math.round(monthlyTax).toLocaleString('en-NP') + ' / mo';
  document.getElementById(`tax-annual-${suffix}`).textContent = 'Rs. ' + Math.round(results.finalTaxLiability).toLocaleString('en-NP') + ' / yr';

  const taxNoteEl = document.getElementById(`tax-monthly-note-${suffix}`);
  if (!isSplit && bonusVal > 0 && results.marginalTaxOnBonus > 0) {
    taxNoteEl.textContent = `(+Rs. ${Math.round(results.marginalTaxOnBonus).toLocaleString('en-NP')} tax on bonus when taken)`;
  } else {
    taxNoteEl.textContent = '';
  }

  // 3. Cost to Company (CTC)
  const ctcNoBonus = results.costToCompany - bonusVal;
  const ctcMonthlyVal = isSplit ? results.costToCompany / 12 : ctcNoBonus / 12;

  document.getElementById(`ctc-monthly-${suffix}`).textContent = 'Rs. ' + Math.round(ctcMonthlyVal).toLocaleString('en-NP') + ' / mo';
  document.getElementById(`ctc-annual-${suffix}`).textContent = 'Rs. ' + Math.round(results.costToCompany).toLocaleString('en-NP') + ' / yr';

  const ctcNoteEl = document.getElementById(`ctc-monthly-note-${suffix}`);
  if (!isSplit && bonusVal > 0) {
    ctcNoteEl.textContent = `(+Rs. ${Math.round(bonusVal).toLocaleString('en-NP')} bonus when taken)`;
  } else {
    ctcNoteEl.textContent = '';
  }

  // 4. Retirement Savings
  document.getElementById(`savings-monthly-${suffix}`).textContent = 'Rs. ' + Math.round(results.totalRetirementSavingsAnnual / 12).toLocaleString('en-NP') + ' / mo';
  document.getElementById(`savings-annual-${suffix}`).textContent = 'Rs. ' + Math.round(results.totalRetirementSavingsAnnual).toLocaleString('en-NP') + ' / yr';
}

// --- Dynamic Saving Callout Updater ---
function updateSavingCallout(res82, res83) {
  if (currentTab === 'same') {
    const savings = res82.finalTaxLiability - res83.finalTaxLiability;
    savingCalloutTextEl.textContent = "Annual Tax Savings with New Taxation (83/84)";
    
    if (savings > 0) {
      savingCalloutValueEl.textContent = 'Rs. ' + Math.round(savings).toLocaleString('en-NP');
      savingCalloutEl.style.background = 'var(--md-sys-color-primary-container)';
      savingCalloutEl.style.color = 'var(--md-sys-color-on-primary-container)';
      savingCalloutValueEl.style.color = 'var(--md-sys-color-primary)';
    } else if (savings < 0) {
      savingCalloutValueEl.textContent = 'Rs. ' + Math.round(Math.abs(savings)).toLocaleString('en-NP') + ' (Tax Increase)';
      savingCalloutEl.style.background = 'var(--md-sys-color-error-container)';
      savingCalloutEl.style.color = 'var(--md-sys-color-on-error-container)';
      savingCalloutValueEl.style.color = 'var(--md-sys-color-error)';
    } else {
      savingCalloutValueEl.textContent = 'Rs. 0';
      savingCalloutEl.style.background = 'var(--md-sys-color-surface-variant)';
      savingCalloutEl.style.color = 'var(--md-sys-color-on-surface-variant)';
      savingCalloutValueEl.style.color = 'var(--md-sys-color-on-surface-variant)';
    }
  } else {
    // Different structures
    const cashDiff = res83.netCashInHandAnnual - res82.netCashInHandAnnual;
    savingCalloutTextEl.textContent = "Annual Cash-in-Hand Difference (Profile B vs. Profile A)";
    
    if (cashDiff > 0) {
      savingCalloutValueEl.textContent = '+ Rs. ' + Math.round(cashDiff).toLocaleString('en-NP');
      savingCalloutEl.style.background = 'var(--md-sys-color-primary-container)';
      savingCalloutEl.style.color = 'var(--md-sys-color-on-primary-container)';
      savingCalloutValueEl.style.color = 'var(--md-sys-color-primary)';
    } else if (cashDiff < 0) {
      savingCalloutValueEl.textContent = '- Rs. ' + Math.round(Math.abs(cashDiff)).toLocaleString('en-NP');
      savingCalloutEl.style.background = 'var(--md-sys-color-error-container)';
      savingCalloutEl.style.color = 'var(--md-sys-color-on-error-container)';
      savingCalloutValueEl.style.color = 'var(--md-sys-color-error)';
    } else {
      savingCalloutValueEl.textContent = 'Rs. 0';
    }
  }
}

// --- Populates Detailed Comparison Table ---
function updateDetailedTable(res82, res83, inputsA, inputsB) {
  const formatCell = (num, isBold = false) => {
    const rounded = Math.round(num);
    const text = 'Rs. ' + rounded.toLocaleString('en-NP');
    return isBold ? `<strong>${text}</strong>` : text;
  };

  const formatDiffCell = (diff) => {
    const rounded = Math.round(diff);
    if (rounded === 0) return 'Rs. 0';
    const sign = rounded > 0 ? '+' : '';
    const className = rounded > 0 ? 'highlight-positive' : 'highlight-negative';
    return `<span class="${className}">${sign}${rounded.toLocaleString('en-NP')}</span>`;
  };

  const createRow = (label, val82, val83, isHeader = false, isBold = false, isDiffInverse = false) => {
    const diff = val83 - val82;
    const diffVal = isDiffInverse ? -diff : diff;

    return `
      <tr class="${isHeader ? 'row-group-title' : ''} ${isBold ? 'net-highlight' : ''}">
        <td>${label}</td>
        <td>${formatCell(val82, isBold)}</td>
        <td>${formatCell(val83, isBold)}</td>
        <td>${formatDiffCell(diffVal)}</td>
      </tr>
    `;
  };

  let html = '';

  // 1. Gross Earnings
  html += createRow('Gross Cash Salary components:', 0, 0, true);
  html += createRow('Annual Basic Salary', inputsA.monthlyBasicSalary * 12, inputsB.monthlyBasicSalary * 12);
  html += createRow('Annual Allowances', inputsA.monthlyAllowances * 12, inputsB.monthlyAllowances * 12);
  html += createRow('Annual Bonus / Other Income', inputsA.annualBonus, inputsB.annualBonus);
  html += createRow('Bonus / Gratuity After Tax', res82.bonusAfterTax, res83.bonusAfterTax);
  html += createRow('Gross Cash Income (Annual)', res82.grossCashSalaryAnnual, res83.grossCashSalaryAnnual, false, true);

  // 2. Employer Additions & Cost to Company
  html += createRow('Employer Contributions & Cost to Company (CTC):', 0, 0, true);
  html += createRow('Employer SSF (20% basic)', res82.employerSSFAnnual, res83.employerSSFAnnual);
  html += createRow('Employer EPF (10% basic)', res82.employerEPFAnnual, res83.employerEPFAnnual);
  html += createRow('Assessable Income (Tax Base)', res82.assessableIncome, res83.assessableIncome, false, true);
  html += createRow('Cost to Company (CTC)', res82.costToCompany, res83.costToCompany, false, true);

  // 3. Deductions
  html += createRow('Allowable Tax Deductions:', 0, 0, true);
  html += createRow('Retirement Fund (SSF + EPF + CIT)', res82.allowedRetirementDeduction, res83.allowedRetirementDeduction, false, false, true);
  html += createRow('Life Insurance Exemption', res82.allowedLifeInsurance, res83.allowedLifeInsurance, false, false, true);
  html += createRow('Health Insurance Exemption', res82.allowedHealthInsurance, res83.allowedHealthInsurance, false, false, true);
  html += createRow('Remote Area Exemption', res82.allowedRemoteArea, res83.allowedRemoteArea, false, false, true);
  html += createRow('Total Taxable Income', res82.taxableIncome, res83.taxableIncome, false, true, true);

  // 4. Taxes & Credits
  html += createRow('Taxes and Credits Breakdown:', 0, 0, true);
  html += createRow('Base progressive Tax', res82.baseTaxLiability, res83.baseTaxLiability, false, false, true);
  html += createRow('Medical Expenses Tax Credit', res82.allowedMedicalCredit, res83.allowedMedicalCredit);
  html += createRow('Female Tax Rebate (10%)', res82.femaleRebate, res83.femaleRebate);
  html += createRow('Final Annual Income Tax Paid', res82.finalTaxLiability, res83.finalTaxLiability, false, true, true);

  // 5. Cash in Hand
  html += createRow('Employee Cash flow (Net Take-home):', 0, 0, true);
  html += createRow('Out-of-Pocket Savings (Employee SSF+EPF+CIT)', res82.employeeOutofPocketDeductions, res83.employeeOutofPocketDeductions, false, false, true);
  html += createRow('Annual Cash in Hand (Take-Home)', res82.netCashInHandAnnual, res83.netCashInHandAnnual, false, true);
  
  let monthlyLabel = 'Monthly Cash in Hand (Take-Home)';
  if (currentTab === 'same') {
    monthlyLabel += splitBonusSwitchA.selected ? ' (incl. bonus)' : ' (excl. bonus & its tax)';
  } else {
    monthlyLabel += ` (A: ${splitBonusSwitchA.selected ? 'incl.' : 'excl.'} bonus, B: ${splitBonusSwitchB.selected ? 'incl.' : 'excl.'} bonus)`;
  }
  html += createRow(monthlyLabel, res82.netCashInHandMonthly, res83.netCashInHandMonthly, false, true);

  // 6. Savings Growth
  html += createRow('Retirement Wealth Accumulation:', 0, 0, true);
  html += createRow('Annual Retirement Savings (incl. Employer Match)', res82.totalRetirementSavingsAnnual, res83.totalRetirementSavingsAnnual, false, false);
  html += createRow('Total Financial Value (Take-Home + Savings)', res82.netCashInHandAnnual + res82.totalRetirementSavingsAnnual, res83.netCashInHandAnnual + res83.totalRetirementSavingsAnnual, false, true);

  comparisonTableBody.innerHTML = html;
}

// --- Updates Slab Breakdown displays ---
function updateSlabDisplay(container, results) {
  if (results.taxBreakdown.length === 0) {
    container.innerHTML = '<div style="color: var(--md-sys-color-tertiary); font-weight: 500;">No tax liability (Income below threshold or fully exempt)</div>';
    return;
  }

  let html = '';
  results.taxBreakdown.forEach(slab => {
    const ratePercent = (slab.rate * 100).toFixed(0);
    html += `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted var(--md-sys-color-outline-variant); padding: 4px 0;">
        <span>Slab: ${slab.range} (${ratePercent}%)</span>
        <strong>Rs. ${Math.round(slab.tax).toLocaleString('en-NP')}</strong>
      </div>
    `;
  });
  container.innerHTML = html;
}

// --- Dynamic Vector SVG Donut Chart Drawer ---
function drawDonutChart(svgId, results) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = '';

  const takeHome = results.netCashInHandAnnual;
  const tax = results.finalTaxLiability;
  const savings = results.employeeOutofPocketDeductions;
  const total = takeHome + tax + savings;

  if (total === 0) return;

  const pctTakeHome = takeHome / total;
  const pctTax = tax / total;
  const pctSavings = savings / total;

  // Donut Config
  const cx = 90;
  const cy = 90;
  const r = 55;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * r;

  let offset = 0;

  const createSegment = (pct, color, label) => {
    if (pct <= 0) return '';
    const strokeDash = circumference * pct;
    const strokeOffset = circumference - offset;
    offset += strokeDash;

    return `
      <circle 
        cx="${cx}" cy="${cy}" r="${r}" 
        fill="transparent" 
        stroke="${color}" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${strokeDash} ${circumference - strokeDash}" 
        stroke-dashoffset="${strokeOffset}" 
        transform="rotate(-90 ${cx} ${cy})"
        style="transition: stroke-dashoffset 0.5s ease-in-out;"
      />
    `;
  };

  const colorTakeHome = '#34D399';
  const colorTax = '#F87171';
  const colorSavings = '#60A5FA';

  let segmentsHtml = '';
  segmentsHtml += createSegment(pctTakeHome, colorTakeHome, 'Take-Home');
  segmentsHtml += createSegment(pctSavings, colorSavings, 'Savings');
  segmentsHtml += createSegment(pctTax, colorTax, 'Tax');

  const pctTakeHomeText = Math.round(pctTakeHome * 100) + '%';

  svg.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="transparent" stroke="var(--md-sys-color-outline-variant)" stroke-width="${strokeWidth + 2}" opacity="0.3" />
    ${segmentsHtml}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="var(--font-title)" font-size="14" font-weight="700" fill="var(--md-sys-color-on-surface)">
      Take-Home
    </text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="var(--font-title)" font-size="16" font-weight="800" fill="#34D399">
      ${pctTakeHomeText}
    </text>
    <g transform="translate(195, 30)" font-family="var(--font-body)" font-size="10" font-weight="500" fill="var(--md-sys-color-on-surface-variant)">
      <rect x="0" y="0" width="10" height="10" rx="3" fill="${colorTakeHome}" />
      <text x="16" y="9">Take-Home: ${Math.round(pctTakeHome * 100)}%</text>
      <rect x="0" y="20" width="10" height="10" rx="3" fill="${colorSavings}" />
      <text x="16" y="29">Savings: ${Math.round(pctSavings * 100)}%</text>
      <rect x="0" y="40" width="10" height="10" rx="3" fill="${colorTax}" />
      <text x="16" y="49">Tax Paid: ${Math.round(pctTax * 100)}%</text>
    </g>
  `;
}

// --- Sticky Header Height Calculation ---
function updateHeaderHeight() {
  const header = document.querySelector('header');
  if (header) {
    const rect = header.getBoundingClientRect();
    document.documentElement.style.setProperty('--header-height', `${rect.height}px`);
  }
}
window.addEventListener('load', updateHeaderHeight);
window.addEventListener('resize', updateHeaderHeight);

// --- Initialize App ---
initTheme();
loadInputsFromLocalStorage();
triggerRecalculation();
updateHeaderHeight();
console.log('Nepal Income Tax Calculator Controller initialized!');

let sex = 'male';
let goal = 'maintain';

function setSex(s) {
  sex = s;
  document.getElementById('btnMale').className   = `flex-1 py-3 rounded-2xl border font-semibold transition-all ${s==='male'   ? 'border-emerald-500 bg-emerald-600/30 ring-2 ring-emerald-500' : 'border-white/20 bg-white/5'}`;
  document.getElementById('btnFemale').className = `flex-1 py-3 rounded-2xl border font-semibold transition-all ${s==='female' ? 'border-emerald-500 bg-emerald-600/30 ring-2 ring-emerald-500' : 'border-white/20 bg-white/5'}`;
}

function setGoal(g) {
  goal = g;
  ['cut','maintain','bulk'].forEach(x => {
    const btn = document.getElementById('btn' + x.charAt(0).toUpperCase() + x.slice(1));
    btn.className = `py-3 rounded-2xl border text-sm font-semibold transition-all ${x===g ? 'border-emerald-500 bg-emerald-600/30 ring-2 ring-emerald-500' : 'border-white/20 bg-white/5'}`;
  });
}

function calculate() {
  const age    = parseFloat(document.getElementById('age').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const activity = parseFloat(document.getElementById('activity').value);

  if (!age || !weight || !height || age < 10 || age > 120 || weight < 20 || height < 100) {
    alert('Please fill in valid age, weight, and height.');
    return;
  }

  // Mifflin-St Jeor BMR formula
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = Math.round(bmr * activity);

  // Calorie target based on goal
  let calories;
  const tips = {
    cut:      `Eating ${Math.round(tdee - tdee*0.2)} kcal puts you in a ~20% deficit — ideal for steady fat loss of ~0.5kg/week. Prioritize protein to protect muscle.`,
    maintain: `${tdee} kcal maintains your current weight. Great base for body recomposition.`,
    bulk:     `Eating ${Math.round(tdee + tdee*0.1)} kcal gives you a ~10% surplus — a clean lean bulk with minimal fat gain.`
  };

  if (goal === 'cut')      calories = Math.round(tdee * 0.80);
  else if (goal === 'bulk') calories = Math.round(tdee * 1.10);
  else                      calories = tdee;

  // Macro split (protein 30%, carbs 40%, fat 30%)
  const proteinCals = calories * 0.30;
  const carbsCals   = calories * 0.40;
  const fatCals     = calories * 0.30;

  const protein = Math.round(proteinCals / 4);
  const carbs   = Math.round(carbsCals   / 4);
  const fat     = Math.round(fatCals     / 9);

  // Render
  document.getElementById('calDisplay').textContent  = calories.toLocaleString();
  document.getElementById('bmrDisplay').textContent  = Math.round(bmr).toLocaleString();
  document.getElementById('tdeeDisplay').textContent = tdee.toLocaleString();
  document.getElementById('proteinG').textContent    = `${protein}g`;
  document.getElementById('carbsG').textContent      = `${carbs}g`;
  document.getElementById('fatG').textContent        = `${fat}g`;
  document.getElementById('goalTip').textContent     = tips[goal];

  // Bars (relative to each other)
  const max = Math.max(proteinCals, carbsCals, fatCals);
  setTimeout(() => {
    document.getElementById('proteinBar').style.width = (proteinCals / max * 100) + '%';
    document.getElementById('carbsBar').style.width   = (carbsCals   / max * 100) + '%';
    document.getElementById('fatBar').style.width     = (fatCals     / max * 100) + '%';
  }, 50);

  // Show card
  document.getElementById('resultsCard').classList.remove('hidden');
  document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });

  // Store for sharing
  window._lastResult = { sex, goal, age, weight, height, activity, calories, protein, carbs, fat };
}

function share() {
  if (!window._lastResult) return;
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(window._lastResult))));
  const url  = location.origin + location.pathname + '#r=' + encodeURIComponent(b64);
  navigator.clipboard.writeText(url)
    .then(() => alert('✅ Link copied! Share your macros 💪'))
    .catch(() => prompt('Copy this link:', url));
}

// Load shared result from URL
const match = location.hash.match(/#r=([^&]+)/);
if (match) {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(match[1])))));
    document.getElementById('age').value    = d.age;
    document.getElementById('weight').value = d.weight;
    document.getElementById('height').value = d.height;
    document.getElementById('activity').value = d.activity;
    setSex(d.sex);
    setGoal(d.goal);
    calculate();
  } catch {}
}

// Init default button states
setSex('male');
setGoal('maintain');

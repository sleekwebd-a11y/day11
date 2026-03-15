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
  const age      = parseFloat(document.getElementById('age').value);
  const weight   = parseFloat(document.getElementById('weight').value);
  const height   = parseFloat(document.getElementById('height').value);
  const activity = parseFloat(document.getElementById('activity').value);

  // Strict validation — prevents crazy outputs
  if (
    !age    || isNaN(age)    || age    < 10  || age    > 100 ||
    !weight || isNaN(weight) || weight < 30  || weight > 300 ||
    !height || isNaN(height) || height < 100 || height > 250
  ) {
    alert('⚠️ Please check your inputs:\n• Age: 10–100 years\n• Weight: 30–300 kg\n• Height: 100–250 cm\n\nMake sure weight is in KG and height is in CM.');
    return;
  }

  // Mifflin-St Jeor BMR
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = Math.round(bmr * activity);

  // Sanity check — TDEE should never be crazy
  if (tdee < 800 || tdee > 6000) {
    alert('⚠️ Something looks off with your inputs. Double-check weight (kg) and height (cm).');
    return;
  }

  let calories;
  if (goal === 'cut')       calories = Math.round(tdee * 0.80);
  else if (goal === 'bulk') calories = Math.round(tdee * 1.10);
  else                      calories = tdee;

  const protein = Math.round((calories * 0.30) / 4);
  const carbs   = Math.round((calories * 0.40) / 4);
  const fat     = Math.round((calories * 0.30) / 9);

  const tips = {
    cut:      `Eating ${calories} kcal puts you in a ~20% deficit — ideal for steady fat loss of ~0.5kg/week. Prioritize protein to protect muscle.`,
    maintain: `${calories} kcal maintains your current weight. Great base for body recomposition.`,
    bulk:     `Eating ${calories} kcal gives you a ~10% surplus — a clean lean bulk with minimal fat gain.`
  };

  document.getElementById('calDisplay').textContent  = calories.toLocaleString();
  document.getElementById('bmrDisplay').textContent  = Math.round(bmr).toLocaleString();
  document.getElementById('tdeeDisplay').textContent = tdee.toLocaleString();
  document.getElementById('proteinG').textContent    = `${protein}g`;
  document.getElementById('carbsG').textContent      = `${carbs}g`;
  document.getElementById('fatG').textContent        = `${fat}g`;
  document.getElementById('goalTip').textContent     = tips[goal];

  const maxCals = Math.max(calories * 0.30, calories * 0.40, calories * 0.30);
  setTimeout(() => {
    document.getElementById('proteinBar').style.width = ((calories * 0.30) / maxCals * 100) + '%';
    document.getElementById('carbsBar').style.width   = ((calories * 0.40) / maxCals * 100) + '%';
    document.getElementById('fatBar').style.width     = ((calories * 0.30) / maxCals * 100) + '%';
  }, 50);

  document.getElementById('resultsCard').classList.remove('hidden');
  document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });

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

// Load shared result from URL hash
const match = location.hash.match(/#r=([^&]+)/);
if (match) {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(match[1])))));
    if (
      d.age > 10 && d.age < 100 &&
      d.weight > 30 && d.weight < 300 &&
      d.height > 100 && d.height < 250
    ) {
      document.getElementById('age').value     = d.age;
      document.getElementById('weight').value  = d.weight;
      document.getElementById('height').value  = d.height;
      document.getElementById('activity').value = d.activity;
      setSex(d.sex);
      setGoal(d.goal);
      calculate();
    }
  } catch {}
}

setSex('male');
setGoal('maintain');

/* ═══════════════════════════════════════════════
   FitGuide Pro — script.js
   All interactive features, calculators, and data
═══════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   NAVBAR: scroll state + mobile menu
───────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

// Close mobile menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

/* ─────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.05) + 's';
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────────
   HERO PARTICLES
───────────────────────────────────────────── */
(function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-delay: ${Math.random() * 12}s;
      animation-duration: ${Math.random() * 10 + 8}s;
    `;
    container.appendChild(p);
  }
})();

/* ─────────────────────────────────────────────
   ANIMATED STAT COUNTERS
───────────────────────────────────────────── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ─────────────────────────────────────────────
   BMI CALCULATOR
───────────────────────────────────────────── */
function calculateBMI() {
  const h = parseFloat(document.getElementById('bmi-height').value);
  const w = parseFloat(document.getElementById('bmi-weight').value);
  const result = document.getElementById('bmi-result');

  if (!h || !w || h < 50 || h > 300 || w < 10 || w > 500) {
    result.innerHTML = `<div class="result-content"><p style="color:var(--danger)">⚠ Please enter valid height and weight values.</p></div>`;
    return;
  }

  const bmi = +(w / ((h / 100) ** 2)).toFixed(1);
  let category, color, icon, desc, tips;

  if (bmi < 18.5) {
    category = 'Underweight'; color = '#3b82f6'; icon = '🔵';
    desc = 'You are below the healthy weight range. Consider increasing calorie intake with nutrient-dense foods.';
    tips = ['Eat calorie-dense whole foods', 'Add protein shakes', 'Strength train to build muscle mass'];
  } else if (bmi < 25) {
    category = 'Normal Weight'; color = '#ADFF2F'; icon = '✅';
    desc = 'Great! You are within the healthy BMI range. Maintain this with balanced nutrition and regular exercise.';
    tips = ['Keep your balanced diet', 'Exercise 3–5x per week', 'Focus on strength & cardio'];
  } else if (bmi < 30) {
    category = 'Overweight'; color = '#f59e0b'; icon = '⚠️';
    desc = 'You are slightly above the healthy range. A moderate calorie deficit combined with exercise can help.';
    tips = ['Reduce processed foods', 'Add 30 min cardio daily', 'Track your calories'];
  } else {
    category = 'Obese'; color = '#ef4444'; icon = '🔴';
    desc = 'Your BMI is in the obese range. Consult a healthcare provider and consider a structured weight-loss plan.';
    tips = ['See a healthcare professional', 'Start with low-impact exercise', 'Gradually reduce calories'];
  }

  result.innerHTML = `
    <div class="result-content">
      <div class="result-icon">${icon}</div>
      <div class="result-big" style="color:${color}">${bmi}</div>
      <div class="result-label" style="color:${color}">${category}</div>
      <p class="result-desc">${desc}</p>
      <ul style="margin-top:1rem;display:flex;flex-direction:column;gap:0.4rem">
        ${tips.map(t => `<li style="font-size:0.85rem;color:var(--text-muted);display:flex;align-items:flex-start;gap:8px"><span style="color:var(--accent);flex-shrink:0">▸</span>${t}</li>`).join('')}
      </ul>
    </div>`;
}

/* ─────────────────────────────────────────────
   CALORIE CALCULATOR (Mifflin-St Jeor)
───────────────────────────────────────────── */
function calculateCalories() {
  const age      = parseFloat(document.getElementById('cal-age').value);
  const gender   = document.getElementById('cal-gender').value;
  const height   = parseFloat(document.getElementById('cal-height').value);
  const weight   = parseFloat(document.getElementById('cal-weight').value);
  const activity = parseFloat(document.getElementById('cal-activity').value);
  const result   = document.getElementById('cal-result');

  if (!age || !height || !weight || age < 1 || age > 120 || height < 50 || weight < 10) {
    result.innerHTML = `<div class="result-content"><p style="color:var(--danger)">⚠ Please fill in all fields with valid values.</p></div>`;
    return;
  }

  // Mifflin-St Jeor BMR
  let bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee   = Math.round(bmr * activity);
  const loss   = Math.round(tdee - 500);
  const gain   = Math.round(tdee + 500);
  const lossAgg= Math.round(tdee - 1000);

  result.innerHTML = `
    <div class="result-content">
      <div class="result-icon">🔥</div>
      <div style="margin-bottom:1rem">
        <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Daily Maintenance</div>
        <div class="result-big">${tdee.toLocaleString()}</div>
        <div style="font-size:0.9rem;color:var(--text-muted)">calories / day</div>
      </div>
      <div class="cal-row">
        <span class="cal-row-label">🏋 Maintain weight</span>
        <span class="cal-row-val main">${tdee.toLocaleString()} kcal</span>
      </div>
      <div class="cal-row">
        <span class="cal-row-label">⬇ Mild weight loss (0.5 kg/wk)</span>
        <span class="cal-row-val" style="color:#f59e0b">${loss.toLocaleString()} kcal</span>
      </div>
      <div class="cal-row">
        <span class="cal-row-label">⬇⬇ Weight loss (1 kg/wk)</span>
        <span class="cal-row-val" style="color:#ef4444">${lossAgg.toLocaleString()} kcal</span>
      </div>
      <div class="cal-row">
        <span class="cal-row-label">⬆ Weight gain</span>
        <span class="cal-row-val" style="color:#22c55e">${gain.toLocaleString()} kcal</span>
      </div>
      <p style="font-size:0.78rem;color:var(--text-dim);margin-top:1rem">Based on Mifflin-St Jeor equation. Adjust based on real-world results.</p>
    </div>`;
}

/* ─────────────────────────────────────────────
   DIET DATA & RENDERER
───────────────────────────────────────────── */
const dietPlans = {
  loss: {
    breakfast: { icon:'🌅', items:['Oats with skim milk & berries (300 kcal)','2 boiled eggs','Black coffee or green tea'], cal:'~400 kcal' },
    lunch:     { icon:'☀️', items:['Grilled chicken breast (200g)','Brown rice (1 cup)','Steamed broccoli & carrots','Lemon water'], cal:'~550 kcal' },
    dinner:    { icon:'🌙', items:['Baked salmon or paneer (150g)','Mixed greens salad','Cucumber & tomato raita','Herbal tea'], cal:'~450 kcal' },
    snacks:    { icon:'🍎', items:['Apple or orange','A handful of almonds (15g)','Low-fat Greek yoghurt (100g)','Protein shake (optional)'], cal:'~200 kcal' },
  },
  maintain: {
    breakfast: { icon:'🌅', items:['Whole-grain toast with peanut butter','2 eggs (any style)','Banana','Orange juice'], cal:'~550 kcal' },
    lunch:     { icon:'☀️', items:['Grilled chicken / tofu wrap','Quinoa or whole-grain rice','Mixed vegetable stir-fry','Coconut water'], cal:'~700 kcal' },
    dinner:    { icon:'🌙', items:['Lean beef or dal (protein source)','Sweet potato mash','Sautéed spinach with garlic','Warm turmeric milk'], cal:'~600 kcal' },
    snacks:    { icon:'🍎', items:['Banana + peanut butter','Trail mix (30g)','Cottage cheese (100g)','Protein bar (if training)'], cal:'~350 kcal' },
  },
  gain: {
    breakfast: { icon:'🌅', items:['4 whole eggs (scrambled)','Whole-milk oats with honey & banana','Whole-grain toast (2 slices)','Full-fat milk glass'], cal:'~900 kcal' },
    lunch:     { icon:'☀️', items:['Double-portion chicken / paneer','White rice (2 cups)','Lentil dal','Avocado or olive oil drizzle'], cal:'~1100 kcal' },
    dinner:    { icon:'🌙', items:['Beef / chickpea curry','Whole-wheat roti (3)','Cheese omelette','Full-fat Greek yoghurt'], cal:'~950 kcal' },
    snacks:    { icon:'🍎', items:['Mass gainer shake (1 scoop)','Peanut butter on rice cakes','Handful of mixed nuts & dates','Cheese & whole-grain crackers'], cal:'~600 kcal' },
  }
};

function showDiet(type) {
  // Update tab buttons
  document.querySelectorAll('.diet-tabs .tab-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(
      type === 'loss' ? 'loss' : type === 'gain' ? 'gain' : 'main'
    ));
    b.setAttribute('aria-selected', b.classList.contains('active'));
  });

  const plan = dietPlans[type];
  const meals = [
    { key:'breakfast', label:'Breakfast' },
    { key:'lunch',     label:'Lunch' },
    { key:'dinner',    label:'Dinner' },
    { key:'snacks',    label:'Snacks' },
  ];

  document.getElementById('diet-content').innerHTML = meals.map(({ key, label }) => {
    const meal = plan[key];
    return `
      <div class="diet-card">
        <div class="diet-card-header">
          <span class="diet-meal-icon">${meal.icon}</span>
          <span class="diet-meal-name">${label}</span>
        </div>
        <div class="diet-card-body">
          ${meal.items.map(i => `<div class="diet-item">${i}</div>`).join('')}
          <div class="diet-cal">Approx. <strong>${meal.cal}</strong></div>
        </div>
      </div>`;
  }).join('');
}

// Initialise diet section
showDiet('loss');

/* ─────────────────────────────────────────────
   EXERCISE LIBRARY DATA
───────────────────────────────────────────── */
const exercises = [
  // Chest
  { name:'Bench Press', muscle:'Chest', diff:'Medium', icon:'🏋', img:'https://healthendure.com/wp-content/uploads/2024/08/bench-press-main.webp', desc:'The classic chest builder. Targets the pectoralis major, anterior deltoid and triceps.', steps:['Lie flat, grip bar shoulder-width+','Lower bar slowly to mid-chest','Press up explosively, keep wrists straight','Breathe in down, out on press'], cat:'chest' },
  { name:'Push-Ups', muscle:'Chest', diff:'Easy', icon:'💪', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMxz2EZXb4csgrR_0Lgv_tRvB7pfcU-kSnqQ&s', desc:'Bodyweight staple. Works chest, shoulders and core. Ideal for all levels.', steps:['Hands slightly wider than shoulders','Keep body in a straight line','Lower chest to 1 inch from floor','Push back up, fully extend arms'], cat:'chest' },
  { name:'Incline Dumbbell Press', muscle:'Upper Chest', diff:'Medium', icon:'🏋', img:'https://image.boxrox.com/2024/07/Incline-dumbbell-bench-press.jpg', desc:'Targets the upper chest. Keep elbows at 45° to reduce shoulder stress.', steps:['Set bench to 30-45° incline','Hold dumbbells at chest level','Press up and slightly inward','Lower with control, 2-3 seconds'], cat:'chest' },
  { name:'Cable Fly', muscle:'Chest', diff:'Easy', icon:'🔄', img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', desc:'Isolation movement for peak pec contraction. Great as a finisher.', steps:['Set cables at chest height','Step forward, slight forward lean','Bring hands together in arc motion','Squeeze chest at centre, hold 1 sec'], cat:'chest' },
  { name:'Dips', muscle:'Lower Chest', diff:'Hard', icon:'⬇', img:'https://garagegympro.com/wp-content/uploads/2022/09/Dip-Bar-Dip-Chest-Dip-scaled.webp', desc:'Compound movement hitting chest and triceps. Lean forward to emphasise chest.', steps:['Grip parallel bars, arms extended','Lean forward 30° for chest focus','Lower slowly until shoulder is at elbow level','Push up through palms to start'], cat:'chest' },
  // Back
  { name:'Deadlift', muscle:'Full Back', diff:'Hard', icon:'🏋', img:'https://th.bing.com/th/id/OIP.ZHAf1hibQ5nWs0-InjMAowHaE7?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3', desc:'King of all lifts. Builds total posterior chain strength.', steps:['Feet hip-width, bar over mid-foot','Hinge at hips, grip just outside knees','Keep chest up, back flat throughout','Drive through heels, lock hips at top'], cat:'back' },
  { name:'Pull-Ups', muscle:'Lats', diff:'Hard', icon:'🆙', img:'https://hips.hearstapps.com/hmg-prod/images/mh0418-fit-pul-01-1558554157.jpg', desc:'Best bodyweight lat builder. Use full range of motion for maximum effect.', steps:['Hang from bar, hands shoulder-width','Pull chest to bar, elbows drive down','Pause 1 second at top','Lower fully with control — 3 seconds'], cat:'back' },
  { name:'Barbell Row', muscle:'Mid Back', diff:'Medium', icon:'🔄', img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80', desc:'Builds thickness in the middle back. Keep back flat, drive elbows back.', steps:['Hinge 45°, bar hanging at shins','Pull bar to lower ribcage','Drive elbows past torso','Lower bar fully before next rep'], cat:'back' },
  { name:'Lat Pulldown', muscle:'Lats', diff:'Easy', icon:'⬇', img:'https://tse3.mm.bing.net/th/id/OIP.UUZobiYBoSAWdRnZkcP8JAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', desc:'Great for beginners building lat width. Pull to the collarbone.', steps:['Grip bar wide, sit with thighs secured','Pull bar down to upper chest','Lean back slightly, elbows drive down','Slow 3-second return to full extension'], cat:'back' },
  { name:'Seated Cable Row', muscle:'Mid Back', diff:'Easy', icon:'🔄', img:'https://tse4.mm.bing.net/th/id/OIP.7cq52CgJ2x8kx_A6t_P3FQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', desc:'Targets rhomboids and mid-traps. Squeeze shoulder blades at the peak.', steps:['Sit upright, feet on platform','Pull handle to lower abdomen','Squeeze shoulder blades at end','Return with straight back'], cat:'back' },
  // Shoulders
  { name:'Overhead Press', muscle:'Shoulders', diff:'Hard', icon:'🏋', img:'https://breakingmuscle.com/wp-content/uploads/2022/03/Overhead-Dumbbell-Press.jpg', desc:'Premier shoulder builder. Works all three deltoid heads plus triceps.', steps:['Bar at collar-bone, hands shoulder-width','Press straight up, lock out at top','Keep core braced, do not lean back','Lower bar to clavicle with control'], cat:'shoulders' },
  { name:'Lateral Raises', muscle:'Side Delts', diff:'Easy', icon:'↔', img:'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80', desc:'Isolation for shoulder width. Control the negative — don\'t swing.', steps:['Stand tall, dumbbells at sides','Raise arms to shoulder height — slight bend in elbow','Pinkies slightly higher than thumbs','Lower slowly over 3 seconds'], cat:'shoulders' },
  { name:'Face Pulls', muscle:'Rear Delts', diff:'Easy', icon:'🔄', img:'https://th.bing.com/th/id/OIP.xvSV6ud8jtX8YGCTZR7lmwHaD4?w=299&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', desc:'Essential for shoulder health. Corrects imbalance from pressing movements.', steps:['Cable at face height, rope attachment','Pull to face, elbows high and wide','Externally rotate at peak','Hold 1 sec, return slowly'], cat:'shoulders' },
  { name:'Arnold Press', muscle:'Shoulders', diff:'Medium', icon:'🔄', img:'https://tse3.mm.bing.net/th/id/OIP.EgdkTwATWLfGfQqJsIBvEQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', desc:'Hits all three deltoid heads through a rotating arc of motion.', steps:['Start with palms facing you, elbows bent','Rotate palms forward as you press up','Full arm extension at top','Reverse rotation on the way down'], cat:'shoulders' },
  // Biceps
  { name:'Barbell Curl', muscle:'Biceps', diff:'Easy', icon:'💪', img:'data:image/webp;base64,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', desc:'Classic mass builder for the biceps. Use a shoulder-width grip.', steps:['Stand upright, EZ-bar or straight bar','Elbows pinned at sides throughout','Curl bar to shoulder level','Lower with 3-second count'], cat:'biceps' },
  { name:'Hammer Curl', muscle:'Brachialis', diff:'Easy', icon:'🔨', img:'https://sportschoolplus.nl/wp-content/uploads/2020/07/Standing-hammer-curl.jpeg', desc:'Neutral-grip curl that builds overall arm thickness and forearm strength.', steps:['Neutral grip (thumbs up), arms at sides','Curl up keeping neutral grip','Do not rotate wrist at top','Alternate arms or both together'], cat:'biceps' },
  { name:'Concentration Curl', muscle:'Biceps Peak', diff:'Easy', icon:'🎯', img:'https://tse1.mm.bing.net/th/id/OIP.RzHNN-QeMjsAQ1aP9CvI3gHaFe?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', desc:'Maximises the peak contraction. Brace elbow against inner thigh.', steps:['Sit, elbow braced on inner thigh','Curl up with complete focus on bicep','Squeeze hard at the top','Lower fully to fully stretch bicep'], cat:'biceps' },
  { name:'Chin-Ups', muscle:'Biceps', diff:'Hard', icon:'🆙', img:'data:image/jpeg;base64,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', desc:'Bodyweight compound that uses the biceps heavily. Great for strength.', steps:['Underhand grip, hands shoulder-width','Chin clears bar — no kipping','Hold 1 second at top','Lower slowly over 3-4 seconds'], cat:'biceps' },
  // Triceps
  { name:'Skull Crushers', muscle:'Triceps', diff:'Medium', icon:'💀', img:'data:image/jpeg;base64,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', desc:'Lying triceps extension. Keep elbows stationary and lower the bar slowly.', steps:['Lie flat, hold EZ-bar overhead','Lower bar toward forehead, elbows fixed','Pause just above forehead','Extend arm back to start'], cat:'triceps' },
  { name:'Tricep Pushdown', muscle:'Triceps', diff:'Easy', icon:'⬇', img:'https://cdn.mos.cms.futurecdn.net/xxZnUViss8Vf2QDUXAgd8c.jpg', desc:'Cable isolation for the triceps. Full extension is key.', steps:['Rope or bar attachment at high cable','Elbows pinned at sides','Push down until fully extended','Slow return — 3 seconds up'], cat:'triceps' },
  { name:'Close-Grip Bench Press', muscle:'Triceps', diff:'Medium', icon:'🏋', img:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif', desc:'Compound triceps builder. Elbows close to the body throughout.', steps:['Hands shoulder-width or slightly closer','Lower bar to lower chest, elbows in','Press up fully, squeeze triceps at top','Do not flare elbows out'], cat:'triceps' },
  { name:'Dips (Triceps)', muscle:'Triceps', diff:'Hard', icon:'⬇', img:'https://th.bing.com/th/id/OIP.S2EbXC7-W_LJfFb1Mz_NHQHaEJ?w=292&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', desc:'Stay upright to shift emphasis onto triceps. Add weight as you progress.', steps:['Stay upright — do not lean forward','Lower until elbows at 90°','Press back up through palms','Add dip belt weight when 15+ reps easy'], cat:'triceps' },
  // Legs
  { name:'Squat', muscle:'Quads', diff:'Hard', icon:'🦵', img:'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80', desc:'The ultimate lower body compound. Works quads, glutes, hamstrings and core.', steps:['Bar on upper traps, feet shoulder-width','Break at hips and knees simultaneously','Thighs parallel to floor (or below)','Drive through heels to stand'], cat:'legs' },
  { name:'Romanian Deadlift', muscle:'Hamstrings', diff:'Medium', icon:'🏋', img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80', desc:'Hip-hinge movement that isolates the hamstrings and glutes through a long range.', steps:['Stand tall, bar at hip level','Push hips back — not bend knees','Bar slides down thighs to mid-shin','Drive hips forward to stand tall'], cat:'legs' },
  { name:'Leg Press', muscle:'Quads', diff:'Easy', icon:'➡', img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', desc:'Machine compound for building quad mass. Safe for beginners.', steps:['Feet shoulder-width on platform','Lower platform to 90° knee bend','Press through full foot — not toes','Do not lock knees fully at top'], cat:'legs' },
  { name:'Lunges', muscle:'Glutes', diff:'Medium', icon:'🚶', img:'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80', desc:'Unilateral leg exercise. Improves balance and corrects left–right imbalance.', steps:['Step forward with one leg','Lower back knee toward floor','Front shin stays vertical','Push through front heel to return'], cat:'legs' },
  { name:'Calf Raises', muscle:'Calves', diff:'Easy', icon:'⬆', img:'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80', desc:'Isolates the gastrocnemius and soleus. Use full range and pause at the top.', steps:['Stand on edge of step or flat','Rise up on toes as high as possible','Hold peak contraction 1-2 seconds','Lower below starting position fully'], cat:'legs' },
  // Abs
  { name:'Plank', muscle:'Core', diff:'Easy', icon:'📐', img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', desc:'Anti-extension core stability. Keep hips level — quality over duration.', steps:['Forearms on ground, elbows below shoulders','Keep body in rigid straight line','Brace core like you\'re about to be punched','Breathe normally, hold time'],  cat:'abs' },
  { name:'Hanging Leg Raise', muscle:'Lower Abs', diff:'Hard', icon:'🆙', img:'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=400&q=80', desc:'Challenging lower ab isolator. Control the lowering phase completely.', steps:['Hang from pull-up bar','Raise legs to 90° (or higher)','Do not swing — slow and controlled','Lower over 3 seconds to start'], cat:'abs' },
  { name:'Cable Crunch', muscle:'Upper Abs', diff:'Easy', icon:'🔄', img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', desc:'Weighted crunch using a cable. Keeps constant tension throughout the movement.', steps:['Kneel at cable, rope by ears','Crunch elbow toward knees','Round back — do not use hip flexors','Return to full stretch each rep'], cat:'abs' },
  { name:'Russian Twist', muscle:'Obliques', diff:'Medium', icon:'🔄', img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', desc:'Rotational core exercise. Add weight or elevate feet for more challenge.', steps:['Sit at 45°, feet elevated or flat','Rotate torso side to side','Touch ground each side = 1 rep','Add a weight plate for progression'], cat:'abs' },
];

function diffClass(d) {
  return d === 'Easy' ? 'easy' : d === 'Medium' ? 'medium' : 'hard';
}

function renderExercises(cat) {
  const grid = document.getElementById('exercise-grid');
  const filtered = cat === 'all' ? exercises : exercises.filter(e => e.cat === cat);
  grid.innerHTML = filtered.map(e => `
    <div class="ex-card">
      <div class="ex-img">
        <img src="${e.img}" alt="${e.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="ex-img-fallback" style="display:none">${e.icon}</div>
      </div>
      <div class="ex-body">
        <div class="ex-name">${e.name}</div>
        <div class="ex-meta">
          <span class="ex-tag tag-muscle">${e.muscle}</span>
          <span class="ex-tag tag-${diffClass(e.diff)}">${e.diff}</span>
        </div>
        <p class="ex-desc">${e.desc}</p>
        ${e.steps ? `
        <div class="ex-steps">
          <div class="ex-steps-title">📋 How To Do It</div>
          ${e.steps.map((s,i) => `<div class="ex-step"><span class="ex-step-num">${i+1}</span><span>${s}</span></div>`).join('')}
        </div>` : ''}
      </div>
    </div>`).join('');
}

function filterExercises(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    const active = b.textContent.toLowerCase() === cat || (cat === 'all' && b.textContent.toLowerCase() === 'all');
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active);
  });
  renderExercises(cat);
}

renderExercises('all');

/* ─────────────────────────────────────────────
   WORKOUT PLANS DATA
───────────────────────────────────────────── */
const workoutPlans = {
  beginner: [
    { day:'Monday',    focus:'Full Body A',
      exercises:[
        {i:'🏋',n:'Goblet Squat',d:'3×12, 60s rest'},
        {i:'💪',n:'Push-Up',d:'3×10, 60s rest'},
        {i:'🆙',n:'Assisted Pull-Up',d:'3×8, 90s rest'},
        {i:'📐',n:'Plank',d:'3×30s, 60s rest'},
      ]},
    { day:'Tuesday',   focus:'Rest / Walk', exercises:[{i:'🚶',n:'Light 30-min walk',d:'Active recovery'},{i:'🧘',n:'Stretching',d:'15 min'}] },
    { day:'Wednesday', focus:'Full Body B',
      exercises:[
        {i:'🦵',n:'Bodyweight Lunge',d:'3×12 each, 60s rest'},
        {i:'🏋',n:'Dumbbell Row',d:'3×12, 60s rest'},
        {i:'🔄',n:'Shoulder Press',d:'3×10, 90s rest'},
        {i:'🔄',n:'Russian Twist',d:'3×15, 60s rest'},
      ]},
    { day:'Thursday',  focus:'Rest', exercises:[{i:'😴',n:'Full rest',d:'Recovery is growth'},{i:'💧',n:'Hydrate well',d:'3+ litres'}] },
    { day:'Friday',    focus:'Full Body C',
      exercises:[
        {i:'🏋',n:'Romanian Deadlift',d:'3×10, 90s rest'},
        {i:'💪',n:'Incline Push-Up',d:'3×12, 60s rest'},
        {i:'⬇',n:'Lat Pulldown',d:'3×12, 90s rest'},
        {i:'⬆',n:'Calf Raise',d:'3×20, 45s rest'},
      ]},
    { day:'Saturday',  focus:'Active Rest', exercises:[{i:'🚴',n:'Cycling or swimming',d:'30–45 min'},{i:'🧘',n:'Yoga / stretching',d:'20 min'}] },
    { day:'Sunday',    focus:'Rest',        exercises:[{i:'😴',n:'Full rest',d:'You\'ve earned it!'},{i:'📝',n:'Plan next week',d:'Review goals'}] },
  ],
  intermediate: [
    { day:'Monday',   focus:'Chest & Triceps',
      exercises:[
        {i:'🏋',n:'Bench Press',d:'4×8, 90s rest'},
        {i:'📐',n:'Incline Dumbbell Press',d:'4×10, 90s rest'},
        {i:'🔄',n:'Cable Fly',d:'3×12, 60s rest'},
        {i:'💀',n:'Skull Crushers',d:'3×10, 75s rest'},
        {i:'⬇',n:'Tricep Pushdown',d:'3×12, 60s rest'},
      ]},
    { day:'Tuesday',  focus:'Back & Biceps',
      exercises:[
        {i:'🏋',n:'Barbell Row',d:'4×8, 90s rest'},
        {i:'🆙',n:'Pull-Ups',d:'4×max, 120s rest'},
        {i:'⬇',n:'Lat Pulldown',d:'3×10, 90s rest'},
        {i:'💪',n:'Barbell Curl',d:'3×10, 75s rest'},
        {i:'🔨',n:'Hammer Curl',d:'3×12, 60s rest'},
      ]},
    { day:'Wednesday',focus:'Legs',
      exercises:[
        {i:'🦵',n:'Barbell Squat',d:'4×8, 120s rest'},
        {i:'🏋',n:'Romanian Deadlift',d:'4×10, 90s rest'},
        {i:'➡',n:'Leg Press',d:'3×12, 90s rest'},
        {i:'🚶',n:'Walking Lunge',d:'3×12/leg, 60s rest'},
        {i:'⬆',n:'Calf Raise',d:'4×15, 45s rest'},
      ]},
    { day:'Thursday', focus:'Rest / Cardio', exercises:[{i:'🏃',n:'HIIT cardio',d:'20 min'},{i:'🧘',n:'Foam rolling',d:'10 min'}] },
    { day:'Friday',   focus:'Shoulders & Abs',
      exercises:[
        {i:'🏋',n:'Overhead Press',d:'4×8, 90s rest'},
        {i:'↔',n:'Lateral Raise',d:'4×12, 60s rest'},
        {i:'🔄',n:'Face Pull',d:'3×15, 60s rest'},
        {i:'🆙',n:'Hanging Leg Raise',d:'3×12, 75s rest'},
        {i:'📐',n:'Cable Crunch',d:'3×15, 60s rest'},
      ]},
    { day:'Saturday', focus:'Active Recovery', exercises:[{i:'🚶',n:'Walk or light jog',d:'30 min'},{i:'🧘',n:'Stretching routine',d:'20 min'}] },
    { day:'Sunday',   focus:'Rest',           exercises:[{i:'😴',n:'Full rest',d:'Recovery optimises gains'},{i:'🥗',n:'Meal prep',d:'Plan your nutrition'}] },
  ],
  advanced: [
    { day:'Monday',   focus:'Chest (Heavy)',
      exercises:[
        {i:'🏋',n:'Bench Press',d:'5×5, 120s rest'},
        {i:'📐',n:'Weighted Dips',d:'4×8, 90s rest'},
        {i:'🏋',n:'Incline Barbell Press',d:'4×8, 90s rest'},
        {i:'🔄',n:'Weighted Cable Fly',d:'4×12, 60s rest'},
        {i:'💀',n:'Skull Crushers',d:'4×10, 75s rest'},
      ]},
    { day:'Tuesday',  focus:'Back (Heavy)',
      exercises:[
        {i:'🏋',n:'Deadlift',d:'5×5, 180s rest'},
        {i:'🆙',n:'Weighted Pull-Ups',d:'4×8, 120s rest'},
        {i:'🏋',n:'Barbell Row',d:'4×8, 90s rest'},
        {i:'🔄',n:'Seated Cable Row',d:'3×12, 75s rest'},
        {i:'💪',n:'Barbell Curl',d:'4×8, 75s rest'},
      ]},
    { day:'Wednesday',focus:'Legs (Heavy)',
      exercises:[
        {i:'🦵',n:'Back Squat',d:'5×5, 180s rest'},
        {i:'🏋',n:'Romanian Deadlift',d:'4×10, 120s rest'},
        {i:'🚶',n:'Weighted Lunge',d:'4×10/leg, 90s rest'},
        {i:'➡',n:'Leg Press',d:'4×12, 90s rest'},
        {i:'⬆',n:'Donkey Calf Raise',d:'5×20, 45s rest'},
      ]},
    { day:'Thursday', focus:'Shoulders & Power',
      exercises:[
        {i:'🏋',n:'Push Press',d:'5×5, 120s rest'},
        {i:'🏋',n:'Arnold Press',d:'4×10, 90s rest'},
        {i:'↔',n:'Lateral Raise',d:'4×15, 60s rest'},
        {i:'🔄',n:'Face Pull',d:'4×15, 60s rest'},
        {i:'🆙',n:'Hanging Leg Raise',d:'4×15, 60s rest'},
      ]},
    { day:'Friday',   focus:'Upper Body Hypertrophy',
      exercises:[
        {i:'🏋',n:'Incline Dumbbell Press',d:'4×12, 75s rest'},
        {i:'⬇',n:'Lat Pulldown',d:'4×12, 75s rest'},
        {i:'🔄',n:'Dumbbell Fly',d:'3×15, 60s rest'},
        {i:'💪',n:'Concentration Curl',d:'3×12, 60s rest'},
        {i:'⬇',n:'Tricep Pushdown',d:'3×15, 60s rest'},
      ]},
    { day:'Saturday', focus:'Conditioning',
      exercises:[
        {i:'🏃',n:'HIIT sprints',d:'8×40s on/20s off'},
        {i:'🔄',n:'Battle ropes',d:'5×40s, 30s rest'},
        {i:'🧘',n:'Stretching & mobility',d:'20 min'},
      ]},
    { day:'Sunday',   focus:'Rest',
      exercises:[
        {i:'😴',n:'Full rest',d:'Elite athletes prioritise sleep'},
        {i:'🛁',n:'Contrast shower',d:'Recovery protocol'},
        {i:'📝',n:'Log & review',d:'Analyse the week'},
      ]},
  ],
};

function showPlan(level) {
  document.querySelectorAll('.plan-tabs .tab-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(level));
  });

  const plan = workoutPlans[level];
  document.getElementById('plan-content').innerHTML = `
    <div class="plan-grid">
      ${plan.map(day => `
        <div class="plan-day">
          <div class="plan-day-header">
            <span class="plan-day-name">${day.day}</span>
            <span class="plan-day-focus">${day.focus}</span>
          </div>
          <div class="plan-exercises">
            ${day.exercises.map(ex => `
              <div class="plan-ex">
                <span class="plan-ex-icon">${ex.i}</span>
                <span class="plan-ex-name">${ex.n}</span>
                <span class="plan-ex-detail">${ex.d}</span>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

showPlan('beginner');

/* ─────────────────────────────────────────────
   WATER INTAKE CALCULATOR
───────────────────────────────────────────── */
function calculateWater() {
  const weight   = parseFloat(document.getElementById('water-weight').value);
  const activity = document.getElementById('water-activity').value;
  const result   = document.getElementById('water-result');

  if (!weight || weight < 10 || weight > 500) {
    result.innerHTML = `<div class="result-content"><p style="color:var(--danger)">⚠ Please enter a valid weight.</p></div>`;
    return;
  }

  // Base: 35ml per kg, adjusted by activity
  let base = weight * 35 / 1000;
  const multiplier = activity === 'high' ? 1.4 : activity === 'medium' ? 1.2 : 1.0;
  const litres = +(base * multiplier).toFixed(1);
  const glasses = Math.round(litres / 0.25);
  const bottles = Math.ceil(litres / 0.5);

  // Visual bottle indicators
  const bottleIcons = '🥤'.repeat(Math.min(bottles, 8)) + (bottles > 8 ? '…' : '');

  result.innerHTML = `
    <div class="result-content">
      <div class="result-icon">💧</div>
      <div class="result-big" style="color:#3b82f6">${litres}L</div>
      <div class="result-label" style="color:#3b82f6">per day</div>
      <p class="result-desc"
        style="margin:0.75rem 0">That's roughly <strong style="color:var(--text)">${glasses} glasses</strong> or <strong style="color:var(--text)">${bottles}× 500ml bottles</strong>.</p>
      <div class="water-bottles">${bottleIcons}</div>
      <div style="margin-top:1rem;display:flex;flex-direction:column;gap:6px">
        <div style="font-size:0.82rem;color:var(--text-muted)">⏰ Spread intake across waking hours</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">☕ Add 250ml for every coffee/tea</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">🥵 Hot days require +500ml extra</div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   FITNESS TIPS
───────────────────────────────────────────── */
const allTips = [
  { title:'Progressive Overload', text:'Increase weight, reps or sets gradually each week. It\'s the #1 driver of muscle growth and strength gains.' },
  { title:'Prioritise Sleep',     text:'7–9 hours of sleep per night is when muscles actually repair and grow. Poor sleep = poor gains.' },
  { title:'Protein Timing',       text:'Aim for 1.6–2.2g of protein per kg of bodyweight. Spread it across meals every 3–4 hours.' },
  { title:'Mind-Muscle Connection', text:'Focus on the muscle you\'re training. Research shows this increases activation by up to 22%.' },
  { title:'Compound First',       text:'Start sessions with compound movements (squat, deadlift, press) when you\'re freshest.' },
  { title:'Warm Up Properly',     text:'5–10 minutes of light cardio + mobility work reduces injury risk and improves performance.' },
  { title:'Stay Hydrated',        text:'Even 2% dehydration can reduce performance by 10–15%. Drink water before you\'re thirsty.' },
  { title:'Consistency Wins',     text:'Showing up 80% of the time consistently beats perfection 20% of the time. Train hard, rest well.' },
  { title:'Track Your Lifts',     text:'Logging workouts is one of the strongest predictors of long-term progress. What gets measured gets improved.' },
  { title:'Eat Whole Foods',      text:'80% of your diet should come from minimally processed foods. The remaining 20% can be flexible.' },
  { title:'Don\'t Skip Legs',     text:'Leg training releases the most testosterone and growth hormone, benefiting your entire body.' },
  { title:'Deload Weeks',         text:'Every 6–8 weeks, take a deload week at 50% intensity. It prevents burnout and actually accelerates progress.' },
];

let tipIndex = 0;

function randomTip() {
  tipIndex = (tipIndex + 1) % allTips.length;
  const tipEl = document.getElementById('tip-text');
  tipEl.style.opacity = '0';
  setTimeout(() => {
    tipEl.textContent = allTips[tipIndex].text;
    tipEl.style.opacity = '1';
    tipEl.style.transition = 'opacity 0.4s ease';
  }, 200);
}

// Initialise tip and tip grid
document.getElementById('tip-text').textContent = allTips[0].text;

document.getElementById('tips-grid').innerHTML = allTips.slice(1, 7).map(t => `
  <div class="tip-item">
    <strong>${t.title}</strong>
    ${t.text}
  </div>`).join('');

/* ─────────────────────────────────────────────
   PROGRESS TRACKER (LocalStorage)
───────────────────────────────────────────── */

// Set today's date as default
document.getElementById('track-date').value = new Date().toISOString().split('T')[0];

function getProgress() {
  return JSON.parse(localStorage.getItem('fitguide_progress') || '[]');
}

function saveProgress() {
  const date   = document.getElementById('track-date').value;
  const weight = document.getElementById('track-weight').value;
  const notes  = document.getElementById('track-notes').value.trim();
  const msg    = document.getElementById('track-msg');

  if (!date || !weight) {
    msg.className = 'form-msg error';
    msg.textContent = '⚠ Please enter both a date and weight.';
    return;
  }

  const entries = getProgress();
  entries.unshift({ id: Date.now(), date, weight: parseFloat(weight), notes });
  localStorage.setItem('fitguide_progress', JSON.stringify(entries));

  msg.className = 'form-msg success';
  msg.textContent = '✅ Entry saved successfully!';
  document.getElementById('track-weight').value = '';
  document.getElementById('track-notes').value  = '';
  setTimeout(() => { msg.className = 'form-msg'; }, 3000);

  renderProgress();
}

function deleteEntry(id) {
  const entries = getProgress().filter(e => e.id !== id);
  localStorage.setItem('fitguide_progress', JSON.stringify(entries));
  renderProgress();
}

function clearAll() {
  if (confirm('Clear all progress data? This cannot be undone.')) {
    localStorage.removeItem('fitguide_progress');
    renderProgress();
  }
}

function renderProgress() {
  const entries = getProgress();
  const list = document.getElementById('progress-list');
  if (!entries.length) {
    list.innerHTML = '<div class="empty-state">📋 No entries yet. Log your first weight above!</div>';
    return;
  }

  // Calculate trend
  const first  = entries[entries.length - 1].weight;
  const latest = entries[0].weight;
  const diff   = (latest - first).toFixed(1);
  const trend  = diff > 0 ? `⬆ +${diff} kg` : diff < 0 ? `⬇ ${diff} kg` : '➡ No change';
  const trendColor = diff > 0 ? '#f59e0b' : diff < 0 ? '#22c55e' : 'var(--text-muted)';

  list.innerHTML = `
    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;display:flex;justify-content:space-between">
      <span>${entries.length} entries</span>
      <span style="color:${trendColor};font-weight:600">${trend}</span>
    </div>
    ${entries.map(e => `
      <div class="progress-entry">
        <div>
          <div class="entry-date">${formatDate(e.date)}</div>
          <div class="entry-weight">${e.weight} <span style="font-size:1rem;font-weight:400;color:var(--text-muted)">kg</span></div>
          ${e.notes ? `<div class="entry-notes">${e.notes}</div>` : ''}
        </div>
        <button class="entry-delete" onclick="deleteEntry(${e.id})" aria-label="Delete entry">✕ Remove</button>
      </div>`).join('')}`;
}

function formatDate(str) {
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

renderProgress();

/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */
function submitContact(e) {
  e.preventDefault();
  const name    = document.getElementById('c-name').value.trim();
  const email   = document.getElementById('c-email').value.trim();
  const subject = document.getElementById('c-subject').value.trim();
  const message = document.getElementById('c-msg').value.trim();
  const msg     = document.getElementById('contact-msg');

  // Basic validation
  if (!name || !email || !subject || !message) {
    msg.className = 'form-msg error';
    msg.textContent = '⚠ Please fill in all fields.';
    return;
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    msg.className = 'form-msg error';
    msg.textContent = '⚠ Please enter a valid email address.';
    return;
  }

  // Simulate send
  msg.className = 'form-msg success';
  msg.textContent = `✅ Thanks, ${name}! Your message has been sent. We'll get back to you at ${email} soon.`;
  document.getElementById('contact-form').reset();
  setTimeout(() => { msg.className = 'form-msg'; }, 6000);
}

/* ─────────────────────────────────────────────
   HOME WORKOUT PLAN DATA
───────────────────────────────────────────── */
const homeWorkouts = {
  beginner: [
    {
      name: 'Wall Push-Up',
      muscle: 'Chest & Arms',
      diff: 'easy',
      icon: '💪',
      img: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a73?w=500&q=80',
      sets: '3 Sets × 12 Reps | Rest: 60s',
      steps: [
        { title: 'Position', desc: 'Stand an arm\'s length from wall, place hands on wall at shoulder height.' },
        { title: 'Lean', desc: 'Keep your body straight — imagine a plank from head to heel.' },
        { title: 'Lower', desc: 'Bend elbows slowly and bring chest toward wall (3 seconds).' },
        { title: 'Push', desc: 'Push back explosively until arms are almost straight. Repeat.' },
      ]
    },
    {
      name: 'Bodyweight Squat',
      muscle: 'Legs & Glutes',
      diff: 'easy',
      icon: '🦵',
      img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80',
      sets: '3 Sets × 15 Reps | Rest: 60s',
      steps: [
        { title: 'Stance', desc: 'Feet shoulder-width apart, toes slightly pointed out.' },
        { title: 'Arms', desc: 'Extend arms forward for balance, or clasp hands at chest.' },
        { title: 'Sit Back', desc: 'Push hips back and bend knees — thighs parallel to floor.' },
        { title: 'Stand', desc: 'Drive through heels to stand up. Squeeze glutes at the top.' },
      ]
    },
    {
      name: 'Glute Bridge',
      muscle: 'Glutes & Core',
      diff: 'easy',
      icon: '🍑',
      img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80',
      sets: '3 Sets × 20 Reps | Rest: 45s',
      steps: [
        { title: 'Lie Down', desc: 'Lie on your back, knees bent, feet flat — hip-width apart.' },
        { title: 'Arms', desc: 'Arms flat at your sides, palms facing down for stability.' },
        { title: 'Bridge Up', desc: 'Drive hips up by squeezing glutes. Body forms a straight line.' },
        { title: 'Hold & Lower', desc: 'Hold 2 seconds at top, lower slowly. Do not let hips drop fast.' },
      ]
    },
    {
      name: 'Plank Hold',
      muscle: 'Core & Shoulders',
      diff: 'easy',
      icon: '📐',
      img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80',
      sets: '3 Sets × 20–30s Hold | Rest: 45s',
      steps: [
        { title: 'Setup', desc: 'Forearms on floor, elbows directly under shoulders.' },
        { title: 'Body Line', desc: 'Keep body rigid from head to heels — no sagging hips.' },
        { title: 'Breathe', desc: 'Breathe normally. Brace abs like you\'re bracing for impact.' },
        { title: 'Progress', desc: 'Increase hold time by 5s each week as you get stronger.' },
      ]
    },
    {
      name: 'Knee Push-Up',
      muscle: 'Chest & Triceps',
      diff: 'easy',
      icon: '💪',
      img: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a73?w=500&q=80',
      sets: '3 Sets × 10 Reps | Rest: 60s',
      steps: [
        { title: 'Position', desc: 'Hands wider than shoulders, knees on floor — body straight from knees to head.' },
        { title: 'Lower', desc: 'Bend elbows to bring chest 1 inch from floor.' },
        { title: 'Push Up', desc: 'Press back up explosively. Full arm extension at top.' },
        { title: 'Progress', desc: 'When 15 reps feel easy, progress to standard push-ups.' },
      ]
    },
    {
      name: 'Mountain Climbers',
      muscle: 'Core & Cardio',
      diff: 'easy',
      icon: '🏃',
      img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80',
      sets: '3 Sets × 30s | Rest: 45s',
      steps: [
        { title: 'Start', desc: 'High plank position — hands directly under shoulders.' },
        { title: 'Drive Knee', desc: 'Drive one knee toward chest rapidly.' },
        { title: 'Alternate', desc: 'Alternate legs quickly like you\'re running in place.' },
        { title: 'Core Tight', desc: 'Keep hips level. Do not let them rise up.' },
      ]
    },
  ],
  intermediate: [
    {
      name: 'Standard Push-Up',
      muscle: 'Chest, Triceps, Core',
      diff: 'medium',
      icon: '💪',
      img: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a73?w=500&q=80',
      sets: '4 Sets × 15 Reps | Rest: 60s',
      steps: [
        { title: 'Position', desc: 'Hands slightly wider than shoulders on floor.' },
        { title: 'Body Line', desc: 'Rigid body — from head to heels. No hip sag.' },
        { title: 'Lower Slow', desc: 'Lower chest to 1 inch from ground over 3 seconds.' },
        { title: 'Explode Up', desc: 'Push explosively and fully extend arms. Squeeze chest.' },
      ]
    },
    {
      name: 'Jump Squat',
      muscle: 'Quads, Glutes, Cardio',
      diff: 'medium',
      icon: '🦵',
      img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&q=80',
      sets: '4 Sets × 12 Reps | Rest: 75s',
      steps: [
        { title: 'Squat Down', desc: 'Lower into a full squat — thighs parallel or below.' },
        { title: 'Explode', desc: 'Jump as high as possible from the bottom position.' },
        { title: 'Land Soft', desc: 'Land with soft knees to absorb impact — quiet landing.' },
        { title: 'Immediately Squat', desc: 'Go straight into next squat — no pause at top.' },
      ]
    },
    {
      name: 'Pike Push-Up',
      muscle: 'Shoulders & Triceps',
      diff: 'medium',
      icon: '🔺',
      img: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?w=500&q=80',
      sets: '3 Sets × 10 Reps | Rest: 75s',
      steps: [
        { title: 'Pike Position', desc: 'Inverted V shape — hips high, hands & feet on floor.' },
        { title: 'Lower Head', desc: 'Bend elbows and lower the top of head toward floor.' },
        { title: 'Shoulders Lead', desc: 'Feel the movement in your shoulders, not chest.' },
        { title: 'Push Up', desc: 'Push back to pike position, fully extending arms.' },
      ]
    },
    {
      name: 'Reverse Lunge',
      muscle: 'Glutes, Quads, Balance',
      diff: 'medium',
      icon: '🚶',
      img: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80',
      sets: '3 Sets × 12 Each Leg | Rest: 60s',
      steps: [
        { title: 'Stand Tall', desc: 'Start upright, hands on hips or at chest.' },
        { title: 'Step Back', desc: 'Step one foot back and lower rear knee toward floor.' },
        { title: 'Front Knee', desc: 'Front shin stays vertical — knee does not pass toes.' },
        { title: 'Return', desc: 'Push through front heel to return to start. Alternate legs.' },
      ]
    },
    {
      name: 'Tricep Dips (Chair)',
      muscle: 'Triceps & Shoulders',
      diff: 'medium',
      icon: '💺',
      img: 'https://images.unsplash.com/photo-1616803689943-5601631c7fec?w=500&q=80',
      sets: '3 Sets × 15 Reps | Rest: 60s',
      steps: [
        { title: 'Chair Setup', desc: 'Hands on edge of chair, fingers pointing forward.' },
        { title: 'Legs Extended', desc: 'Extend legs out in front. Body away from chair.' },
        { title: 'Dip Down', desc: 'Lower body by bending elbows to 90°.' },
        { title: 'Push Up', desc: 'Extend arms fully. Keep elbows pointing backward.' },
      ]
    },
    {
      name: 'Superman Hold',
      muscle: 'Lower Back & Glutes',
      diff: 'medium',
      icon: '🦸',
      img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80',
      sets: '3 Sets × 12 Reps × 3s Hold',
      steps: [
        { title: 'Lie Prone', desc: 'Lie face down, arms extended overhead on floor.' },
        { title: 'Lift Up', desc: 'Simultaneously lift arms, chest, and legs off floor.' },
        { title: 'Hold', desc: 'Hold for 3 seconds. Feel the squeeze in lower back and glutes.' },
        { title: 'Lower', desc: 'Lower slowly and repeat. Keep movements controlled.' },
      ]
    },
  ],
  advanced: [
    {
      name: 'Diamond Push-Up',
      muscle: 'Triceps & Inner Chest',
      diff: 'hard',
      icon: '💎',
      img: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a73?w=500&q=80',
      sets: '4 Sets × 12 Reps | Rest: 75s',
      steps: [
        { title: 'Hand Position', desc: 'Thumbs and index fingers form a diamond shape on floor.' },
        { title: 'Body Rigid', desc: 'Full plank position — head to heel perfectly straight.' },
        { title: 'Lower Slow', desc: 'Lower chest toward diamond over 3 seconds.' },
        { title: 'Press Up', desc: 'Extend arms fully. Triceps and inner chest fire hard.' },
      ]
    },
    {
      name: 'Pistol Squat (Assisted)',
      muscle: 'Quads, Glutes, Balance',
      diff: 'hard',
      icon: '🎯',
      img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80',
      sets: '3 Sets × 6 Each Leg | Rest: 90s',
      steps: [
        { title: 'Hold Support', desc: 'Hold a doorframe or TRX strap for balance assistance.' },
        { title: 'One Leg', desc: 'Extend one leg forward, stand on the other.' },
        { title: 'Sit Down', desc: 'Squat down on single leg as low as possible.' },
        { title: 'Drive Up', desc: 'Push through heel to stand. Less support as you improve.' },
      ]
    },
    {
      name: 'Archer Push-Up',
      muscle: 'Chest & Unilateral Strength',
      diff: 'hard',
      icon: '🏹',
      img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80',
      sets: '4 Sets × 8 Each Side | Rest: 90s',
      steps: [
        { title: 'Wide Hands', desc: 'Hands very wide — wider than a normal push-up.' },
        { title: 'Lean Left', desc: 'Shift weight to left arm, right arm extends to the side.' },
        { title: 'Lower', desc: 'Bend left elbow and lower chest toward left hand.' },
        { title: 'Push & Switch', desc: 'Push up and shift to right side. Alternate each rep.' },
      ]
    },
    {
      name: 'Burpee',
      muscle: 'Full Body + Cardio',
      diff: 'hard',
      icon: '🔥',
      img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80',
      sets: '4 Sets × 10 Reps | Rest: 90s',
      steps: [
        { title: 'Stand', desc: 'Start standing upright with feet shoulder-width.' },
        { title: 'Drop', desc: 'Squat down and place hands on floor by your feet.' },
        { title: 'Jump Back', desc: 'Jump both feet back into a push-up position.' },
        { title: 'Push-Up & Jump', desc: 'Do a push-up, then jump feet to hands, explode up into jump with arms overhead.' },
      ]
    },
    {
      name: 'L-Sit Hold',
      muscle: 'Core, Hip Flexors, Triceps',
      diff: 'hard',
      icon: '🔡',
      img: 'https://images.unsplash.com/photo-1516208813382-4a31a0b6a7e4?w=500&q=80',
      sets: '3 Sets × Max Hold | Rest: 90s',
      steps: [
        { title: 'Setup', desc: 'Use two chairs, parallel bars, or push-up handles.' },
        { title: 'Press Down', desc: 'Straighten arms and press hands into surface to lift hips.' },
        { title: 'Leg Position', desc: 'Extend legs out parallel to ground — body forms an L.' },
        { title: 'Hold', desc: 'Hold as long as possible. Tuck knees first if needed.' },
      ]
    },
    {
      name: 'Explosive Lunge Jump',
      muscle: 'Legs, Glutes, Cardio',
      diff: 'hard',
      icon: '⚡',
      img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&q=80',
      sets: '4 Sets × 10 Each Leg | Rest: 90s',
      steps: [
        { title: 'Lunge Down', desc: 'Step into a lunge — back knee near floor.' },
        { title: 'Explode', desc: 'Jump explosively from the bottom of the lunge.' },
        { title: 'Switch Mid-Air', desc: 'Switch legs in mid-air and land in opposite lunge.' },
        { title: 'Land Soft', desc: 'Absorb landing with bent knee. Immediately repeat.' },
      ]
    },
  ]
};

const hwWeeklyPlans = {
  beginner: [
    { day:'Mon', icon:'💪', focus:'Upper Body\n(Push)' },
    { day:'Tue', icon:'🧘', focus:'Rest &\nStretch', rest: true },
    { day:'Wed', icon:'🦵', focus:'Lower Body\n& Core' },
    { day:'Thu', icon:'🚶', focus:'Light Walk\n20 min', rest: true },
    { day:'Fri', icon:'💪', focus:'Full Body\nCircuit' },
    { day:'Sat', icon:'🤸', focus:'Mobility\n& Stretch', rest: true },
    { day:'Sun', icon:'😴', focus:'Full Rest\n& Recovery', rest: true },
  ],
  intermediate: [
    { day:'Mon', icon:'🏋', focus:'Push Day\nChest+Shoulders' },
    { day:'Tue', icon:'🔄', focus:'Pull Day\nBack+Biceps' },
    { day:'Wed', icon:'🦵', focus:'Leg Day\nSquat focus' },
    { day:'Thu', icon:'🏃', focus:'HIIT\n20 min', rest: true },
    { day:'Fri', icon:'💪', focus:'Full Body\nStrength' },
    { day:'Sat', icon:'🧘', focus:'Yoga &\nStretching', rest: true },
    { day:'Sun', icon:'😴', focus:'Full Rest', rest: true },
  ],
  advanced: [
    { day:'Mon', icon:'💥', focus:'Explosive\nPush' },
    { day:'Tue', icon:'🔥', focus:'Explosive\nPull' },
    { day:'Wed', icon:'⚡', focus:'Plyometric\nLegs' },
    { day:'Thu', icon:'🏃', focus:'HIIT\nSprints' },
    { day:'Fri', icon:'🎯', focus:'Skill Work\nHandstand/L-sit' },
    { day:'Sat', icon:'🧘', focus:'Mobility\nDeep stretch' },
    { day:'Sun', icon:'😴', focus:'Full Rest', rest: true },
  ]
};

let currentHwLevel = 'beginner';

function showHomeWorkout(level) {
  currentHwLevel = level;
  document.querySelectorAll('.hw-level-tabs .tab-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(level));
  });

  const workouts = homeWorkouts[level];
  document.getElementById('hw-content').innerHTML = workouts.map(w => `
    <div class="hw-card">
      <div class="hw-card-img">
        <img src="${w.img}" alt="${w.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="hw-card-img-fallback" style="display:none">${w.icon}</div>
        <span class="hw-badge ${w.diff}">${w.diff.charAt(0).toUpperCase() + w.diff.slice(1)}</span>
      </div>
      <div class="hw-card-body">
        <div class="hw-card-title">${w.icon} ${w.name}</div>
        <div class="hw-card-meta">
          <div class="hw-meta-item">🎯 <span>${w.muscle}</span></div>
        </div>
        <div class="hw-steps-header">Step-by-Step Guide</div>
        <div class="hw-steps-list">
          ${w.steps.map((s,i) => `
            <div class="hw-step">
              <div class="hw-step-num">${i+1}</div>
              <div class="hw-step-text"><strong>${s.title}:</strong> ${s.desc}</div>
            </div>`).join('')}
        </div>
        <div class="hw-sets">
          <span class="hw-sets-label">⚡ Workout Target</span>
          <span class="hw-sets-val">${w.sets}</span>
        </div>
      </div>
    </div>`).join('');

  // Update weekly plan
  const weekly = hwWeeklyPlans[level];
  document.getElementById('hw-weekly-grid').innerHTML = weekly.map(d => `
    <div class="hw-day${d.rest ? ' rest-day' : ''}">
      <div class="hw-day-name">${d.day}</div>
      <div class="hw-day-icon">${d.icon}</div>
      <div class="hw-day-focus">${d.focus.replace('\n','<br>')}</div>
    </div>`).join('');

  // Update weekly header text
  const levelText = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  document.querySelector('.hw-weekly-header p').textContent =
    `${levelText[level]} level ke liye — consistency sabse important hai!`;
}

showHomeWorkout('beginner');

/* ─────────────────────────────────────────────
   KEYBOARD ACCESSIBILITY: Enter key on inputs
───────────────────────────────────────────── */
document.querySelectorAll('input[type="number"], input[type="text"], select').forEach(el => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const section = el.closest('section');
      if (!section) return;
      const btn = section.querySelector('.btn-primary[onclick]');
      if (btn) btn.click();
    }
  });
});

/* ─────────────────────────────────────────────
   SMOOTH ACTIVE NAV LINK ON SCROLL
───────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${e.target.id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));
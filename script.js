const categories = {
  mind: { label: 'Mind', icon: '🧠', coins: 18, xp: 24, words: ['study','read','learn','coding','code','class','homework','quiz','write','research'] },
  body: { label: 'Body', icon: '💪', coins: 18, xp: 24, words: ['walk','run','gym','workout','stretch','yoga','bike','exercise','sport','water'] },
  chores: { label: 'Chores', icon: '🧼', coins: 14, xp: 18, words: ['clean','laundry','dishes','trash','organize','vacuum','room','kitchen','errand'] },
  creative: { label: 'Creative', icon: '🎨', coins: 16, xp: 22, words: ['draw','paint','crochet','music','photo','video','design','make','craft','build'] },
  social: { label: 'Social', icon: '💬', coins: 12, xp: 18, words: ['friend','family','call','text','helped','hangout','community','message'] },
  money: { label: 'Money', icon: '💸', coins: 20, xp: 20, words: ['budget','bill','paid','work','job','sell','save','finance','receipt','bank'] },
  recovery: { label: 'Recovery', icon: '🌙', coins: 10, xp: 16, words: ['rest','nap','sleep','shower','meditate','journal','break','meal','ate','relax'] },
  bonus: { label: 'Bonus', icon: '✨', coins: 8, xp: 12, words: [] }
};

const stores = [
  { id: 'foodCourt', name: 'Food Court', icon: '🍕', unlock: 0, perk: '+ snacks and small treats' },
  { id: 'arcade', name: 'Arcade', icon: '🕹️', unlock: 100, perk: 'games and screen time' },
  { id: 'bookshop', name: 'Bookshop', icon: '📚', unlock: 180, perk: 'books, learning, quiet time' },
  { id: 'gym', name: 'Fitness Shop', icon: '👟', unlock: 260, perk: 'gear and movement rewards' },
  { id: 'cinema', name: 'Cinema', icon: '🎬', unlock: 380, perk: 'movie night rewards' },
  { id: 'studio', name: 'Art Studio', icon: '🎧', unlock: 520, perk: 'creative supply rewards' },
  { id: 'tech', name: 'Tech Kiosk', icon: '💻', unlock: 700, perk: 'app, gadget, and coding rewards' },
  { id: 'rooftop', name: 'Rooftop Lounge', icon: '🌃', unlock: 900, perk: 'big weekend rewards' }
];

const rewards = [
  { name: 'Tiny Treat', cost: 60, item: '🍬 Tiny Treat Token' },
  { name: 'Coffee / Drink Run', cost: 120, item: '🧋 Drink Voucher' },
  { name: 'Game Session', cost: 180, item: '🎮 Game Pass' },
  { name: 'Craft Supply Credit', cost: 240, item: '🧶 Craft Credit' },
  { name: 'Movie Night', cost: 320, item: '🍿 Movie Ticket' },
  { name: 'Friend Adventure', cost: 450, item: '🗺️ Adventure Pass' },
  { name: 'Big Mall Haul', cost: 700, item: '🏆 Mall Haul Badge' }
];

const questPool = [
  { text: 'Log one Mind activity', cat: 'mind', reward: 35 },
  { text: 'Log one Body activity', cat: 'body', reward: 35 },
  { text: 'Log one Chores activity', cat: 'chores', reward: 30 },
  { text: 'Log one Creative activity', cat: 'creative', reward: 30 },
  { text: 'Log one Money activity', cat: 'money', reward: 40 },
  { text: 'Log one Recovery activity', cat: 'recovery', reward: 25 },
  { text: 'Log any three activities', cat: 'any3', reward: 50 }
];

const defaultState = {
  name: 'Guest Player', avatar: '🛍️', level: 1, xp: 0, coins: 0, gems: 0,
  streak: 0, tasksDone: 0, lastBonus: '', history: [], inventory: [], quests: [], completedQuests: []
};

let state = load();
const $ = (id) => document.getElementById(id);

function load() {
  const saved = localStorage.getItem('mallQuestSave');
  return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState, quests: rollQuests() };
}
function save() { localStorage.setItem('mallQuestSave', JSON.stringify(state)); }
function today() { return new Date().toISOString().slice(0, 10); }
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600); }
function xpNeed() { return state.level * 100; }
function titleForLevel() {
  if (state.level >= 10) return 'Mall Legend';
  if (state.level >= 7) return 'Rooftop Regular';
  if (state.level >= 5) return 'Quest Captain';
  if (state.level >= 3) return 'Arcade Adventurer';
  return 'Window Shopper';
}
function classify(text) {
  const lower = text.toLowerCase();
  let best = 'bonus', score = 0;
  Object.entries(categories).forEach(([key, cat]) => {
    const hits = cat.words.filter(word => lower.includes(word)).length;
    if (hits > score) { score = hits; best = key; }
  });
  return best;
}
function addXp(amount) {
  state.xp += amount;
  while (state.xp >= xpNeed()) {
    state.xp -= xpNeed();
    state.level++;
    state.gems++;
    toast(`Level up! You reached Level ${state.level} and earned 1 gem.`);
  }
}
function rollQuests() { return [...questPool].sort(() => Math.random() - .5).slice(0, 3); }
function logActivity(text) {
  if (!text.trim()) return toast('Type an activity first.');
  const catKey = classify(text);
  const cat = categories[catKey];
  const bonus = Math.min(15, Math.floor(text.length / 12));
  const coins = cat.coins + bonus;
  const xp = cat.xp + bonus;
  state.coins += coins;
  state.tasksDone++;
  addXp(xp);
  state.history.unshift({ text, category: cat.label, icon: cat.icon, coins, xp, date: new Date().toLocaleString() });
  state.history = state.history.slice(0, 20);
  checkQuests(catKey);
  save(); render();
  $('activityInput').value = '';
  toast(`${cat.icon} ${cat.label}: +${coins} coins, +${xp} XP`);
}
function checkQuests(catKey) {
  state.quests.forEach((q, i) => {
    if (state.completedQuests.includes(i)) return;
    const any3Done = q.cat === 'any3' && state.history.slice(0,3).length >= 3;
    if (q.cat === catKey || any3Done) {
      state.completedQuests.push(i);
      state.coins += q.reward;
      state.gems += 1;
      toast(`Quest complete: ${q.text}. +${q.reward} coins and +1 gem.`);
    }
  });
}
function buyReward(item) {
  if (state.coins < item.cost) return toast('Not enough coins yet.');
  state.coins -= item.cost;
  state.inventory.unshift(item.item);
  save(); render();
  toast(`Purchased: ${item.name}`);
}
function claimDaily() {
  if (state.lastBonus === today()) return toast('Daily bonus already claimed today.');
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  state.streak = state.lastBonus === yesterday ? state.streak + 1 : 1;
  state.lastBonus = today();
  const payout = 50 + state.streak * 5;
  state.coins += payout;
  addXp(20);
  save(); render();
  toast(`Daily bonus claimed: +${payout} coins. Streak: ${state.streak}`);
}
function render() {
  $('avatar').textContent = state.avatar;
  $('playerNameDisplay').textContent = state.name;
  $('playerTitle').textContent = `Level ${state.level} ${titleForLevel()}`;
  $('xpText').textContent = `${state.xp} / ${xpNeed()}`;
  $('xpBar').style.width = `${Math.min(100, (state.xp / xpNeed()) * 100)}%`;
  $('coins').textContent = state.coins;
  $('gems').textContent = state.gems;
  $('streak').textContent = state.streak;
  $('tasksDone').textContent = state.tasksDone;
  $('playerName').value = state.name;
  $('avatarSelect').value = state.avatar;

  $('quickTags').innerHTML = Object.entries(categories).map(([key, c]) => `<button class="tag" data-demo="${c.words[0] || 'bonus'} task">${c.icon} ${c.label}</button>`).join('');
  $('quickTags').querySelectorAll('.tag').forEach(b => b.onclick = () => $('activityInput').value = b.dataset.demo);

  $('questList').innerHTML = state.quests.map((q, i) => `<div class="quest ${state.completedQuests.includes(i) ? 'done' : ''}"><strong>${state.completedQuests.includes(i) ? '✅' : '⬜'} ${q.text}</strong><p>Reward: ${q.reward} coins + 1 gem</p></div>`).join('');

  const unlocked = stores.filter(s => state.coins + state.tasksDone * 10 >= s.unlock).length;
  $('mapStatus').textContent = `${unlocked} stores unlocked`;
  $('mallMap').innerHTML = stores.map(s => {
    const open = state.coins + state.tasksDone * 10 >= s.unlock;
    return `<div class="store ${open ? '' : 'locked'}"><div><div class="store-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.perk}</p></div><span class="pill">${open ? 'Open' : `Unlock ${s.unlock}`}</span></div>`;
  }).join('');

  $('shopList').innerHTML = rewards.map(r => `<div class="shop-item"><div><strong>${r.name}</strong><p>${r.item} • ${r.cost} coins</p></div><button class="button small" data-buy="${r.name}">Buy</button></div>`).join('');
  $('shopList').querySelectorAll('[data-buy]').forEach(btn => btn.onclick = () => buyReward(rewards.find(r => r.name === btn.dataset.buy)));

  $('inventory').innerHTML = state.inventory.length ? state.inventory.map(i => `<span class="badge">${i}</span>`).join('') : '<p class="hint">No items yet. Buy a reward to fill this shelf.</p>';
  $('history').innerHTML = state.history.length ? state.history.map(h => `<div class="history-item"><strong>${h.icon} ${h.category}</strong><p>${h.text}</p><small>${h.date} • +${h.coins} coins • +${h.xp} XP</small></div>`).join('') : '<p class="hint">No logs yet. Start with one small win.</p>';
}

$('logActivity').onclick = () => logActivity($('activityInput').value);
$('activityInput').addEventListener('keydown', e => { if (e.key === 'Enter') logActivity($('activityInput').value); });
$('dailyBonus').onclick = claimDaily;
$('saveProfile').onclick = () => { state.name = $('playerName').value || 'Guest Player'; state.avatar = $('avatarSelect').value; save(); render(); toast('Profile saved.'); };
$('rerollQuests').onclick = () => { state.quests = rollQuests(); state.completedQuests = []; save(); render(); toast('Daily quests rerolled.'); };
$('clearHistory').onclick = () => { state.history = []; save(); render(); };
$('exportSave').onclick = () => { $('saveBox').value = btoa(unescape(encodeURIComponent(JSON.stringify(state)))); toast('Save exported.'); };
$('importSave').onclick = () => { try { state = { ...defaultState, ...JSON.parse(decodeURIComponent(escape(atob($('saveBox').value)))) }; save(); render(); toast('Save imported.'); } catch { toast('Import failed. Check the save text.'); } };
$('resetGame').onclick = () => { if (confirm('Reset Mall Quest RPG?')) { localStorage.removeItem('mallQuestSave'); state = { ...defaultState, quests: rollQuests() }; render(); } };

render();

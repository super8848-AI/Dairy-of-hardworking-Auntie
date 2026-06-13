/* ============ 鹅腿阿姨创业日记 ============ */

const $ = (id) => document.getElementById(id);
const GITHUB_REPO = "https://github.com/super8848-AI/Dairy-of-hardworking-Auntie";

const SPEECH_THRESHOLD = 20;
const GUOMAO_THRESHOLD = 30;

const state = {
  honest: false,
  costEach: 1.5,
  priceEach: 16,
  sold: 0,
  profit: 0,
  reputation: 0,
  footTrafficMult: 1,
  location: "pku",
  guomaoSold: 0,
  skepticCount: 0,
  guomaoUnlockShown: false,
  guomaoComplete: false,
  speechUnlockShown: false,
  noRegretUnlockShown: false,
  selling: false,
  inSkepticScene: false,
  achievements: [],
};

const ACHIEVEMENTS = {
  speech: {
    id: "speech",
    title: "北大演讲",
    desc: "卖出 20 根鹅腿，受邀北大演讲，同学开始排队",
    threshold: SPEECH_THRESHOLD,
  },
  guomao: {
    id: "guomao",
    title: "国贸副本",
    desc: "卖出 30 根后进军国贸 CBD",
  },
  noRegret: {
    id: "noRegret",
    title: "我没有对不起任何人",
    desc: "国贸质疑三连后匆忙逃走",
  },
};

const CART_HTML = `
  <div class="cart-rig">
    <div class="canopy"></div>
    <div class="box"></div>
    <div class="frame"></div>
    <div class="auntie">
      <div class="a-hair"></div>
      <div class="a-face"></div>
      <div class="a-smile"></div>
      <div class="a-body"></div>
      <div class="a-apron"></div>
      <div class="a-arm"></div>
      <div class="a-leg"></div>
      <div class="a-leg back"></div>
    </div>
    <div class="wheel w1"></div>
    <div class="wheel w2"></div>
    <div class="wheel w3"></div>
  </div>`;

["title-cart", "sell-cart"].forEach((id) => ($(id).innerHTML = CART_HTML));

const VAN_HTML = `
  <div class="van-rig">
    <div class="van-body">
      <div class="van-cab">
        <div class="van-window"></div>
        <div class="auntie van-driver">
          <div class="a-hair"></div>
          <div class="a-face"></div>
          <div class="a-smile"></div>
          <div class="a-body"></div>
        </div>
      </div>
      <div class="van-cargo">
        <span>冻腿</span>
        <span class="van-cargo-tag">× 一车</span>
      </div>
    </div>
    <div class="van-wheel w1"></div>
    <div class="van-wheel w2"></div>
  </div>`;

function showScene(id) {
  document.querySelectorAll(".scene").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function showModal(title, body, actions) {
  $("modal-title").textContent = title;
  $("modal-body").innerHTML = body;
  const box = $("modal-actions");
  box.innerHTML = "";
  actions.forEach(({ label, ghost, onClick }) => {
    const b = document.createElement("button");
    b.className = "btn" + (ghost ? " btn-ghost" : "");
    b.textContent = label;
    b.onclick = () => {
      $("modal").classList.add("hidden");
      onClick && onClick();
    };
    box.appendChild(b);
  });
  $("modal").classList.remove("hidden");
}

function updateBoard() {
  $("profit").textContent = state.profit.toFixed(1);
  $("sold-count").textContent = state.sold;
  $("cost-each").textContent = state.costEach;
  $("reputation").textContent = state.reputation.toLocaleString();
  $("foot-traffic").textContent = Math.round(state.footTrafficMult * 100) + "%";
  renderAchievements();
  const m = document.querySelector(".board-money");
  m.classList.remove("bump");
  void m.offsetWidth;
  m.classList.add("bump");
}

function renderAchievements() {
  const box = $("achievement-list");
  if (!state.achievements.length) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = state.achievements
    .map((a) => `<span class="ach-badge" title="${a.desc}">🏅 ${a.title}</span>`)
    .join("");
}

function unlockAchievement(key) {
  const ach = ACHIEVEMENTS[key];
  if (!ach || state.achievements.some((a) => a.id === ach.id)) return;
  state.achievements.push(ach);
  renderAchievements();
}

function trafficDelay(ms) {
  return Math.max(180, Math.round(ms / state.footTrafficMult));
}

function hideSellButtons() {
  $("btn-sell").classList.add("hidden");
  $("btn-sell").disabled = true;
  $("btn-deflect").classList.add("hidden");
  $("btn-deflect").disabled = true;
}

function say(bubbleId, name, text) {
  const b = $(bubbleId);
  b.innerHTML = `<span class="b-name">${name}</span>${text}`;
  b.classList.remove("hidden");
}

function hideBubbles() {
  ["bubble-student", "bubble-auntie", "bubble-think", "bubble-skeptic"].forEach((id) =>
    $(id).classList.add("hidden")
  );
}

function playPaymentFeedback(gain) {
  GameAudio.playCash();
  GameAudio.playCoin();

  const flash = $("pay-flash");
  flash.classList.remove("active");
  void flash.offsetWidth;
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 400);

  const game = $("game");
  game.classList.remove("pay-shake");
  void game.offsetWidth;
  game.classList.add("pay-shake");
  setTimeout(() => game.classList.remove("pay-shake"), 300);

  const btn = $("btn-sell");
  btn.classList.remove("selling-pop");
  void btn.offsetWidth;
  btn.classList.add("selling-pop");

  burstCoins();
  floatMoney(gain);
}

function burstCoins() {
  const layer = $("coin-burst");
  const rect = $("btn-sell").getBoundingClientRect();
  const gameRect = $("game").getBoundingClientRect();
  const ox = rect.left + rect.width / 2 - gameRect.left;
  const oy = rect.top - gameRect.top;

  for (let i = 0; i < 8; i++) {
    const c = document.createElement("div");
    c.className = "coin-particle";
    c.style.left = ox + "px";
    c.style.top = oy + "px";
    const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 50;
    c.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    c.style.setProperty("--dy", Math.sin(angle) * dist - 30 + "px");
    layer.appendChild(c);
    setTimeout(() => c.remove(), 750);
  }
}

function floatMoney(gain) {
  const el = document.createElement("div");
  el.className = "float-money";
  el.textContent = gain > 0 ? `+¥${gain.toFixed(1)}` : "+¥0.0（图个心安）";
  if (gain <= 0) el.style.color = "#bdb4d6";
  el.style.left = 30 + Math.random() * 30 + "%";
  el.style.bottom = "42%";
  $("float-layer").appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

$("btn-audio").onclick = () => {
  const muted = GameAudio.toggleMute();
  $("btn-audio").textContent = muted ? "🔇" : "🔊";
  $("btn-audio").classList.toggle("muted", muted);
};

$("btn-start").onclick = () => {
  GameAudio.resume();
  showScene("scene-market");
};

function setMarketDialog(speaker, text) {
  $("market-dialog").querySelector(".dialog-speaker").textContent = speaker;
  $("market-dialog").querySelector(".dialog-text").textContent = text;
}

$("pick-duck").onclick = () => {
  showModal(
    "进货确认",
    "冷冻鸭腿 <b>¥1.5/根</b>。<br>滚揉一下、卤一卤，膨胀之后……谁分得清是鸭是鹅？",
    [
      {
        label: "就它了，进货！",
        onClick: () => {
          state.honest = false;
          state.costEach = 1.5;
          setMarketDialog("鹅腿阿姨", "鸭腿才1.5一根，卖16……这账，越算越香。");
          setTimeout(() => startRide("home"), 1400);
        },
      },
      { label: "再想想", ghost: true },
    ]
  );
};

$("pick-goose").onclick = () => {
  showModal(
    "灵魂拷问",
    "你确定购买<b>正品鹅腿</b>吗？<br>这会让鸭腿太子买不起朝阳区别野！",
    [
      {
        label: "我要做良心阿姨",
        onClick: () => {
          state.honest = true;
          state.costEach = 15;
          setMarketDialog("鹅腿阿姨", "正品鹅腿15一根，卖16……图啥呢？图个心安吧。");
          setTimeout(() => startRide("home"), 1400);
        },
      },
      {
        label: "算了，还是鸭腿吧",
        ghost: true,
        onClick: () => {
          setMarketDialog("鹅腿阿姨", "嗯，朝阳区别野要紧。还是看看鸭腿吧……");
        },
      },
    ]
  );
};

function startRide(dest) {
  showScene("scene-ride");
  const cart = $("ride-cart");
  const isHome = dest === "home";
  const toGuomao = dest === "guomao";
  cart.innerHTML = isHome ? VAN_HTML : CART_HTML;
  const rig = cart.querySelector(isHome ? ".van-rig" : ".cart-rig");
  if (toGuomao) {
    $("ride-label").textContent = "🚲 收摊转场，蹬着三轮车杀向国贸 CBD……";
  } else {
    $("ride-label").textContent = isHome
      ? "🚐 开着面包车，把一车冻腿驮回昌平区小别野……"
      : "🚲 夜幕降临，蹬着三轮车赶往北京大学西南门……";
  }
  cart.classList.remove("go");
  void cart.offsetWidth;
  rig.classList.add(isHome ? "driving" : "pedaling");
  cart.classList.add("go");
  setTimeout(() => {
    rig.classList.remove(isHome ? "driving" : "pedaling");
    if (isHome) enterKitchen();
    else if (toGuomao) enterGuomao();
    else enterSell("pku");
  }, 4600);
}

const PROCESS_STEPS = [
  {
    title: "解冻 + 真空滚揉",
    desc: "冻腿扔进真空滚揉机，咕噜咕噜转上俩小时——肉质松了，盐水「咕咚咕咚」全吸进去。一根腿，先胖一圈。",
    duration: 3000,
    apply: () => $("machine").classList.add("running"),
    finish: (leg) => {
      $("machine").classList.remove("running");
      leg.style.transform = "scale(1.15)";
    },
  },
  {
    title: "老卤卤制",
    desc: "下锅卤制，记得加葱——葱香一飘，卤前吸盐水、卤后吸汤汁，里里外外喝得饱饱的。颜色一上，香味一出，气质立马不一样了。",
    duration: 3000,
    apply: () => {
      $("pot").classList.remove("hidden");
      $("machine").classList.add("hidden");
    },
    finish: (leg) => {
      leg.classList.add("cooked");
      leg.style.transform = "scale(1.3)";
    },
  },
  {
    title: "出锅定型",
    desc: "成品比生鸭腿足足膨胀 20%~50%，肥大油亮，往灯下一摆——「这么大，肯定是鹅腿！」",
    duration: 2600,
    apply: () => {},
    finish: (leg) => {
      leg.classList.add("swollen");
      if (!state.honest) leg.classList.add("greenish");
    },
  },
];

let stepIndex = 0;

function enterKitchen() {
  showScene("scene-kitchen");
  stepIndex = 0;
  if (state.honest) {
    PROCESS_STEPS[2].desc =
      "正品鹅腿本来就大，老老实实卤熟就行。阿姨看着锅，心里有点空：这锅……一分钱不赚啊。";
  }
  loadStep();
}

function loadStep() {
  const step = PROCESS_STEPS[stepIndex];
  $("process-step").textContent = `第 ${stepIndex + 1} 步 / 共 ${PROCESS_STEPS.length} 步`;
  $("process-title").textContent = step.title;
  $("process-desc").textContent = step.desc;
  $("progress-fill").style.width = "0%";
  $("btn-process").disabled = false;
  $("btn-process").textContent = stepIndex === 0 ? "开始加工" : "下一步";
}

$("btn-process").onclick = () => {
  const step = PROCESS_STEPS[stepIndex];
  const btn = $("btn-process");
  const leg = $("bench-leg");
  btn.disabled = true;
  btn.textContent = "加工中…";
  step.apply(leg);

  const start = performance.now();
  (function tick(now) {
    const p = Math.min(1, (now - start) / step.duration);
    $("progress-fill").style.width = (p * 100).toFixed(1) + "%";
    if (p < 1) return requestAnimationFrame(tick);
    step.finish(leg);
    stepIndex++;
    if (stepIndex < PROCESS_STEPS.length) {
      setTimeout(loadStep, 700);
    } else {
      btn.textContent = "出摊！";
      btn.disabled = false;
      btn.onclick = () => {
        btn.onclick = null;
        $("btn-process").onclick = null;
        startRide("pku");
      };
    }
  })(performance.now());
};

const STUDENTS = [
  { name: "男同学", hair: "short", color: "#3f6fb5", ask: "阿姨，来根鹅腿！跑完晚自习就馋这口。" },
  { name: "女同学", hair: "long", color: "#c75b8a", ask: "阿姨~ 还有鹅腿吗？给我留一根！" },
  { name: "考研学长", hair: "short", color: "#4a8c5f", ask: "阿姨，一根鹅腿，今晚还要刷三套题。" },
  { name: "社团学妹", hair: "long", color: "#8a6fc7", ask: "阿姨，听说你家鹅腿全北大第一！" },
  { name: "留学生", hair: "short", color: "#c2762e", ask: "Auntie！Goose leg！One！谢谢！" },
];

const WHITE_COLLARS = [
  { name: "投行小哥", color: "#1a2530", tie: "#c0392b", ask: "阿姨，加班饿了，来根鹅腿续命！" },
  { name: "律所姐姐", color: "#2c3e50", tie: "#8e44ad", ask: "国贸楼下就你家最香，给我一根。" },
  { name: "四大审计", color: "#34495e", tie: "#2980b9", ask: "刚下班，16块一根不算贵吧？" },
  { name: "互联网PM", color: "#1e272e", tie: "#27ae60", ask: "阿姨，鹅腿还有吗？我要带回去当夜宵。" },
  { name: "咨询顾问", color: "#2d3436", tie: "#d35400", ask: "CBD 白领的晚餐，就指望这根腿了。" },
];

const SKEPTIC_QUESTIONS = [
  "等等……这腿怎么看着像鸭腿？你这不是骗我们白领吗？",
  "我查过了，附近根本没有养鹅场。你这「鹅腿」哪来的？",
  "这颜色……这大小……阿姨，你该不会把鸭腿当鹅腿卖吧？",
  "16块一根鹅腿？便宜得离谱！是不是有问题？",
];

const DEFLECT_EXCUSES = [
  "这是<b>蒙古草原</b>运来的大鹅，你们CBD没见过的！",
  "我们加了<b>独家老卤</b>，鸭……不对，鹅腿会膨胀，看着大！",
  "年轻人别瞎说，阿姨在北大西南门卖了这么多年，<b>口碑</b>在这呢！",
  "这是<b>有机蔬菜汁</b>腌过的，颜色深一点正常！",
];

const AUNTIE_REPLIES = [
  "好嘞！刚出锅的「鹅腿」，又肥又大！",
  "拿好咯，趁热吃，凉了就不香了！",
  "慢用啊，扫码现金都行！",
  "一根16，白领也要补充蛋白质嘛！",
];

const THOUGHTS = [
  "一天卖1000根，一根赚14.5，就是14500……",
  "一年上四休三，干208天，一共300万！",
  "300万……儿子的路虎，稳了。",
];

const GUOMAO_THOUGHTS = [
  "国贸白领月薪三千，花16买腿……他们也不容易。",
  "写字楼里飘的全是卤味，阿姨就是CBD最靓的摊。",
  "再卖几根，别野的月供就有着落了……",
];

let greenAsked = false;
let thoughtIndex = 0;

function enablePkuQueue() {
  $("game").classList.add("pku-queue-active");
  updateStudentQueue();
}

function updateStudentQueue() {
  const q = $("student-queue");
  if (!state.speechUnlockShown || state.location !== "pku") {
    q.classList.add("hidden");
    q.innerHTML = "";
    return;
  }
  q.classList.remove("hidden");
  const colors = ["#3f6fb5", "#c75b8a", "#4a8c5f", "#8a6fc7", "#c2762e", "#d8506b"];
  q.innerHTML = colors
    .map(
      (c, i) =>
        `<div class="queue-student" style="--s-color:${c};--q-i:${i}"><div class="qs-body"></div><div class="qs-head"></div></div>`
    )
    .join("");
}

function setLocation(loc) {
  state.location = loc;
  $("game").classList.toggle("location-guomao", loc === "guomao");
  $("pku-gate").classList.toggle("hidden", loc === "guomao");
  $("guomao-cbd").classList.toggle("hidden", loc !== "guomao");
  updateStudentQueue();
  const label = $("sell-location-label");
  if (loc === "guomao") {
    label.textContent = "🏙️ 午间 12:00 · 国贸 CBD 写字楼群下";
    label.classList.remove("hidden");
  } else {
    label.classList.add("hidden");
  }
}

function enterSell(loc = "pku") {
  setLocation(loc);
  showScene("scene-sell");
  $("scoreboard").classList.remove("hidden");
  $("sell-cart").classList.remove("fleeing");
  updateBoard();
  state.selling = true;
  state.inSkepticScene = false;
  hideSellButtons();
  setTimeout(nextCustomer, trafficDelay(1200));
}

function enterGuomao() {
  unlockAchievement("guomao");
  enterSell("guomao");
}

function makeStudent(s) {
  const spot = $("student-spot");
  spot.innerHTML = `
    <div class="student" style="--s-color:${s.color}">
      <div class="s-hair ${s.hair === "long" ? "long" : ""}"></div>
      <div class="s-face"></div>
      <div class="s-bag"></div>
      <div class="s-body"></div>
      <div class="s-legs"></div>
    </div>`;
  return spot.firstElementChild;
}

function makeWorker(w, skeptic = false) {
  const spot = $("student-spot");
  spot.innerHTML = `
    <div class="worker${skeptic ? " skeptic" : ""}" style="--w-color:${w.color};--tie-color:${w.tie}">
      <div class="w-hair"></div>
      <div class="w-face"></div>
      <div class="w-suit"></div>
      <div class="w-tie"></div>
      <div class="w-briefcase"></div>
      <div class="w-legs"></div>
    </div>`;
  return spot.firstElementChild;
}

function removeCustomer() {
  const el = $("student-spot").querySelector(".student, .worker");
  if (el) setTimeout(() => el.classList.add("leave"), 400);
}

function completeSale() {
  const gain = state.priceEach - state.costEach;
  state.sold++;
  state.profit = +(state.profit + gain).toFixed(1);
  if (state.location === "guomao") state.guomaoSold++;
  updateBoard();
  playPaymentFeedback(gain);
  hideBubbles();
  say("bubble-auntie", "鹅腿阿姨", AUNTIE_REPLIES[Math.floor(Math.random() * AUNTIE_REPLIES.length)]);
  removeCustomer();
}

function scheduleNextAfterThought() {
  const thoughts = state.location === "guomao" ? GUOMAO_THOUGHTS : THOUGHTS;
  const t =
    state.honest && state.location === "pku"
      ? "良心是无价的……但路虎，是有价的。"
      : thoughts[thoughtIndex % thoughts.length];
  thoughtIndex++;
  setTimeout(() => {
    hideBubbles();
    say("bubble-think", "阿姨的内心戏", t);
    setTimeout(nextCustomer, trafficDelay(2400));
  }, trafficDelay(1500));
}

function nextCustomer() {
  if (!state.selling || state.inSkepticScene) return;
  hideBubbles();
  hideSellButtons();

  if (state.location === "pku") {
    if (state.sold >= SPEECH_THRESHOLD && !state.speechUnlockShown) {
      state.speechUnlockShown = true;
      showSpeechEvent();
      return;
    }
    if (state.sold >= GUOMAO_THRESHOLD && !state.guomaoUnlockShown) {
      state.guomaoUnlockShown = true;
      showGuomaoUnlock();
      return;
    }
  }

  if (state.location === "guomao" && !state.guomaoComplete) {
    if (state.skepticCount < 3 && Math.random() < 0.38) {
      startSkepticScene();
      return;
    }
  }

  if (state.location === "guomao") {
    const w = WHITE_COLLARS[Math.floor(Math.random() * WHITE_COLLARS.length)];
    makeWorker(w);
    setTimeout(() => {
      say("bubble-student", w.name, w.ask);
      $("btn-sell").classList.remove("hidden");
      $("btn-sell").disabled = false;
    }, trafficDelay(900));
    return;
  }

  const s = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
  makeStudent(s);
  if (state.speechUnlockShown) updateStudentQueue();

  if (!state.honest && !greenAsked && state.sold === 2) {
    greenAsked = true;
    playGreenScene();
    return;
  }

  setTimeout(() => {
    const ask =
      state.speechUnlockShown && Math.random() < 0.5
        ? "阿姨！我排好久了，快给我一根鹅腿！"
        : s.ask;
    say("bubble-student", s.name, ask);
    $("btn-sell").classList.remove("hidden");
    $("btn-sell").disabled = false;
  }, trafficDelay(900));
}

function playGreenScene() {
  setTimeout(() => {
    say("bubble-student", "女同学", "咦？阿姨……怎么这鹅腿是<b>绿色</b>的呀？");
    setTimeout(() => {
      say("bubble-auntie", "鹅腿阿姨", "用蔬菜汁腌的，纯天然！吃了还补维生素呢！");
      setTimeout(() => {
        say("bubble-student", "女同学", "哦哦，谢谢阿姨！");
        $("btn-sell").classList.remove("hidden");
        $("btn-sell").disabled = false;
      }, trafficDelay(1800));
    }, trafficDelay(1600));
  }, trafficDelay(900));
}

function startSkepticScene() {
  state.inSkepticScene = true;
  hideSellButtons();
  const w = WHITE_COLLARS[Math.floor(Math.random() * WHITE_COLLARS.length)];
  makeWorker(w, true);
  const q = SKEPTIC_QUESTIONS[state.skepticCount % SKEPTIC_QUESTIONS.length];

  setTimeout(() => {
    say("bubble-skeptic", "质疑的路人", q);
    setTimeout(() => {
      $("btn-deflect").classList.remove("hidden");
      $("btn-deflect").disabled = false;
    }, trafficDelay(700));
  }, trafficDelay(800));
}

$("btn-deflect").onclick = () => {
  if ($("btn-deflect").disabled) return;
  $("btn-deflect").disabled = true;
  $("btn-deflect").classList.add("hidden");
  state.skepticCount++;

  const excuse = DEFLECT_EXCUSES[(state.skepticCount - 1) % DEFLECT_EXCUSES.length];
  say("bubble-auntie", "鹅腿阿姨", excuse);

  if (state.skepticCount >= 3) {
    setTimeout(() => playCaughtScene(), trafficDelay(1800));
    return;
  }

  setTimeout(() => {
    say("bubble-skeptic", "质疑的路人", "哼……行吧，这次算你过关。");
    setTimeout(() => {
      state.inSkepticScene = false;
      hideBubbles();
      $("btn-sell").classList.remove("hidden");
      $("btn-sell").disabled = false;
      say("bubble-student", "排队白领", "阿姨别理他，我要一根！");
    }, trafficDelay(1400));
  }, trafficDelay(1600));
};

function playCaughtScene() {
  GameAudio.playExpose();
  hideSellButtons();

  setTimeout(() => {
    say("bubble-skeptic", "火眼金睛白领", "我拍下来了！这就是<b>鸭腿</b>！大家别买！");
    setTimeout(() => {
      say("bubble-auntie", "鹅腿阿姨", "……收摊！收摊！！");
      setTimeout(fleeGuomao, trafficDelay(1200));
    }, trafficDelay(1500));
  }, trafficDelay(800));
}

function fleeGuomao() {
  state.selling = false;
  state.guomaoComplete = true;
  state.inSkepticScene = false;
  GameAudio.playFlee();
  hideBubbles();
  hideSellButtons();
  $("student-spot").innerHTML = "";
  $("sell-cart").classList.add("fleeing");

  setTimeout(() => {
    unlockAchievement("noRegret");
    showNoRegretUnlock();
  }, 2400);
}

$("btn-sell").onclick = () => {
  if ($("btn-sell").disabled) return;
  $("btn-sell").disabled = true;
  completeSale();
  hideSellButtons();

  if (state.sold % 2 === 0) {
    scheduleNextAfterThought();
  } else {
    setTimeout(nextCustomer, trafficDelay(1900));
  }
};

function showSpeechEvent() {
  state.reputation += 10000;
  state.footTrafficMult = 11;
  unlockAchievement("speech");
  enablePkuQueue();
  updateBoard();

  const summary = state.honest
    ? `你卖出了 <b>${SPEECH_THRESHOLD} 根正品鹅腿</b>，北大同学联名邀请阿姨进校演讲。<br>「良心摊主」的故事传遍未名湖畔——虽然路虎还是没着落。`
    : `你卖出了 <b>${SPEECH_THRESHOLD} 根「鹅腿」</b>，北大同学排队求阿姨分享创业心得。<br>阿姨站在讲台上，台下掌声雷动：「一根鸭腿，也能卤出鹅腿的人生！」`;

  showModal(
    "🏆 成就解锁：北大演讲",
    summary +
      `<br><br><b style="color:#9e2b2b">声望值 +10,000</b>（当前 <b>${state.reputation.toLocaleString()}</b>）<br>` +
      `<b style="color:#2e7d44">人流量 +1000%</b>（当前 <b>${Math.round(state.footTrafficMult * 100)}%</b>）<br><br>` +
      `<span style="font-size:13px;color:#6b5b3e">演讲结束，西南门外买「鹅腿」的同学排起了长队……</span>`,
    [
      { label: "继续摆摊，趁热打铁", onClick: () => setTimeout(nextCustomer, trafficDelay(800)) },
      { label: "重新开始", ghost: true, onClick: () => location.reload() },
    ]
  );
}

function showGuomaoUnlock() {
  const summary = state.honest
    ? `你卖出了 <b>${GUOMAO_THRESHOLD} 根正品鹅腿</b>，收益 <b>¥${state.profit.toFixed(1)}</b>。<br>阿姨一咬牙：北大赚不够路虎，去国贸碰碰运气！`
    : `你卖出了 <b>${GUOMAO_THRESHOLD} 根「鹅腿」</b>，净赚 <b>¥${state.profit.toFixed(1)}</b>。<br>北大西南门已饱和——下一站，月薪三千的白领！`;

  showModal(
    "🎉 解锁新副本：国贸",
    summary +
      `<br><br><b style="font-size:18px;color:#2c3e50">背景切换为写字楼群，顾客变为白领。</b><br>` +
      `<span style="font-size:13px;color:#8a7a5c">小心随机出现的质疑者——阿姨只能搪塞两次，第三次就得跑！</span>`,
    [
      { label: "杀向国贸 CBD！", onClick: () => startRide("guomao") },
      { label: "先在北大再卖会儿", onClick: () => setTimeout(nextCustomer, trafficDelay(800)) },
      {
        label: "⭐ GitHub 点 Star",
        ghost: true,
        onClick: () => window.open(GITHUB_REPO, "_blank", "noopener,noreferrer"),
      },
    ]
  );
}

function showNoRegretUnlock() {
  if (state.noRegretUnlockShown) return;
  state.noRegretUnlockShown = true;

  showModal(
    "🏆 解锁新副本：我没有对不起任何人",
    `阿姨推着三轮车消失在国贸地铁口，卤味还飘在写字楼间。<br><br>` +
      `三轮搪塞，终究纸包不住火。可阿姨回头望了一眼 CBD 的灯火，喃喃自语：<br>` +
      `<b style="font-size:20px;color:#9e2b2b">「我没有对不起任何人。」</b><br><br>` +
      `<span style="font-size:13px;color:#8a7a5c">新章节敬请期待——阿姨的下一摊，会在哪里？</span><br><br>` +
      `<span style="font-size:14px;color:#6b5b3e">⭐ 玩得开心？去 GitHub 点 Star：</span><br>` +
      `<a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer" style="color:#9e2b2b;font-size:13px;word-break:break-all">${GITHUB_REPO}</a>`,
    [
      {
        label: "回北大继续卖",
        onClick: () => {
          state.selling = true;
          state.inSkepticScene = false;
          $("sell-cart").classList.remove("fleeing");
          setLocation("pku");
          setTimeout(nextCustomer, trafficDelay(800));
        },
      },
      {
        label: "⭐ GitHub 点 Star",
        ghost: true,
        onClick: () => window.open(GITHUB_REPO, "_blank", "noopener,noreferrer"),
      },
      { label: "重新开始", ghost: true, onClick: () => location.reload() },
    ]
  );
}

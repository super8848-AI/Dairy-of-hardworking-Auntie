/* ============ 鹅腿阿姨创业日记 ============ */

const $ = (id) => document.getElementById(id);
const GITHUB_REPO = "https://github.com/super8848-AI/Dairy-of-hardworking-Auntie";

const state = {
  honest: false,      // 是否买了正品鹅腿
  costEach: 1.5,
  priceEach: 16,
  sold: 0,
  profit: 0,
  unlockShown: false,
  selling: false,
};

/* ---------- 阿姨三轮车（注入三个场景） ---------- */
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

["title-cart", "ride-cart", "sell-cart"].forEach((id) => ($(id).innerHTML = CART_HTML));

/* ---------- 场景切换 ---------- */
function showScene(id) {
  document.querySelectorAll(".scene").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
  $("game").classList.toggle("is-title", id === "scene-title");
  $("game").classList.toggle("is-playing", id !== "scene-title");
}

/* ---------- 弹窗 ---------- */
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

/* ---------- 计分板 ---------- */
function updateBoard() {
  $("profit").textContent = state.profit.toFixed(1);
  $("sold-count").textContent = state.sold;
  $("cost-each").textContent = state.costEach;
  const m = document.querySelector(".board-money");
  m.classList.remove("bump");
  void m.offsetWidth;
  m.classList.add("bump");
}

/* ================= 1. 标题 ================= */
$("btn-start").onclick = () => showScene("scene-market");

/* ================= 2. 菜市场 ================= */
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
    "你确定购买<b>正品鹅腿</b>吗？<br>这会让鸭腿太子买不起别野！",
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
          setMarketDialog("鹅腿阿姨", "嗯，别野要紧。还是看看鸭腿吧……");
        },
      },
    ]
  );
};

/* ================= 3. 骑车动画 ================= */
function startRide(dest) {
  showScene("scene-ride");
  const cart = $("ride-cart");
  const rig = cart.querySelector(".cart-rig");
  $("ride-label").textContent =
    dest === "home" ? "🚲 蹬着三轮车，把一车冻腿驮回出租屋……" : "🚲 夜幕降临，蹬车赶往北京大学东南门……";
  cart.classList.remove("go");
  void cart.offsetWidth;
  rig.classList.add("pedaling");
  cart.classList.add("go");
  setTimeout(() => {
    rig.classList.remove("pedaling");
    if (dest === "home") enterKitchen();
    else enterSell();
  }, 4600);
}

/* ================= 4. 厨房加工 ================= */
const PROCESS_STEPS = [
  {
    title: "解冻 + 真空滚揉",
    desc: "冻腿扔进真空滚揉机，咕噜咕噜转上俩小时——肉质松了，盐水「咕咚咕咚」全吸进去。一根腿，先胖一圈。",
    duration: 3000,
    apply: (leg) => {
      $("machine").classList.add("running");
    },
    finish: (leg) => {
      $("machine").classList.remove("running");
      leg.style.transform = "scale(1.15)";
    },
  },
  {
    title: "老卤卤制",
    desc: "下锅卤制，卤前吸盐水、卤后吸汤汁，里里外外喝得饱饱的。颜色一上，香味一出，气质立马不一样了。",
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
    // 良心模式：正品鹅腿不用造假，但阿姨还是要卤
    PROCESS_STEPS[2].desc = "正品鹅腿本来就大，老老实实卤熟就行。阿姨看着锅，心里有点空：这锅……一分钱不赚啊。";
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

/* ================= 5. 北大门口售卖 ================= */

const STUDENTS = [
  { name: "男同学", hair: "short", color: "#3f6fb5", ask: "阿姨，来根鹅腿！跑完晚自习就馋这口。" },
  { name: "女同学", hair: "long", color: "#c75b8a", ask: "阿姨~ 还有鹅腿吗？给我留一根！" },
  { name: "考研学长", hair: "short", color: "#4a8c5f", ask: "阿姨，一根鹅腿，今晚还要刷三套题。" },
  { name: "社团学妹", hair: "long", color: "#8a6fc7", ask: "阿姨，听说你家鹅腿全北大第一！" },
  { name: "留学生", hair: "short", color: "#c2762e", ask: "Auntie！Goose leg！One！谢谢！" },
];

const AUNTIE_REPLIES = [
  "好嘞！刚出锅的「鹅腿」，又肥又大！",
  "拿好咯，趁热吃，凉了就不香了！",
  "同学慢用啊，明天还来这个点儿！",
  "一根16，扫码现金都行！",
];

const THOUGHTS = [
  "一天卖1000根，一根赚14.5，就是14500……",
  "一年上四休三，干208天，一共300万！",
  "300万……儿子的路虎，稳了。",
];

let customerTimer = null;
let greenAsked = false;
let thoughtIndex = 0;

function enterSell() {
  showScene("scene-sell");
  $("scoreboard").classList.remove("hidden");
  updateBoard();
  state.selling = true;
  setTimeout(nextCustomer, 1200);
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

function say(bubbleId, name, text) {
  const b = $(bubbleId);
  b.innerHTML = `<span class="b-name">${name}</span>${text}`;
  b.classList.remove("hidden");
}
function hideBubbles() {
  ["bubble-student", "bubble-auntie", "bubble-think"].forEach((id) => $(id).classList.add("hidden"));
}

function nextCustomer() {
  if (!state.selling) return;
  hideBubbles();

  // 卖出10根 → 解锁国贸副本
  if (state.sold >= 10 && !state.unlockShown) {
    state.unlockShown = true;
    showUnlock();
    return;
  }

  const s = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
  makeStudent(s);

  // 第3位顾客触发「绿色鹅腿」剧情（仅鸭腿模式）
  if (!state.honest && !greenAsked && state.sold === 2) {
    greenAsked = true;
    playGreenScene();
    return;
  }

  setTimeout(() => {
    say("bubble-student", s.name, s.ask);
    $("btn-sell").classList.remove("hidden");
    $("btn-sell").disabled = false;
  }, 900);
}

function playGreenScene() {
  setTimeout(() => {
    say("bubble-student", "女同学", "咦？阿姨……怎么这鹅腿是<b>绿色</b>的呀？");
    setTimeout(() => {
      say("bubble-auntie", "鹅腿阿姨", "用蔬菜汁腌的，纯天然！吃了还补维生素呢！");
      setTimeout(() => {
        say("bubble-student", "女同学", "哦哦，写写阿姨！");
        $("btn-sell").classList.remove("hidden");
        $("btn-sell").disabled = false;
      }, 1800);
    }, 1600);
  }, 900);
}

$("btn-sell").onclick = () => {
  if ($("btn-sell").disabled) return;
  $("btn-sell").disabled = true;
  $("btn-sell").classList.add("hidden");

  const gain = state.priceEach - state.costEach;
  state.sold++;
  state.profit = +(state.profit + gain).toFixed(1);
  updateBoard();
  floatMoney(gain);

  hideBubbles();
  say("bubble-auntie", "鹅腿阿姨", AUNTIE_REPLIES[Math.floor(Math.random() * AUNTIE_REPLIES.length)]);

  const stu = $("student-spot").querySelector(".student");
  if (stu) setTimeout(() => stu.classList.add("leave"), 700);

  // 每卖2根，阿姨来一段内心戏
  if (state.sold % 2 === 0) {
    setTimeout(() => {
      hideBubbles();
      const t = state.honest
        ? "良心是无价的……但路虎，是有价的。"
        : THOUGHTS[thoughtIndex % THOUGHTS.length];
      thoughtIndex++;
      say("bubble-think", "阿姨的内心戏", t);
      setTimeout(nextCustomer, 2400);
    }, 1500);
  } else {
    setTimeout(nextCustomer, 1900);
  }
};

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

function showUnlock() {
  const summary = state.honest
    ? `你卖出了 10 根<b>正品鹅腿</b>，收益 <b>¥${state.profit.toFixed(1)}</b>。<br>阿姨叹了口气：良心摊主，路虎还是买不起，但睡得着觉。`
    : `你卖出了 10 根「鹅腿」，净赚 <b>¥${state.profit.toFixed(1)}</b>。<br>按这个速度，路虎的车钥匙已经在路上了……`;
  showModal(
    "🎉 解锁新副本：国贸",
    summary + `<br><br><b style="font-size:20px">新游戏副本，敬请期待</b><br><span style="font-size:13px;color:#8a7a5c">下一站：把鹅腿卖给月薪三千的白领</span><br><br><span style="font-size:14px;color:#6b5b3e">⭐ 玩得开心？去 GitHub 点 Star：</span><br><a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer" style="color:#9e2b2b;font-size:13px;word-break:break-all">${GITHUB_REPO}</a>`,
    [
      {
        label: "继续在北大卖",
        onClick: () => setTimeout(nextCustomer, 800),
      },
      {
        label: "⭐ GitHub 点 Star",
        ghost: true,
        onClick: () => window.open(GITHUB_REPO, "_blank", "noopener,noreferrer"),
      },
      {
        label: "重新开始",
        ghost: true,
        onClick: () => location.reload(),
      },
    ]
  );
}

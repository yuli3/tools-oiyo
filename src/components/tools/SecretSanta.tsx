// Secret Santa / 마니또 draw, 6 languages (2026-11-22). Logic: lib/secret-santa.ts
// Two ways to hand out results: one private link per person (#hash, never sent to the server),
// or pass one phone around. The organizer never sees who drew whom.
import { useEffect, useMemo, useState } from "react";
import { decodeReveal, draw, encodeReveal, parseNames, type Assignment, type RevealData } from "../../lib/secret-santa";
import { track } from "./viz/track";

export type SantaLang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Copy {
  event: string; eventPh: string; budget: string; budgetPh: string; date: string;
  names: string; namesPh: string; count: (n: number) => string;
  exTitle: string; exHint: string; exAdd: string; exRemove: string; exPick: string;
  drawBtn: string; redraw: string; needTwo: string; impossible: string;
  tabLinks: string; tabPhone: string;
  linksHint: string; copy: string; copied: string; share: string; shareText: (g: string, e: string) => string;
  phoneHint: string; areYou: (g: string) => string; yes: string; back: string; hide: string; seen: string;
  revealFor: (g: string) => string; tap: string; giftTo: string; budgetLabel: string; dateLabel: string;
  notYou: string; makeOwn: string; badLink: string; privacy: string; defaultEvent: string;
}

const C: Record<SantaLang, Copy> = {
  ko: {
    event: "모임 이름", eventPh: "예: 우리 팀 마니또", budget: "선물 예산", budgetPh: "예: 3만 원", date: "선물 교환 날짜",
    names: "참여자 이름 (한 줄에 한 명)", namesPh: "민지\n서준\n하은\n도윤", count: (n) => `${n}명`,
    exTitle: "서로 뽑히면 안 되는 사람", exHint: "커플·가족처럼 서로 걸리지 않게 할 두 사람을 고르세요.", exAdd: "추가", exRemove: "빼기", exPick: "선택",
    drawBtn: "마니또 뽑기", redraw: "다시 뽑기", needTwo: "두 명 이상 적어 주세요.", impossible: "이 조건으로는 뽑을 수 없어요. 제외 조건을 줄여 주세요.",
    tabLinks: "각자 링크로 보내기", tabPhone: "폰 하나로 돌려 보기",
    linksHint: "각 사람에게 자기 링크만 보내 주세요. 링크를 연 사람만 자기 마니또를 봐요. 뽑은 사람도 결과를 몰라요.",
    copy: "링크 복사", copied: "복사됨", share: "공유", shareText: (g, e) => `${g}님, ${e} 마니또 결과예요. 혼자 열어 보세요 🎁`,
    phoneHint: "자기 이름을 눌러 확인하고, 다음 사람에게 폰을 넘기세요.", areYou: (g) => `${g}님 맞나요? 다른 사람은 화면을 보지 마세요.`, yes: "네, 볼게요", back: "아니요", hide: "확인했어요 (가리기)", seen: "확인함",
    revealFor: (g) => `${g}님의 마니또`, tap: "눌러서 열기", giftTo: "이 사람에게 몰래 선물해요", budgetLabel: "예산", dateLabel: "교환일",
    notYou: "본인 링크가 아니면 닫아 주세요.", makeOwn: "우리 모임도 마니또 뽑기", badLink: "링크가 잘렸거나 잘못됐어요. 보낸 사람에게 다시 받아 주세요.",
    privacy: "결과는 링크 주소의 # 뒤에만 들어 있어 서버로 가지 않아요. 암호화는 아니라서 링크를 가진 사람은 볼 수 있어요. 사이트는 방문 통계와 광고를 사용해요.",
    defaultEvent: "마니또",
  },
  en: {
    event: "Group name", eventPh: "e.g. Office Secret Santa", budget: "Gift budget", budgetPh: "e.g. $25", date: "Exchange date",
    names: "Names (one per line)", namesPh: "Emma\nLiam\nOlivia\nNoah", count: (n) => `${n} people`,
    exTitle: "People who must not draw each other", exHint: "Pick two people, such as a couple, who should never get each other.", exAdd: "Add", exRemove: "Remove", exPick: "Choose",
    drawBtn: "Draw names", redraw: "Draw again", needTwo: "Add at least two names.", impossible: "No draw is possible with these rules. Remove an exclusion.",
    tabLinks: "Send each person a link", tabPhone: "Pass one phone around",
    linksHint: "Send each person only their own link. Only they see who they got. You, the organizer, never see the matches.",
    copy: "Copy link", copied: "Copied", share: "Share", shareText: (g, e) => `${g}, here is your ${e} match. Open it alone 🎁`,
    phoneHint: "Tap your name, look, hide it, and pass the phone on.", areYou: (g) => `Are you ${g}? Everyone else, look away.`, yes: "Yes, show me", back: "No", hide: "Got it (hide)", seen: "Done",
    revealFor: (g) => `${g}, your Secret Santa match`, tap: "Tap to open", giftTo: "is the person you buy a gift for", budgetLabel: "Budget", dateLabel: "Exchange",
    notYou: "If this is not your link, please close it.", makeOwn: "Run a draw for your group", badLink: "This link is broken. Ask the organizer to send it again.",
    privacy: "The match lives only after the # in the link, which browsers never send to the server. It is not encryption: anyone with the link can read it. This site uses analytics and advertising.",
    defaultEvent: "Secret Santa",
  },
  ja: {
    event: "会の名前", eventPh: "例：部署のプレゼント交換", budget: "予算", budgetPh: "例：3,000円", date: "交換日",
    names: "参加者の名前（1行に1人）", namesPh: "さくら\nゆうと\nはると\nあおい", count: (n) => `${n}人`,
    exTitle: "お互いに当たらないようにする人", exHint: "夫婦や家族など、お互いに当たらないようにしたい2人を選びます。", exAdd: "追加", exRemove: "外す", exPick: "選択",
    drawBtn: "くじを引く", redraw: "引き直す", needTwo: "2人以上入力してください。", impossible: "この条件では組み合わせが作れません。除外を減らしてください。",
    tabLinks: "一人ずつリンクを送る", tabPhone: "1台のスマホを回す",
    linksHint: "それぞれに本人のリンクだけを送ってください。開いた本人だけが相手を見られます。幹事にも結果は分かりません。",
    copy: "リンクをコピー", copied: "コピーしました", share: "共有", shareText: (g, e) => `${g}さん、${e}の結果です。ひとりで開いてね 🎁`,
    phoneHint: "自分の名前を押して確認し、隠してから次の人に渡します。", areYou: (g) => `${g}さんですか？ほかの人は画面を見ないでください。`, yes: "はい、見る", back: "いいえ", hide: "確認した（隠す）", seen: "確認済み",
    revealFor: (g) => `${g}さんのプレゼント相手`, tap: "タップして開く", giftTo: "この人にこっそりプレゼント", budgetLabel: "予算", dateLabel: "交換日",
    notYou: "自分のリンクでなければ閉じてください。", makeOwn: "自分たちもくじを作る", badLink: "リンクが壊れています。幹事にもう一度送ってもらってください。",
    privacy: "結果はリンクの # 以降にだけ入っていて、サーバーには送られません。暗号化ではないので、リンクを持つ人は読めます。サイトではアクセス解析と広告を使っています。",
    defaultEvent: "プレゼント交換",
  },
  zh: {
    event: "活动名称", eventPh: "例：部门圣诞交换礼物", budget: "礼物预算", budgetPh: "例：100元", date: "交换日期",
    names: "参与者名字（每行一个）", namesPh: "小明\n小红\n阿杰\n莉莉", count: (n) => `${n} 人`,
    exTitle: "不能互相抽到的人", exHint: "选两个人（比如情侣、家人），让他们不会抽到对方。", exAdd: "添加", exRemove: "移除", exPick: "选择",
    drawBtn: "开始抽签", redraw: "重新抽", needTwo: "请至少填写两个名字。", impossible: "按这些条件无法完成抽签，请减少排除规则。",
    tabLinks: "给每人发链接", tabPhone: "一部手机轮流看",
    linksHint: "只把每个人自己的链接发给他。只有打开链接的人能看到结果，组织者也不知道谁抽到谁。",
    copy: "复制链接", copied: "已复制", share: "分享", shareText: (g, e) => `${g}，这是你的${e}抽签结果，请一个人打开 🎁`,
    phoneHint: "点自己的名字查看，遮住后把手机交给下一个人。", areYou: (g) => `你是${g}吗？其他人请别看屏幕。`, yes: "是，查看", back: "不是", hide: "看好了（遮住）", seen: "已查看",
    revealFor: (g) => `${g}的秘密圣诞老人对象`, tap: "点击打开", giftTo: "是你要偷偷送礼物的人", budgetLabel: "预算", dateLabel: "交换日",
    notYou: "如果不是你的链接，请关闭。", makeOwn: "为我们的活动抽签", badLink: "链接不完整或有误，请让组织者重新发送。",
    privacy: "结果只保存在链接 # 后面，浏览器不会把它发送到服务器。这不是加密，拿到链接的人都能看到。本站使用访问统计和广告。",
    defaultEvent: "交换礼物",
  },
  fr: {
    event: "Nom du groupe", eventPh: "ex. Père Noël secret du bureau", budget: "Budget cadeau", budgetPh: "ex. 20 €", date: "Date de l’échange",
    names: "Participants (un par ligne)", namesPh: "Léa\nHugo\nChloé\nLucas", count: (n) => `${n} personnes`,
    exTitle: "Personnes qui ne doivent pas se tirer", exHint: "Choisissez deux personnes, un couple par exemple, qui ne doivent jamais tomber l’une sur l’autre.", exAdd: "Ajouter", exRemove: "Retirer", exPick: "Choisir",
    drawBtn: "Faire le tirage", redraw: "Refaire le tirage", needTwo: "Ajoutez au moins deux prénoms.", impossible: "Aucun tirage possible avec ces règles. Retirez une exclusion.",
    tabLinks: "Envoyer un lien à chacun", tabPhone: "Faire passer un téléphone",
    linksHint: "Envoyez à chacun uniquement son lien. Lui seul voit son tirage. L’organisateur ne voit pas les résultats.",
    copy: "Copier le lien", copied: "Copié", share: "Partager", shareText: (g, e) => `${g}, voici ton tirage ${e}. Ouvre-le seul 🎁`,
    phoneHint: "Touchez votre prénom, regardez, cachez, puis passez le téléphone.", areYou: (g) => `Vous êtes bien ${g} ? Les autres, ne regardez pas.`, yes: "Oui, voir", back: "Non", hide: "Vu (cacher)", seen: "Vu",
    revealFor: (g) => `${g}, ton Père Noël secret`, tap: "Toucher pour ouvrir", giftTo: "est la personne à qui tu offres un cadeau", budgetLabel: "Budget", dateLabel: "Échange",
    notYou: "Si ce n’est pas votre lien, fermez-le.", makeOwn: "Faire un tirage pour mon groupe", badLink: "Ce lien est incomplet. Demandez à l’organisateur de le renvoyer.",
    privacy: "Le résultat se trouve seulement après le # du lien, que le navigateur n’envoie jamais au serveur. Ce n’est pas du chiffrement : qui a le lien peut le lire. Le site utilise des statistiques de visite et de la publicité.",
    defaultEvent: "Père Noël secret",
  },
  es: {
    event: "Nombre del grupo", eventPh: "p. ej. Amigo invisible de la oficina", budget: "Presupuesto", budgetPh: "p. ej. 20 €", date: "Fecha del intercambio",
    names: "Participantes (uno por línea)", namesPh: "Lucía\nHugo\nMartina\nPablo", count: (n) => `${n} personas`,
    exTitle: "Personas que no pueden tocarse", exHint: "Elige dos personas, como una pareja, que nunca deben tocarse entre sí.", exAdd: "Añadir", exRemove: "Quitar", exPick: "Elegir",
    drawBtn: "Hacer el sorteo", redraw: "Repetir sorteo", needTwo: "Añade al menos dos nombres.", impossible: "Con estas reglas no hay sorteo posible. Quita una exclusión.",
    tabLinks: "Enviar un enlace a cada uno", tabPhone: "Pasar un solo móvil",
    linksHint: "Envía a cada persona solo su enlace. Solo ella ve a quién le ha tocado. El organizador no ve los resultados.",
    copy: "Copiar enlace", copied: "Copiado", share: "Compartir", shareText: (g, e) => `${g}, aquí tienes tu ${e}. Ábrelo a solas 🎁`,
    phoneHint: "Pulsa tu nombre, mira, ocúltalo y pasa el móvil.", areYou: (g) => `¿Eres ${g}? Los demás, no miréis.`, yes: "Sí, ver", back: "No", hide: "Visto (ocultar)", seen: "Visto",
    revealFor: (g) => `${g}, tu amigo invisible`, tap: "Toca para abrir", giftTo: "es a quien le haces el regalo", budgetLabel: "Presupuesto", dateLabel: "Intercambio",
    notYou: "Si este enlace no es tuyo, ciérralo.", makeOwn: "Hacer un sorteo para mi grupo", badLink: "El enlace está incompleto. Pide al organizador que lo envíe otra vez.",
    privacy: "El resultado va solo detrás del # del enlace, que el navegador nunca envía al servidor. No es cifrado: quien tenga el enlace puede leerlo. El sitio usa estadísticas de visitas y publicidad.",
    defaultEvent: "amigo invisible",
  },
};

const STORE = "secret-santa-v1";
const input = "min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground";

function Reveal({ data, t, home }: { data: RevealData; t: Copy; home: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="space-y-4 rounded-2xl border border-primary bg-primary/10 p-5 text-center" data-tool="secret-santa-reveal">
      {data.e && <p className="text-sm text-muted-foreground">{data.e}</p>}
      <h2 className="text-xl font-bold text-foreground">{t.revealFor(data.g)}</h2>
      {open ? (
        <div className="space-y-2">
          <p className="text-4xl font-black text-foreground break-all">🎁 {data.r}</p>
          <p className="text-base text-foreground">{t.giftTo}</p>
          {(data.b || data.d) && (
            <p className="text-sm text-muted-foreground">
              {data.b && <>{t.budgetLabel}: {data.b}</>}{data.b && data.d && " · "}{data.d && <>{t.dateLabel}: {data.d}</>}
            </p>
          )}
        </div>
      ) : (
        <button type="button" className="min-h-14 w-full rounded-xl bg-primary px-4 text-lg font-bold text-primary-foreground"
          onClick={() => { setOpen(true); track("secret_santa_reveal", { via: "link" }, true); }}>{t.tap}</button>
      )}
      <p className="text-xs text-muted-foreground">{t.notYou}</p>
      <a href={home} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">{t.makeOwn}</a>
    </section>
  );
}

export default function SecretSanta({ lang }: { lang: SantaLang }) {
  const t = C[lang];
  const [hashState, setHashState] = useState<"none" | "bad" | RevealData>("none");
  const [event, setEvent] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [raw, setRaw] = useState("");
  const [ex, setEx] = useState<[string, string][]>([]);
  const [exA, setExA] = useState("");
  const [exB, setExB] = useState("");
  const [result, setResult] = useState<Assignment[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"links" | "phone">("links");
  const [copied, setCopied] = useState("");
  const [asking, setAsking] = useState<string | null>(null);
  const [showing, setShowing] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  useEffect(() => {
    const read = () => {
      const m = location.hash.match(/^#r=(.+)$/);
      if (!m) return setHashState("none");
      const d = decodeReveal(decodeURIComponent(m[1]));
      setHashState(d ?? "bad");
    };
    read();
    window.addEventListener("hashchange", read);
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? "null");
      if (s && typeof s === "object") {
        setEvent(s.event ?? ""); setBudget(s.budget ?? ""); setDate(s.date ?? ""); setRaw(s.raw ?? ""); setEx(Array.isArray(s.ex) ? s.ex : []);
        if (Array.isArray(s.result)) setResult(s.result);
      }
    } catch { /* storage blocked: start empty */ }
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const names = useMemo(() => parseNames(raw), [raw]);
  const validEx = ex.filter(([a, b]) => names.includes(a) && names.includes(b));

  const save = (res: Assignment[] | null) => {
    try { localStorage.setItem(STORE, JSON.stringify({ event, budget, date, raw, ex: validEx, result: res })); } catch { /* ignore */ }
  };

  const run = () => {
    setError(""); setSeen([]); setAsking(null); setShowing(null);
    if (names.length < 2) { setResult(null); return setError(t.needTwo); }
    const r = draw({ names, exclusions: validEx });
    if (!r) { setResult(null); return setError(t.impossible); }
    setResult(r); save(r);
    track("secret_santa_draw", { size: names.length < 6 ? "2-5" : names.length < 11 ? "6-10" : "11+", exclusions: validEx.length ? "yes" : "no" });
  };

  const home = typeof location === "undefined" ? "" : location.pathname;
  const linkFor = (a: Assignment) => {
    const token = encodeReveal({ g: a.giver, r: a.receiver, e: event.trim() || undefined, b: budget.trim() || undefined, d: date || undefined });
    return `${location.origin}${location.pathname}#r=${token}`;
  };

  const copy = async (a: Assignment) => {
    try { await navigator.clipboard.writeText(linkFor(a)); setCopied(a.giver); setTimeout(() => setCopied(""), 1500); track("secret_santa_link", { how: "copy" }); } catch { /* clipboard blocked */ }
  };
  const share = async (a: Assignment) => {
    const url = linkFor(a);
    const text = t.shareText(a.giver, event.trim() || t.defaultEvent);
    if (navigator.share) {
      try { await navigator.share({ text, url }); track("secret_santa_link", { how: "share" }); } catch { /* cancelled */ }
    } else copy(a);
  };

  if (hashState === "bad") {
    return <p className="rounded-xl border border-border bg-card p-4 text-foreground">{t.badLink} <a className="font-semibold text-primary underline" href={home}>{t.makeOwn}</a></p>;
  }
  if (hashState !== "none") return <Reveal data={hashState} t={t} home={home} />;

  return (
    <div className="space-y-5" data-tool="secret-santa-generator">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm font-medium text-muted-foreground">{t.event}
          <input className={input} value={event} maxLength={40} placeholder={t.eventPh} onChange={(e) => setEvent(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm font-medium text-muted-foreground">{t.budget}
          <input className={input} value={budget} maxLength={20} placeholder={t.budgetPh} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm font-medium text-muted-foreground">{t.date}
          <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label className="block space-y-1 text-sm font-medium text-muted-foreground">
        <span className="flex justify-between"><span>{t.names}</span><span>{t.count(names.length)}</span></span>
        <textarea className={input + " min-h-40 py-2 leading-relaxed"} value={raw} placeholder={t.namesPh} onChange={(e) => setRaw(e.target.value)} />
      </label>

      <fieldset className="space-y-2 rounded-xl border border-border bg-card p-3">
        <legend className="px-1 text-sm font-semibold text-foreground">{t.exTitle}</legend>
        <p className="text-xs text-muted-foreground">{t.exHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[exA, exB].map((v, i) => (
            <select key={i} aria-label={t.exPick} className={input} value={v} onChange={(e) => (i ? setExB : setExA)(e.target.value)}>
              <option value="">{t.exPick}</option>
              {names.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          ))}
          <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted"
            disabled={!exA || !exB || exA === exB}
            onClick={() => { setEx((xs) => [...xs, [exA, exB]]); setExA(""); setExB(""); }}>{t.exAdd}</button>
        </div>
        {validEx.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {validEx.map(([a, b], i) => (
              <li key={`${a}-${b}-${i}`} className="flex items-center gap-1 rounded-full border border-border bg-background px-3 text-sm text-foreground">
                {a} ↔ {b}
                <button type="button" className="min-h-11 px-2 text-muted-foreground underline" aria-label={`${t.exRemove} ${a} ↔ ${b}`}
                  onClick={() => setEx((xs) => xs.filter(([x, y]) => !(x === a && y === b)))}>×</button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <button type="button" className="min-h-12 w-full rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground" onClick={run}>
        {result ? t.redraw : t.drawBtn}
      </button>
      {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-foreground">{error}</p>}

      {result && (
        <section aria-live="polite" className="space-y-3 rounded-xl border border-primary bg-primary/10 p-4">
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
            {(["links", "phone"] as const).map((k) => (
              <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}
                className={"min-h-11 rounded-md px-2 text-sm " + (tab === k ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted-foreground")}>
                {k === "links" ? t.tabLinks : t.tabPhone}
              </button>
            ))}
          </div>

          {tab === "links" ? (
            <>
              <p className="text-sm text-foreground">{t.linksHint}</p>
              <ul className="space-y-2">
                {result.map((a) => (
                  <li key={a.giver} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background p-2">
                    <span className="font-semibold text-foreground break-all">{a.giver}</span>
                    <span className="flex gap-2">
                      <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground hover:bg-muted" onClick={() => copy(a)}>
                        {copied === a.giver ? t.copied : t.copy}
                      </button>
                      <button type="button" className="min-h-11 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground" onClick={() => share(a)}>{t.share}</button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : showing ? (
            <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.revealFor(showing)}</p>
              <p className="text-3xl font-black text-foreground break-all">🎁 {result.find((a) => a.giver === showing)?.receiver}</p>
              <button type="button" className="min-h-11 w-full rounded-md bg-primary px-3 font-semibold text-primary-foreground"
                onClick={() => { setSeen((s) => [...s, showing]); setShowing(null); }}>{t.hide}</button>
            </div>
          ) : asking ? (
            <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-base font-semibold text-foreground">{t.areYou(asking)}</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="min-h-11 rounded-md border border-border text-foreground" onClick={() => setAsking(null)}>{t.back}</button>
                <button type="button" className="min-h-11 rounded-md bg-primary font-semibold text-primary-foreground"
                  onClick={() => { setShowing(asking); setAsking(null); track("secret_santa_reveal", { via: "phone" }, true); }}>{t.yes}</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground">{t.phoneHint}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {result.map((a) => {
                  const done = seen.includes(a.giver);
                  return (
                    <button key={a.giver} type="button" disabled={done} onClick={() => setAsking(a.giver)}
                      className={"min-h-12 rounded-lg border px-2 text-sm font-semibold break-all " + (done ? "border-border bg-muted text-muted-foreground" : "border-primary bg-background text-foreground")}>
                      {a.giver}{done && ` · ${t.seen}`}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}
      <p className="text-xs text-muted-foreground">{t.privacy}</p>
    </div>
  );
}

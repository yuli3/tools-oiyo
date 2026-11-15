// 의사결정 트리 (2026-11-14). 쉬운 모드: 선택지 2~4개를 성공 확률·결과로 비교. 전문가 모드: 결정·확률 노드를 겹겹이 쌓는 트리.
// 계산: lib/biz-strategy.ts(evaluateTree·compareOptions), 그래프: ../viz/.
import { useMemo, useState } from "react";
import { compareOptions, evaluateTree, optionProbabilitySweep, treeFromOptions, type SimpleOption, type TreeNode } from "../../../lib/biz-strategy";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import AssumptionSlider from "../viz/AssumptionSlider";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import Term from "../viz/Term";
import TreeDiagram from "../viz/TreeDiagram";
import { exactWon, roughWon } from "../viz/format";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, TextField, Verdict, pct0, uid, useSaved } from "./common";

const TOOL_ID = "decision-tree-calculator";
const EXAMPLE_Q = "새 지점을 열까요?";
const EXAMPLE: SimpleOption[] = [
  { label: "새 지점 열기", successProb: 0.4, ifSuccess: 600_000_000, ifFail: -150_000_000, cost: 100_000_000 },
  { label: "온라인 판매 늘리기", successProb: 0.7, ifSuccess: 200_000_000, ifFail: 0, cost: 30_000_000 },
  { label: "지금처럼 유지", successProb: 1, ifSuccess: 50_000_000, ifFail: 50_000_000, cost: 0 },
];

export default function DecisionTree() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [question, setQuestion] = useSaved("dt-q", EXAMPLE_Q);
  const [options, setOptions, resetOptions] = useSaved<SimpleOption[]>("dt-options", EXAMPLE);
  const [tree, setTree] = useSaved<TreeNode | null>("dt-tree", null);
  const [focus, setFocus] = useState(0);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;

  const patch = (i: number, p: Partial<SimpleOption>) => setOptions(options.map((o, j) => (j === i ? { ...o, ...p } : o)));
  const cmp = compareOptions(options);
  const f = Math.min(focus, options.length - 1);
  const sweepPts = useMemo(() => optionProbabilitySweep(options, f, 50), [options, f]);
  const simpleTree = useMemo(() => treeFromOptions(question, options), [question, options]);
  const activeTree = !easy && tree ? tree : simpleTree;
  const result = useMemo(() => evaluateTree(activeTree), [activeTree]);
  const best = options[cmp.best];
  const be = cmp.breakeven[cmp.best];
  const runnerUp = cmp.evs.map((v, i) => ({ v, i })).filter((x) => x.i !== cmp.best).sort((a, b) => b.v - a.v)[0];

  const memo = () =>
    [
      `[의사결정 트리] ${question}`,
      ...options.map((o, i) => `- ${o.label}: 성공 ${pct0(o.successProb)}, 성공 시 ${exactWon(o.ifSuccess)}, 실패 시 ${exactWon(o.ifFail)}, 비용 ${exactWon(o.cost ?? 0)} → 기대값 ${exactWon(cmp.evs[i])}`),
      `최선(기대값): ${result.path.join(" → ") || best.label} ${exactWon(result.ev)}, 손실 확률 ${pct0(result.lossProbability)}, 최악 ${exactWon(result.worst)}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <TextField label="무엇을 결정하나요?" value={question} onChange={setQuestion} placeholder="예: 새 지점을 열까요?" />

      {(easy || !tree) && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-foreground">선택지</h2>
          {options.map((o, i) => (
            <div key={i} className="space-y-3 rounded-md border border-border bg-background p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1"><TextField label={`선택지 ${i + 1}`} value={o.label} onChange={(v) => patch(i, { label: v })} /></div>
                {options.length > 2 && <SmallButton tone="danger" label={`${o.label} 지우기`} onClick={() => setOptions(options.filter((_, j) => j !== i))}>삭제</SmallButton>}
              </div>
              <ChoiceChips
                legend="결과가 정해져 있나요?"
                value={o.successProb >= 1 ? "sure" : "risky"}
                options={[{ value: "risky", label: "잘될 수도, 안될 수도" }, { value: "sure", label: "결과가 거의 확실해요" }] as const}
                onChange={(v) => patch(i, v === "sure" ? { successProb: 1, ifFail: o.ifSuccess } : { successProb: 0.5 })}
              />
              {o.successProb < 1 ? (
                <>
                  <AssumptionSlider label="잘될 확률" unit="pct" value={o.successProb} range={[0, 0.99]} mode={mode} onChange={(v) => { patch(i, { successProb: v }); setFocus(i); track("advisory_slider", { tool_id: TOOL_ID }, true); }} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MoneyField label="잘되면 얻는 돈" value={o.ifSuccess} onChange={(v) => patch(i, { ifSuccess: v })} allowNegative />
                    <MoneyField label="안되면(손실은 −)" value={o.ifFail} onChange={(v) => patch(i, { ifFail: v })} allowNegative />
                  </div>
                </>
              ) : (
                <MoneyField label="얻는 돈(손실은 −)" value={o.ifSuccess} onChange={(v) => patch(i, { ifSuccess: v, ifFail: v })} allowNegative />
              )}
              <MoneyField label="시작할 때 드는 돈" value={o.cost ?? 0} onChange={(v) => patch(i, { cost: v })} hint="되돌릴 수 없는 투자비" />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {options.length < 4 && <SmallButton onClick={() => setOptions([...options, { label: `선택지 ${options.length + 1}`, successProb: 0.5, ifSuccess: 100_000_000, ifFail: 0, cost: 0 }])}>선택지 추가</SmallButton>}
            <SmallButton onClick={resetOptions}>예시로 되돌리기</SmallButton>
          </div>
        </section>
      )}

      {!easy && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">트리 직접 만들기</h2>
          <p className="text-sm leading-6 text-muted-foreground">위 선택지를 트리로 옮긴 뒤, 확률 노드 뒤에 다시 결정을 넣거나(예: 시장 반응을 보고 확장할지) 가지를 늘릴 수 있어요.</p>
          {tree ? (
            <>
              <NodeEditor node={tree} onChange={setTree} depth={0} />
              <SmallButton tone="danger" onClick={() => setTree(null)}>트리 지우고 선택지로 돌아가기</SmallButton>
            </>
          ) : (
            <SmallButton onClick={() => setTree(simpleTree)}>선택지를 트리로 옮기기</SmallButton>
          )}
          {result.warnings.map((w) => <p key={w} className="text-sm text-warning-foreground">{w}</p>)}
        </section>
      )}

      <Verdict title="결론">
        {easy || !tree ? (
          <>
            <Term k="기대값">기대값</Term>으로는 <b>'{best.label}'</b>이 가장 나아요(평균 {money(cmp.evs[cmp.best])}).{" "}
            {best.successProb < 1 && <>다만 안되면 {money(best.ifFail - (best.cost ?? 0))}이고 그럴 확률이 {pct0(1 - best.successProb)}예요. </>}
            {runnerUp && be !== null && best.successProb < 1 && <>잘될 확률이 <b>{pct0(be)}</b>보다 낮다고 보면 '{options[runnerUp.i].label}'이 더 나아요.</>}
          </>
        ) : (
          <>최선의 길은 <b>{result.path.join(" → ")}</b>, 기대값 {money(result.ev)}예요.</>
        )}
        <span className="mt-1 block text-sm text-muted-foreground">손해 볼 확률 {pct0(result.lossProbability)} · 최악 {money(result.worst)} · 최선 {money(result.best)}</span>
      </Verdict>

      <TreeDiagram title="의사결정 트리" caption="끝에서부터 거꾸로 계산해요: 운에 달린 지점은 확률 평균, 고르는 지점은 가장 큰 값." root={result.root} format={money} />

      {(easy || !tree) && (
        <>
          <CompareBars title="선택지별 기대값" items={options.map((o, i) => ({ label: o.label, value: cmp.evs[i], current: i === cmp.best }))} format={money} />
          {options[f].successProb < 1 && (
            <>
              <ChoiceChips legend="어느 선택지의 확률을 움직여 볼까요?" value={String(f)} options={options.map((o, i) => ({ value: String(i), label: o.label }))} onChange={(v) => setFocus(Number(v))} />
              <SweepChart
                title={`'${options[f].label}'이 잘될 확률이 바뀌면`}
                caption="곡선은 이 선택지의 기대값, 세로 점선은 1등이 바뀌는 확률이에요. 그래프를 눌러 확률을 바꿔 보세요."
                points={sweepPts.map((p) => ({ x: p.p, y: p.evs[f] }))}
                current={{ x: options[f].successProb, y: cmp.evs[f] }}
                marks={cmp.breakeven[f] !== null ? [{ at: cmp.breakeven[f]!, label: "1등이 바뀜" }] : []}
                formatX={pct0}
                formatY={money}
                xLabel="잘될 확률"
                yLabel="기대값"
                onPick={(x) => patch(f, { successProb: Math.min(0.99, Math.round(x * 100) / 100) })}
              />
            </>
          )}
        </>
      )}

      <CompareBars title="결과가 나올 확률(최선의 길을 따를 때)" caption="기대값이 같아도 손실 확률이 크면 버틸 수 있는지 먼저 봐요." items={result.profile.map((p) => ({ label: `${money(p.value)}`, value: p.prob * 100 }))} format={(n) => `${Math.round(n)}%`} />

      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}

const KINDS = [
  { value: "decision", label: "□ 고르기" },
  { value: "chance", label: "○ 운" },
  { value: "outcome", label: "◁ 결과" },
] as const;

function NodeEditor({ node, onChange, depth, parentKind }: { node: TreeNode; onChange: (n: TreeNode) => void; depth: number; parentKind?: TreeNode["kind"] }) {
  void parentKind;
  const setKind = (k: TreeNode["kind"]) => {
    if (k === node.kind) return;
    if (k === "outcome") onChange({ id: node.id, label: node.label, kind: "outcome", value: 0 });
    else {
      const branches = node.kind === "outcome" ? [newBranch(k), newBranch(k)] : node.branches.map((b) => ({ ...b, prob: k === "chance" ? b.prob ?? 0.5 : undefined }));
      onChange({ id: node.id, label: node.label, kind: k, branches });
    }
  };
  return (
    <div className={"space-y-2 rounded-md border border-border p-3 " + (depth % 2 ? "bg-muted" : "bg-background")}>
      <TextField label="이름" value={node.label} onChange={(v) => onChange({ ...node, label: v })} />
      <ChoiceChips legend="종류" value={node.kind} options={KINDS} onChange={setKind} />
      {node.kind === "outcome" ? (
        <MoneyField label="결과 금액" value={node.value} onChange={(v) => onChange({ ...node, value: v })} allowNegative />
      ) : (
        <ul className="space-y-3">
          {node.branches.map((b, i) => {
            const set = (nb: typeof b) => onChange({ ...node, branches: node.branches.map((x, j) => (j === i ? nb : x)) });
            return (
              <li key={b.node.id} className="space-y-2 border-l-2 border-primary pl-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <TextField label="가지 이름" value={b.label} onChange={(v) => set({ ...b, label: v })} />
                  {node.kind === "chance" ? (
                    <NumberField label="확률" value={Math.round((b.prob ?? 0) * 1000) / 10} onChange={(v) => set({ ...b, prob: v / 100 })} suffix="%" step={5} />
                  ) : (
                    <MoneyField label="이 가지의 비용" value={b.cost ?? 0} onChange={(v) => set({ ...b, cost: v })} />
                  )}
                  <div className="flex items-end">
                    {node.branches.length > 1 && <SmallButton tone="danger" onClick={() => onChange({ ...node, branches: node.branches.filter((_, j) => j !== i) })}>가지 삭제</SmallButton>}
                  </div>
                </div>
                {depth < 5 && <NodeEditor node={b.node} onChange={(n) => set({ ...b, node: n })} depth={depth + 1} parentKind={node.kind} />}
              </li>
            );
          })}
          <li>
            <SmallButton onClick={() => onChange({ ...node, branches: [...node.branches, newBranch(node.kind)] })}>가지 추가</SmallButton>
          </li>
        </ul>
      )}
    </div>
  );
}

function newBranch(kind: TreeNode["kind"]) {
  const id = uid();
  return { label: kind === "chance" ? "경우" : "선택", prob: kind === "chance" ? 0.5 : undefined, cost: 0, node: { id, label: "결과", kind: "outcome" as const, value: 0 } };
}

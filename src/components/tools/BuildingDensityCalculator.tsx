import { useState } from "react";
import { density, toPyeong, ZONES } from "../../lib/kr-presale-2026";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const m2 = (n: number) => `${(Math.round(n * 10) / 10).toLocaleString("ko-KR")}㎡`;
const py = (n: number) => `${(Math.round(toPyeong(n) * 10) / 10).toLocaleString("ko-KR")}평`;
const pct = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("ko-KR")}%`;

export default function BuildingDensityCalculator() {
  const [zoneId, setZoneId] = useState("r2");
  const zone = ZONES.find((z) => z.id === zoneId) ?? ZONES[3];
  const [site, setSite] = useState(330);
  const [footprint, setFootprint] = useState(190);
  const [floorArea, setFloorArea] = useState(640);
  const [coverageLimit, setCoverageLimit] = useState(zone.coverage);
  const [farLimit, setFarLimit] = useState(zone.farMax);

  const pickZone = (id: string) => {
    const z = ZONES.find((x) => x.id === id);
    if (!z) return;
    setZoneId(id);
    setCoverageLimit(z.coverage);
    setFarLimit(z.farMax);
  };

  let d: ReturnType<typeof density> | null = null;
  try {
    d = density({ site, footprint, floorArea, coverageLimit, farLimit });
  } catch {
    d = null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">용도지역 (토지이음에서 확인)</span>
          <select
            value={zoneId}
            onChange={(e) => pickZone(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground"
          >
            {ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.group} · {z.label} (건폐율 {z.coverage}%, 용적률 {z.farMin}~{z.farMax}%)
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="적용 건폐율 상한 (조례 값으로 바꾸기)" value={coverageLimit} onChange={setCoverageLimit} suffix="%" step={5} />
          <NumberField label="적용 용적률 상한 (조례 값으로 바꾸기)" value={farLimit} onChange={setFarLimit} suffix="%" step={10} />
        </div>
        <NumberField label="대지면적" value={site} onChange={setSite} suffix="㎡" step={10} />
        <NumberField label="건축면적 (건물 1층 바닥처럼 위에서 본 면적)" value={footprint} onChange={setFootprint} suffix="㎡" step={10} />
        <NumberField label="지상층 바닥면적 합계 (지하층·지상 주차장 제외)" value={floorArea} onChange={setFloorArea} suffix="㎡" step={10} />
      </div>

      <div aria-live="polite">
        {d === null ? (
          <p className="text-sm text-muted-foreground">대지면적은 0보다 크게, 나머지는 0 이상으로 넣어 주세요.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-5 py-5">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">건폐율</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-foreground">{pct(d.coverage)}</dd>
                <dd className="text-sm text-muted-foreground">{d.coverageOk ? `상한 ${coverageLimit}% 이내` : `상한 ${coverageLimit}% 초과`}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">용적률</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-foreground">{pct(d.far)}</dd>
                <dd className="text-sm text-muted-foreground">{d.farOk ? `상한 ${farLimit}% 이내` : `상한 ${farLimit}% 초과`}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              이 땅에 지을 수 있는 최대 건축면적은 {m2(d.maxFootprint)}({py(d.maxFootprint)}), 지상 연면적은 {m2(d.maxFloorArea)}({py(d.maxFloorArea)})예요. 최대 건축면적으로 같은 넓이를 쌓으면 {d.floorsAtMaxFootprint}층까지예요.
            </p>
            <ResultSteps
              steps={[
                `건폐율 = 건축면적 ${m2(footprint)} ÷ 대지면적 ${m2(site)} × 100 = ${pct(d.coverage)}`,
                `용적률 = 지상 연면적 ${m2(floorArea)} ÷ 대지면적 ${m2(site)} × 100 = ${pct(d.far)}`,
                `${zone.label} 법정 범위: 건폐율 ${zone.coverage}% 이하, 용적률 ${zone.farMin}~${zone.farMax}% (국토계획법 시행령 제84·85조)`,
                `최대 건축면적 = ${m2(site)} × ${coverageLimit}% · 최대 지상 연면적 = ${m2(site)} × ${farLimit}%`,
              ]}
              next={[
                { href: "/ko/reconstruction-profit/", label: "재건축 수익률" },
                { href: "/ko/presale-payment-calculator/", label: "분양 대금 일정" },
                { href: "/ko/acquisition-tax-calculator/", label: "취득세" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

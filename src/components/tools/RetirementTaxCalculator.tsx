import React, { useState, useMemo } from 'react';

import { retirementIncomeTax } from '../../lib/kr-retirement-tax';

export default function RetirementTaxCalculator() {
  const [grossSeverance, setGrossSeverance] = useState<number>(80000000); // 8,000만원
  const [serviceYears, setServiceYears] = useState<number>(10); // 10년

  const calculation = useMemo(() => retirementIncomeTax(grossSeverance, serviceYears), [grossSeverance, serviceYears]);

  const formatWon = (val: number) => Math.round(val).toLocaleString('ko-KR') + '원';

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          2026 최신 퇴직소득세법 반영
        </span>
        <h2 className="mt-2 text-2xl font-black text-foreground">
          퇴직소득세 & 퇴직금 실수령액 정밀 계산기
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          근속연수 공제 및 환산급여 공제율을 적용하여 실제 통장에 입금되는 세후 퇴직금과 공제 세액을 계산합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-foreground">
            세전 퇴직금 총액 (원)
          </label>
          <input
            type="number"
            min="0"
            step="1000000"
            value={grossSeverance}
            onChange={(e) => setGrossSeverance(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">
            {(grossSeverance / 10000).toLocaleString('ko-KR')}만 원
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground">
            근속연수 (년)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={serviceYears}
            onChange={(e) => setServiceYears(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">
            만 {serviceYears}년 근무
          </span>
        </div>
      </div>

      {/* Main Result Card */}
      <div className="mt-6 rounded-2xl border border-border bg-muted p-5">
        <p className="text-xs font-bold text-foreground">실제 수령하는 세후 퇴직금</p>
        <p className="mt-1 text-3xl font-black text-primary">
          {formatWon(calculation.netPayout)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          총 퇴직소득세 공제: {formatWon(calculation.totalTax)} (실효세율 {calculation.effectiveTaxRate.toFixed(2)}%)
        </p>
      </div>

      {/* Breakdown Details */}
      <div className="mt-6 space-y-2 rounded-xl border border-border p-4 text-xs">
        <div className="flex justify-between border-b border-border/60 pb-2">
          <span className="text-muted-foreground">세전 퇴직소득</span>
          <span className="font-bold text-foreground">{formatWon(calculation.gross)}</span>
        </div>
        <div className="flex justify-between border-b border-border/60 pb-2">
          <span className="text-muted-foreground">근속연수 공제 ({calculation.years}년)</span>
          <span className="font-bold text-primary">-{formatWon(calculation.serviceDeduction)}</span>
        </div>
        <div className="flex justify-between border-b border-border/60 pb-2">
          <span className="text-muted-foreground">환산급여 (연환산액)</span>
          <span className="font-bold text-foreground">{formatWon(calculation.convertedSalary)}</span>
        </div>
        <div className="flex justify-between border-b border-border/60 pb-2">
          <span className="text-muted-foreground">환산급여 소득공제</span>
          <span className="font-bold text-primary">-{formatWon(calculation.salaryDeduction)}</span>
        </div>
        <div className="flex justify-between border-b border-border/60 pb-2">
          <span className="text-muted-foreground">환산 과세표준</span>
          <span className="font-bold text-foreground">{formatWon(calculation.convertedTaxBase)}</span>
        </div>
        <div className="flex justify-between border-b border-border/60 pb-2">
          <span className="text-muted-foreground">퇴직소득세 (국세)</span>
          <span className="font-bold text-destructive">{formatWon(calculation.nationalTax)}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-muted-foreground">지방소득세 (10%)</span>
          <span className="font-bold text-destructive">{formatWon(calculation.localTax)}</span>
        </div>
      </div>
    </div>
  );
}

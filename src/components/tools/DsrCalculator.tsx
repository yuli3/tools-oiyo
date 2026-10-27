import React, { type CSSProperties, useState, useEffect } from 'react';
import AnimatedNumber from './AnimatedNumber';

const DsrCalculator: React.FC = () => {
    const [income, setIncome] = useState<number>(60000000);
    const [existingDebt, setExistingDebt] = useState<number>(10000000);
    const [newLoan, setNewLoan] = useState<number>(300000000);
    const [interestRate, setInterestRate] = useState<number>(4.5);
    const [loanTerm, setLoanTerm] = useState<number>(40);
    const [dsr, setDsr] = useState<number>(0);
    const [maxLoan, setMaxLoan] = useState<number>(0);

    const calculateDsr = () => {
        // Simple PMT calculation for new loan
        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = loanTerm * 12;
        
        const monthlyPayment = (newLoan * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        const annualNewPayment = monthlyPayment * 12;
        
        const totalAnnualDebt = existingDebt + annualNewPayment;
        const calculatedDsr = (totalAnnualDebt / income) * 100;
        setDsr(calculatedDsr);

        // Calculate max loan for 40% DSR
        const maxAnnualPayment = income * 0.4 - existingDebt;
        if (maxAnnualPayment > 0) {
            const calculatedMaxLoan = (maxAnnualPayment / 12) * (Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
            setMaxLoan(calculatedMaxLoan);
        } else {
            setMaxLoan(0);
        }
    };

    useEffect(() => {
        calculateDsr();
    }, [income, existingDebt, newLoan, interestRate, loanTerm]);

    return (
        <div className=" my-7 sm:my-12 p-4 sm:p-8 bg-gradient-to-br from-muted/40 to-muted border border-border rounded-3xl shadow-xl">
            <div className="flex flex-col md:flex-row gap-5 sm:gap-8">
                {/* Inputs */}
                <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">대출 정보 입력</h3>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">연간 총소득 (백만원)</label>
                        <input 
                            type="range" min="10000000" max="200000000" step="1000000"
                            value={income} onChange={(e) => setIncome(Number(e.target.value))}
                            className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-lg font-bold text-primary">
                            <span>{income / 10000}만원</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">기존 대출 연간 원리금 상환액 (만원)</label>
                        <input 
                            type="number" value={existingDebt / 10000} 
                            onChange={(e) => setExistingDebt(Number(e.target.value) * 10000)}
                            className="w-full p-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">신규 대출 희망 금액 (백만원)</label>
                        <input 
                            type="range" min="10000000" max="1000000000" step="10000000"
                            value={newLoan} onChange={(e) => setNewLoan(Number(e.target.value))}
                            className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="text-lg font-bold text-primary">{newLoan / 10000}만원</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">금리 (%)</label>
                            <input 
                                type="number" step="0.1" value={interestRate} 
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full p-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">기간 (년)</label>
                            <select 
                                value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))}
                                className="w-full p-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring outline-none transition-all"
                            >
                                <option value={10}>10년</option>
                                <option value={20}>20년</option>
                                <option value={30}>30년</option>
                                <option value={40}>40년</option>
                                <option value={50}>50년</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 p-4 sm:p-6 bg-card rounded-2xl border border-primary/30 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="mb-6">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">나의 DSR 지수</span>
                        <div className={`text-6xl font-black mt-2 ${dsr > 40 ? 'text-destructive' : 'text-primary'}`}>
                            <AnimatedNumber
                                value={dsr}
                                locales="ko-KR"
                                format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-5 sm:mb-8 relative">
                        <div 
                            className={`w-(--w) h-full transition-all duration-500 ${dsr > 40 ? 'bg-destructive' : 'bg-primary'}`} 
                            style={{ '--w': `${Math.min(dsr, 100)}%` } as CSSProperties}
                        />
                        <div className="absolute left-2/5 top-0 w-1 h-full bg-muted/50 z-10" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full">
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <span className="text-xs text-muted-foreground block mb-1">DSR 40% 기준 대출 가능 최대 금액</span>
                            <span className="text-xl font-bold text-primary">
                                {maxLoan > 0 ? (
                                    <AnimatedNumber
                                        value={Math.floor(maxLoan / 10000) * 10000}
                                        locales="ko-KR"
                                        prefix="₩"
                                    />
                                ) : '0원'}
                            </span>
                        </div>
                        
                        {dsr > 40 ? (
                            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                                ⚠️ 현재 규제 한도(40%)를 초과하였습니다. 대출 기간을 늘리거나 기존 대출을 상환하는 전략이 필요합니다.
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                                ✅ 규제 한도 내에 있습니다. 안정적인 대출 실행이 가능합니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-8 text-xs text-muted-foreground text-center uppercase tracking-tighter">
                * 위 계산 결과는 참고용이며 실제 은행의 심사 기준과 다를 수 있습니다. (스트레스 DSR 미반영)
            </div>
        </div>
    );
};

export default DsrCalculator;

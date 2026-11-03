import React, { useState } from 'react';
import { ToolPanel } from './ToolPanel';

const PregnancyCalculator: React.FC<{ locale?: 'ko' | 'en' }> = ({ locale = 'ko' }) => {
    const t = {
        ko: { title: "여성 건강 & 임신 주기 계산기", desc: "마지막 생리 시작일을 기준으로 가임기, 예정일 및 주요 주기를 관리합니다.", lmp: "마지막 생리 시작일", cycle: "평균 생리 주기 (일)", result: "주요 일정", ovulation: "예상 배란일", fertility: "임신 가능 기간", dueDate: "출산 예정일", weeks: "현재 임신 주수", note: "* 이 계산기는 통계적 평균치를 기반으로 해요. 실제 주기는 개인의 컨디션에 따라 다를 수 있으니 참고용으로만 사용하세요." },
        en: { title: "Women's Health & Pregnancy", desc: "Track ovulation, fertile window, and due date based on your LMP.", lmp: "Last Menstrual Period (LMP)", cycle: "Cycle Length (Days)", result: "Key Dates", ovulation: "Estimated Ovulation", fertility: "Fertile Window", dueDate: "Due Date", weeks: "Pregnancy Weeks", note: "* Based on statistical averages. Real cycles vary from person to person, so use these dates as a reference only." }
    }[locale === 'ko' ? 'ko' : 'en'];

    const [lmp, setLmp] = useState<string>(new Date().toISOString().split('T')[0]);
    const [cycle, setCycle] = useState(28);

    const lmpDate = new Date(lmp);
    
    // Ovulation: LMP + Cycle - 14 days
    const ovulationDate = new Date(lmpDate);
    ovulationDate.setDate(lmpDate.getDate() + (cycle - 14));
    
    // Fertile window: the 5 days before ovulation through the day after (sperm survive up to 5 days)
    const fertStart = new Date(ovulationDate);
    fertStart.setDate(ovulationDate.getDate() - 5);
    const fertEnd = new Date(ovulationDate);
    fertEnd.setDate(ovulationDate.getDate() + 1);

    // Due date: Naegele's rule (LMP + 280 days), shifted by how far the cycle differs from 28 days
    const dueDate = new Date(lmpDate);
    dueDate.setDate(lmpDate.getDate() + 280 + (cycle - 28));

    const formatDate = (d: Date) => d.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <ToolPanel title={t.title} subtitle="Life Cycle Management" onReset={() => { setLmp(new Date().toISOString().split('T')[0]); setCycle(28); }}>
            <div className="flex flex-col gap-6 sm:gap-10">
                <p className="text-sm font-medium text-muted-foreground text-center max-w-md mx-auto">{t.desc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-muted-foreground uppercase">{t.lmp}</label>
                        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="w-full p-4 bg-muted/30 rounded-2xl border border-border font-black outline-none" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-xs font-black text-muted-foreground uppercase">{t.cycle}</label>
                        <input type="number" value={cycle} onChange={(e) => setCycle(Number(e.target.value))} className="w-full p-4 bg-muted/30 rounded-2xl border border-border font-black outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 sm:p-6 bg-destructive/10 border border-destructive/20 rounded-3xl text-center space-y-2">
                        <p className="text-xs font-black text-destructive uppercase">{t.ovulation}</p>
                        <p className="font-black text-destructive">{formatDate(ovulationDate)}</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-success/10 border border-success/20 rounded-3xl text-center space-y-2">
                        <p className="text-xs font-black text-success uppercase">{t.fertility}</p>
                        <p className="font-black text-success text-xs">{formatDate(fertStart)} ~ {formatDate(fertEnd)}</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-foreground border border-background/15 rounded-3xl text-center space-y-2">
                        <p className="text-xs font-black text-primary uppercase">{t.dueDate}</p>
                        <p className="font-black text-background">{formatDate(dueDate)}</p>
                    </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-2xl text-xs text-center text-muted-foreground italic leading-relaxed">
                    {t.note}
                </div>
            </div>
        </ToolPanel>
    );
};

export default PregnancyCalculator;

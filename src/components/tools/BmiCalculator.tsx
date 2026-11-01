import React, { useId, useState } from 'react';
import { ToolPanel } from './ToolPanel';

const BmiCalculator: React.FC<{ locale?: 'ko' | 'en' }> = ({ locale = 'ko' }) => {
    const t = {
        ko: { title: "BMI & 체지방률 계산기", desc: "신체 데이터를 분석하여 건강 지표를 확인합니다.", height: "키 (cm)", weight: "몸무게 (kg)", age: "나이 (세)", gender: "성별", male: "남성", female: "여성", result: "분석 결과", status: "상태", fat: "예상 체지방률" },
        en: { title: "BMI & Body Fat", desc: "Analyze your body data for health indicators.", height: "Height (cm)", weight: "Weight (kg)", age: "Age", gender: "Gender", male: "Male", female: "Female", result: "Result", status: "Status", fat: "Body Fat %" }
    }[locale === 'ko' ? 'ko' : 'en'];

    const inputId = useId();
    const [height, setHeight] = useState(175);
    const [weight, setWeight] = useState(70);
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState<'m' | 'f'>('m');

    const bmi = weight / Math.pow(height / 100, 2);
    
    // Deurenberg formula for Body Fat %
    const bodyFat = (1.20 * bmi) + (0.23 * age) - (10.8 * (gender === 'm' ? 1 : 0)) - 5.4;

    // ko: 대한비만학회 2022 기준(23 비만 전단계, 25·30·35 비만 1·2·3단계). en: WHO adult cut-offs (25 overweight, 30 obese).
    const getBmiStatus = (v: number) => {
        if (v < 18.5) return { label: locale === 'ko' ? '저체중' : 'Underweight', color: 'text-foreground' };
        if (locale === 'ko') {
            if (v < 23) return { label: '정상', color: 'text-success' };
            if (v < 25) return { label: '비만 전단계(과체중)', color: 'text-warning' };
            if (v < 30) return { label: '1단계 비만', color: 'text-destructive' };
            if (v < 35) return { label: '2단계 비만', color: 'text-destructive' };
            return { label: '3단계 비만(고도비만)', color: 'text-destructive' };
        }
        if (v < 25) return { label: 'Normal', color: 'text-success' };
        if (v < 30) return { label: 'Overweight', color: 'text-warning' };
        return { label: 'Obese', color: 'text-destructive' };
    };

    const status = getBmiStatus(bmi);

    return (
        <ToolPanel title={t.title} subtitle="Health Analytics" onReset={() => { setHeight(175); setWeight(70); setAge(30); setGender('m'); }}>
            <div className="flex flex-col gap-6 sm:gap-10">
                <p className="text-sm font-medium text-foreground text-center">{t.desc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    <div className="space-y-4">
                        <div role="group" aria-label={t.gender} className="flex gap-2 p-1 bg-muted rounded-xl">
                            <button type="button" aria-pressed={gender === 'm'} onClick={() => setGender('m')} className={`flex-1 min-h-11 py-2 rounded-lg font-black text-xs ${gender === 'm' ? 'bg-background shadow-sm text-primary' : 'text-foreground'}`}>{t.male}</button>
                            <button type="button" aria-pressed={gender === 'f'} onClick={() => setGender('f')} className={`flex-1 min-h-11 py-2 rounded-lg font-black text-xs ${gender === 'f' ? 'bg-background shadow-sm text-primary' : 'text-foreground'}`}>{t.female}</button>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={`${inputId}-height`} className="text-xs font-black text-foreground uppercase">{t.height}</label>
                            <input id={`${inputId}-height`} type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full p-4 bg-muted/30 rounded-2xl border border-border font-black" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <label htmlFor={`${inputId}-weight`} className="text-xs font-black text-foreground uppercase">{t.weight}</label>
                            <input id={`${inputId}-weight`} type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full p-4 bg-muted/30 rounded-2xl border border-border font-black" />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor={`${inputId}-age`} className="text-xs font-black text-foreground uppercase">{t.age}</label>
                            <input id={`${inputId}-age`} type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full p-4 bg-muted/30 rounded-2xl border border-border font-black" />
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-10 bg-foreground rounded-3xl text-background flex flex-col md:flex-row gap-7 sm:gap-12 items-center justify-around shadow-2xl">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-black text-background/60 uppercase tracking-widest">BMI</p>
                        <h2 className="text-6xl font-black text-primary">{bmi.toFixed(1)}</h2>
                        <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
                    </div>
                    <div className="w-px h-24 bg-foreground hidden md:block" />
                    <div className="text-center space-y-2">
                        <p className="text-xs font-black text-background/60 uppercase tracking-widest">{t.fat}</p>
                        <h2 className="text-6xl font-black text-success">{bodyFat.toFixed(1)}%</h2>
                        <p className="text-xs text-background/50 font-medium">성인 남녀 평균 공식 기준</p>
                    </div>
                </div>
            </div>
        </ToolPanel>
    );
};

export default BmiCalculator;

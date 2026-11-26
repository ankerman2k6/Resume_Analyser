import { ArrowRight } from 'lucide-react';
import { StoryLabel, StoryReveal } from './StoryPrimitives';

function UploadIllustration() {
  return <svg viewBox="0 0 190 120" aria-hidden="true"><ellipse className="journey-shadow" cx="96" cy="102" rx="62" ry="8" /><path className="journey-blob" d="M38 77c-2-29 15-52 43-51 14-17 47-11 50 11 30-3 42 24 28 45-19 23-104 24-121-5Z" /><path className="journey-spark" d="m56 27 3-9m-7 5-7-4m100 21 6-6m-3 9 9 1" /><g className="journey-object"><rect x="50" y="38" width="90" height="55" rx="4" /><path d="M50 80h90v13H50z" /><path d="M77 52h35v27H77z" /><path d="M91 60v11m-5-5 5 5 5-5" /><path d="M81 84h28" /></g><path className="journey-cursor" d="m124 73 19 17-9 2 6 12-6 3-6-13-7 7 3-28Z" /></svg>;
}

function AnalysisIllustration() {
  return <svg viewBox="0 0 190 120" aria-hidden="true"><ellipse className="journey-shadow" cx="95" cy="103" rx="61" ry="8" /><path className="journey-blob" d="M30 73c5-18 17-26 34-30 7-24 38-32 55-12 29-5 49 18 42 44-7 27-116 31-131-2Z" /><path className="journey-spark" d="m151 25 4-8m2 12 8-2M44 39l-7-5" /><g className="journey-object"><rect x="43" y="26" width="105" height="70" rx="5" /><path d="M43 38h105" /><circle cx="50" cy="32" r="2" /><circle cx="57" cy="32" r="2" /><circle cx="64" cy="32" r="2" /><rect x="49" y="44" width="28" height="45" rx="2" /><circle cx="63" cy="55" r="6" /><path d="M54 69h18M54 75h15M54 81h12" /><rect x="83" y="45" width="57" height="12" rx="2" /><path d="M89 50h17m-17 3h27" /><rect x="83" y="63" width="27" height="25" rx="2" /><rect x="114" y="63" width="26" height="25" rx="2" /><path d="M88 70h16m-16 5h12m19-5h16m-16 5h11m-41 6h9m21 0h15" /></g></svg>;
}

function InsightsIllustration() {
  return <svg viewBox="0 0 190 120" aria-hidden="true"><ellipse className="journey-shadow" cx="95" cy="103" rx="64" ry="8" /><path className="journey-blob" d="M33 84c-4-22 9-39 30-43 12-19 38-21 54-5 26-3 43 16 40 39-3 27-104 34-124 9Z" /><path className="journey-spark" d="m43 43-5-8m7 3 7-5m102 16 8-5m-5 11 9 2" /><g className="journey-chart"><path d="M46 95h104" /><rect x="55" y="72" width="17" height="23" rx="2" /><rect x="78" y="58" width="17" height="37" rx="2" /><rect x="101" y="39" width="17" height="56" rx="2" /><rect x="124" y="22" width="17" height="73" rx="2" /><path d="m55 66 30-15 24-20 32-17" /><circle cx="55" cy="66" r="3" /><circle cx="85" cy="51" r="3" /><circle cx="109" cy="31" r="3" /><circle cx="141" cy="14" r="3" /></g></svg>;
}

function OpportunityIllustration() {
  return <svg viewBox="0 0 190 120" aria-hidden="true"><ellipse className="journey-shadow" cx="95" cy="103" rx="60" ry="8" /><path className="journey-blob" d="M34 78c-2-27 17-43 39-43 12-19 42-18 53 2 27 0 42 22 32 44-11 23-107 25-124-3Z" /><path className="journey-spark" d="m42 45-7-6m11 1 2-9m104 17 8-7m-3 13 9 1" /><g className="journey-briefcase"><path d="M50 51h91a6 6 0 0 1 6 6v35a7 7 0 0 1-7 7H51a7 7 0 0 1-7-7V57a6 6 0 0 1 6-6Z" /><path d="M76 51V39c0-5 4-8 9-8h20c5 0 9 3 9 8v12M80 51V40h30v11" /><path d="M44 69c30 15 72 15 103 0" /><rect x="89" y="67" width="13" height="14" rx="3" /><path d="M93 72h5" /></g></svg>;
}

const steps = [
  { title: 'Tải lên CV của bạn', copy: 'An toàn và tốc độ', Illustration: UploadIllustration },
  { title: 'Phân tích bằng AI', copy: 'Hiểu rõ điểm mạnh của bạn', Illustration: AnalysisIllustration },
  { title: 'Nhận thông tin chi tiết', copy: 'Xem những vị trí phù hợp nhất với bạn', Illustration: InsightsIllustration },
  { title: 'Tìm kiếm các cơ hội', copy: 'Sẵn sàng cho các bước tiếp theo', Illustration: OpportunityIllustration },
];

export function JourneyStorySection() {
  return (
    <section id="how-it-works" className="story-section story-paper story-journey">
      <div className="story-shell story-journey-grid">
        <StoryReveal className="story-copy story-journey-copy" from="left">
          <StoryLabel>Cách thức hoạt động</StoryLabel>
          <h2>Một<br/>hành trình<br/>đơn giản.</h2>
          <p>Từ CV tới những cơ hội mới chỉ trong một vài bước.</p>
          <span className="story-pencil-note" aria-hidden="true">tối ưu trong 4 bước</span>
        </StoryReveal>
        <div className="story-step-list">
          {steps.map(({ title, copy, Illustration }, index) => (
            <StoryReveal key={title} className="story-step" delay={index * 0.09}>
              <div className="story-step-illustration"><Illustration /></div>
              <div className="story-step-copy"><span className="story-step-number">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></div>
              {index < steps.length - 1 && <span className="story-step-connector" aria-hidden="true"><ArrowRight /></span>}
            </StoryReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JourneyStorySection;

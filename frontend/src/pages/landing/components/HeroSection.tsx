import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, FileSearch } from 'lucide-react';

const springConfig = {
  stiffness: 110,
  damping: 24,
  mass: 0.45,
};

const revealTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  const deskX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const deskY = useTransform(smoothY, [-1, 1], [5, -5]);
  const characterX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const characterY = useTransform(smoothY, [-1, 1], [10, -10]);
  const rotateX = useTransform(smoothY, [-1, 1], [3, -3]);
  const rotateY = useTransform(smoothX, [-1, 1], [-3, 3]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (shouldReduceMotion || event.pointerType !== 'mouse') return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };

  const resetParallax = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      className="relative h-screen min-h-[44rem] w-full overflow-hidden bg-[#F4F0E6] text-[#142019]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
    >
      <video
          className="absolute inset-0 z-0 h-full w-full origin-top scale-[1.05] object-cover object-top"
        src="/assets/hero-section/bg-room.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,#F4F0E6_0%,rgba(244,240,230,0.98)_34%,rgba(244,240,230,0.68)_51%,rgba(244,240,230,0.08)_76%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(244,240,230,0.22)_0%,transparent_48%,rgba(20,32,25,0.14)_100%)]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ perspective: '1000px' }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0"
          style={{
            rotateX: shouldReduceMotion ? 0 : rotateX,
            rotateY: shouldReduceMotion ? 0 : rotateY,
            transformStyle: 'preserve-3d',
            transformOrigin: '70% 70%',
          }}
        >
          <motion.div
            className="absolute right-[-55px] bottom-[-24px] z-10 w-[44rem] max-w-none select-none object-contain sm:w-[56rem] lg:w-[60vw] lg:max-w-[1200px]"
            style={{
              x: shouldReduceMotion ? 0 : deskX,
              y: shouldReduceMotion ? 0 : deskY,
              translateZ: '24px',
            }}
          >
            <img
              className="block w-full max-w-none origin-bottom-right object-contain lg:scale-[1.65]"
              src="/assets/hero-section/hero-desk.png"
              alt=""
              draggable={false}
            />
          </motion.div>

          <motion.div
            className="absolute right-0 bottom-5 z-20 w-[34rem] max-w-none select-none object-contain sm:right-[10vw] sm:w-[44rem] lg:right-[4vw] lg:w-[35vw] lg:max-w-[800px]"
            style={{
              x: shouldReduceMotion ? 0 : characterX,
              y: shouldReduceMotion ? 0 : characterY,
              translateZ: '64px',
            }}
          >
            <img
              className="block w-full max-w-none origin-bottom-right object-contain lg:scale-[2.5] min-[1600px]:scale-[3]"
              src="/assets/hero-section/hero-character.png"
              alt=""
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[25] hidden w-[32%] bg-[linear-gradient(90deg,#F4F0E6_0%,rgba(244,240,230,0.96)_48%,rgba(244,240,230,0.62)_72%,transparent_100%)] lg:block"
        aria-hidden="true"
      />

      <div className="absolute inset-x-5 top-[10%] z-30 sm:inset-x-8 lg:inset-y-0 lg:left-[10%] lg:right-auto lg:top-auto lg:flex lg:w-[44%] lg:-translate-y-64 lg:items-center">
        <div className="max-w-[40rem]">

            <motion.h1
                className="max-w-[13ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.035em] text-[#142019] sm:text-5xl lg:text-7xl xl:text-8xl"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, delay: 0.08 }}
            >
              Biến CV của bạn thành câu chuyện ấn tượng nhất.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-[34rem] text-pretty text-base leading-relaxed text-[#526158] sm:text-lg"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, delay: 0.16 }}
            >
              Nhận phản hồi chi tiết theo từng vị trí công việc.
              Khám phá điều nhà tuyển dụng chú ý, điều họ bỏ qua, và cách tối ưu từng dòng CV để tạo lợi thế cho bạn!
            </motion.p>

            <motion.div
              className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, delay: 0.24 }}
            >
              <a
                href="/cv"
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#142019] px-5 py-2.5 text-center text-sm font-medium leading-tight transition-colors outline-none hover:bg-[#283C31] sm:w-auto"
                style={{ color: '#F4F0E6' }}
              >
                <FileSearch className="size-4 shrink-0" aria-hidden="true" />
                Phân tích CV ngay
              </a>

              <a
                href="/candidate"
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#142019]/20 bg-[#F4F0E6]/80 px-5 py-2.5 text-center text-sm font-medium leading-tight text-[#142019] backdrop-blur-sm transition-colors outline-none hover:bg-[#E8E1D2] sm:w-auto"
              >
                Tìm kiếm công việc phù hợp
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </motion.div>
          </div>
      </div>
    </section>
  );
}

export default HeroSection;

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useEffect, RefObject } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MeetUs from '../components/MeetUs';

gsap.registerPlugin(ScrollTrigger);

function CanvasSequence({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentFrame = 0;
    const frameCount = 69;

    const render = (index: number) => {
      currentFrame = Math.floor(index);
      const img = imagesRef.current[currentFrame];
      if (img && img.complete && img.naturalWidth > 0) {
        const cW = canvas.clientWidth;
        const cH = canvas.clientHeight;
        
        ctx.clearRect(0, 0, cW, cH);

        const hRatio = cW / img.naturalWidth;
        const vRatio = cH / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (cW - img.naturalWidth * ratio) / 2;
        const centerShift_y = (cH - img.naturalHeight * ratio) / 2;
        
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 
                           centerShift_x, centerShift_y, img.naturalWidth * ratio, img.naturalHeight * ratio);
      }
    };

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      render(currentFrame);
    };

    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedNum = i.toString().padStart(4, '0');
      img.src = `/assets/scroll-frames/${paddedNum}.jpg`;
      img.onload = () => {
        if (i === 1) render(0);
      };
      images.push(img);
    }
    imagesRef.current = images;

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    let st: ScrollTrigger | undefined;
    if (targetRef.current) {
      st = ScrollTrigger.create({
        trigger: targetRef.current,
        start: "20% top",
        end: "64% top",
        scrub: true,
        onUpdate: (self) => {
           render(self.progress * (frameCount - 1));
        }
      });
    }

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      st?.kill();
    };
  }, [targetRef]);
  
  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const lenis = new Lenis();

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Original logo animation was 400vh. With 1000vh, 400vh is 0.4 of the progress.
  const logoScale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 25, 25]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32, 0.4, 1], [1, 1, 0, 0, 0]);
  const logoDisplay = useTransform(scrollYProgress, (p) => p > 0.4 ? "none" : "flex");
  const scrollTextOpacity = useTransform(scrollYProgress, [0, 0.05, 1], [1, 0, 0]);
  
  const finalMapOpacity = useTransform(scrollYProgress, [0.68, 0.80, 1], [0, 1, 1]);

  // New images animations
  const img1Opacity = useTransform(scrollYProgress, [0.76, 0.88, 1], [0, 1, 1]);
  const img1Y = useTransform(scrollYProgress, [0.76, 0.88, 1], [40, 0, 0]);
  const img1Scale = useTransform(scrollYProgress, [0.76, 0.88, 1], [0.95, 1, 1]);

  const img2Opacity = useTransform(scrollYProgress, [0.86, 1, 1], [0, 1, 1]);
  const img2Y = useTransform(scrollYProgress, [0.86, 1, 1], [40, 0, 0]);
  const img2Scale = useTransform(scrollYProgress, [0.86, 1, 1], [0.95, 1, 1]);

  return (
    <>
      <div className="relative h-[1100vh] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 bg-brand-black">
        <div ref={containerRef} className="absolute top-0 left-0 w-full h-[1000vh] pointer-events-none" />
        <div className="sticky top-0 h-[calc(100dvh-4rem)] lg:h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* Canvas Sequence (Behind) */}
          <motion.div 
            style={{ opacity: 1 }}
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          >
            <CanvasSequence targetRef={containerRef} />
          </motion.div>

          {/* Final Map Image (Fades in over the last frame) */}
          <motion.div 
            style={{ opacity: finalMapOpacity }}
            className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
          >
            <img 
              src="/Central Field.webp" 
              alt="Central Field Map" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* New Image 1 (Center) */}
          <motion.div 
            style={{ opacity: img1Opacity, y: img1Y, scale: img1Scale }}
            className="absolute inset-0 w-full h-full z-[2] pointer-events-none flex items-center justify-center p-8 lg:p-12"
          >
            <div className="relative w-full max-w-3xl md:max-w-5xl xl:max-w-7xl shadow-2xl rounded-2xl overflow-hidden border border-brand-pink/20 bg-brand-black/50 backdrop-blur-sm">
              <img 
                src="/89980f01-0592-4678-a345-f00c7e0c6a98%203.webp" 
                alt="Central Building Overlay" 
                className="w-full h-auto object-cover scale-125 translate-x-4 md:translate-x-8"
              />
            </div>
          </motion.div>

          {/* New Image 2 (Bottom Right) */}
          <motion.div 
            style={{ opacity: img2Opacity, y: img2Y, scale: img2Scale }}
            className="absolute inset-x-8 lg:inset-x-16 bottom-24 lg:bottom-32 z-[2] pointer-events-none flex justify-end"
          >
            <div className="relative w-64 sm:w-80 md:w-[28rem] lg:w-[36rem] xl:w-[44rem] aspect-[2/1] shadow-2xl rounded-2xl overflow-hidden border border-brand-pink/20 bg-brand-black/50 backdrop-blur-sm">
              <img 
                src="/39515818079.webp" 
                alt="Building Details" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Black background for logo zoom */}
          <motion.div 
            style={{ opacity: logoOpacity, display: logoDisplay }}
            className="absolute inset-0 bg-brand-black z-[5] pointer-events-none"
          />

          {/* Logo (In front) */}
          <motion.div 
            style={{ scale: logoScale, opacity: logoOpacity, display: logoDisplay, transformOrigin: "49.2% 43%" }} 
            className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center will-change-transform z-10"
          >
            {/* Ambient glow behind logo */}
            <div className="absolute inset-0 bg-brand-pink/30 blur-[80px] rounded-full z-[-1]" />
            <img 
              src="/CUET_Vector_Logo.svg (1) 2.webp" 
              alt="CUET Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Chittagong_University_of_Engineering_and_Technology_Logo.svg/1200px-Chittagong_University_of_Engineering_and_Technology_Logo.svg.png";
              }}
            />
          </motion.div>
          
          <motion.div 
              style={{ opacity: scrollTextOpacity }}
              className="absolute bottom-10 flex flex-col items-center z-20 pointer-events-none"
          >
             <p className="text-brand-highlight mb-2 font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(223,161,196,0.3)]">Scroll to enter</p>
             <div className="w-[1px] h-12 bg-brand-magenta/30 relative overflow-hidden">
                 <motion.div 
                     animate={{ y: [0, 48] }}
                     transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                     className="w-full h-1/2 bg-brand-pink absolute top-0"
                 />
             </div>
          </motion.div>
        </div>
      </div>
      
      {/* Blank Sections that slide up / Meet Us */}
      <div className="relative z-30 bg-brand-black min-h-screen py-24 -mx-4 lg:-mx-8 -mb-4 lg:-mb-8 px-4 lg:px-8 border-t border-brand-magenta/10 -mt-[100vh] overflow-hidden flex flex-col justify-center">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-magenta/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none z-0" />
        <div className="absolute top-1/2 right-1/4 w-[30rem] h-[30rem] bg-brand-plum/30 rounded-full blur-[128px] mix-blend-screen pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-pink/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none z-0" />

        {/* Sphere Section with Background Diagram */}
        <div className="relative w-full flex flex-col items-center justify-center min-h-screen">
          {/* Background Hardware Diagram - Strictly behind the sphere */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10">
            <img 
              src="/eadb4a6d-c9e1-4278-979d-bcc7d8980362-removebg-preview.webp" 
              alt="Hardware Components Diagram" 
              className="w-full h-full object-contain opacity-40 mix-blend-screen scale-110 md:scale-125 translate-y-12 md:translate-y-24"
            />
          </div>

          {/* Meet Us Content */}
          <MeetUs />
        </div>

        {/* Department Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-6xl mx-auto mt-12 mb-32 px-4 relative group w-full"
        >
          {/* Tech-Style Corner Shapes */}
          {/* Top Left */}
          <div className="absolute -top-6 -left-6 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-magenta to-transparent" />
            <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-brand-magenta to-transparent" />
            <div className="absolute top-0 left-0 w-3 h-3 bg-brand-magenta rounded-full blur-sm animate-pulse" />
          </div>
          {/* Top Right */}
          <div className="absolute -top-6 -right-6 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-brand-pink to-transparent" />
            <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-brand-pink to-transparent" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-brand-pink" />
          </div>
          {/* Bottom Left */}
          <div className="absolute -bottom-6 -left-6 w-16 h-16 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-pink to-transparent" />
            <div className="absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-brand-pink to-transparent" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-brand-pink" />
          </div>
          {/* Bottom Right */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-brand-magenta to-transparent" />
            <div className="absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t from-brand-magenta to-transparent" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-magenta rounded-full blur-sm animate-pulse" />
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-magenta/20 flex items-center justify-center min-h-[500px] md:min-h-[600px] bg-brand-plum/40 backdrop-blur-sm">
            {/* Background/Frame Image */}
            <img 
              src="/Untitled design (6).png" 
              alt="Department Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay Text Content */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 md:p-16 text-center"
            >
              <motion.h3 
                variants={{
                  hidden: { opacity: 0, y: -30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                }}
                className="text-2xl md:text-6xl font-bold text-white mb-10 tracking-tight leading-tight"
              >
                Department of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight to-brand-pink">Computer Science & Engineering (CSE)</span>
              </motion.h3>
              
              <div className="max-w-4xl space-y-6">
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
                  }}
                  className="text-sm md:text-xl text-white leading-relaxed font-medium"
                >
                  The Department of Computer Science and Engineering, established in 1998, now admits 130 undergraduate students per session and offers postgraduate and PhD programs.
                </motion.p>
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
                  }}
                  className="text-sm md:text-xl text-brand-highlight leading-relaxed hidden sm:block font-bold"
                >
                  The department is known for quality education, modern labs, strong faculty-student relationships, and active research with regular national and international publications.
                </motion.p>
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
                  }}
                  className="text-sm md:text-xl text-brand-highlight/70 italic hidden md:block font-semibold"
                >
                  It also promotes co-curricular activities through workshops, seminars, and programming contests organized by the CUET Computer Club.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Final Decorative Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl mx-auto mt-20 mb-32 px-4 flex flex-col items-center"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-brand-magenta/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative group">
            {/* Animated outer ring */}
            <div className="absolute -inset-4 border border-brand-magenta/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" />
            <div className="absolute -inset-8 border border-brand-plum/20 rounded-full animate-[spin_30s_linear_infinite_reverse] pointer-events-none" />
            
            <img 
              src="/IMG_20260509_234105-removebg-preview.webp" 
              alt="Decorative Element" 
              className="relative z-10 w-full h-auto max-h-[600px] object-contain drop-shadow-[0_0_30px_rgba(166,77,121,0.3)] transition-transform duration-500 group-hover:scale-105 opacity-40 md:opacity-50"
              style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
            />

            {/* Vision Text Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-3xl md:text-6xl font-bold text-white mb-6 tracking-tighter"
              >
                Our Vision
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-sm md:text-xl text-brand-highlight max-w-3xl leading-relaxed font-bold px-4 drop-shadow-[0_0_10px_rgba(223,161,196,0.2)]"
              >
                For CSE-25, our vision spans wider than just academics — it reflects a generation driven to innovate, collaborate, compete, and create impact through technology. As the next wave of engineers, CSE-25 carries the spirit of learning, coding, research, and leadership while shaping the future of technology together.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 pb-40 px-4 relative z-30"
        >
          {[
            { label: "Our projects", to: "/projects" },
            { label: "Gallery", to: "/gallery" },
            { label: "Achievements", to: "/achievements" }
          ].map((btn) => (
            <motion.a
              key={btn.label}
              href={btn.to}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-12 py-6 rounded-[2rem] overflow-hidden min-w-[200px] text-center"
            >
              {/* Enhanced Liquid Glass Background */}
              <div className="absolute inset-0 bg-brand-plum/20 backdrop-blur-3xl border border-brand-magenta/20 group-hover:border-brand-pink/40 transition-all duration-500 rounded-[2rem]" />
              
              {/* Glass Reflection/Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/15 via-transparent to-brand-magenta/10 opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-[2rem]" />
              
              {/* Glossy Top Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-pink/40 to-transparent" />
              
              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-brand-magenta/10 group-hover:ring-brand-pink/30 transition-all duration-500" />
              
              <span className="relative z-10 text-brand-highlight font-bold tracking-wider text-xl transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(223,161,196,0.6)]">
                {btn.label}
              </span>
              
              {/* Strengthened Hover Glow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-brand-magenta/40 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-brand-pink/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.a>
          ))}
        </motion.div>

        {/* Vision Decorative Image & Location Container */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none z-20 pb-4 md:pb-12 px-4 md:px-12 h-64 md:h-96">
          {/* Location Details - Bottom Left */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
            className="absolute bottom-6 md:bottom-16 left-6 md:left-12 z-30 space-y-2 md:space-y-3 max-w-[70%] md:max-w-xl"
          >
            <p className="text-[10px] md:text-xs font-black text-brand-pink uppercase tracking-[0.4em] mb-1">Campus Location</p>
            <h4 className="text-sm md:text-xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg">
              Chittagong University of <br />
              Engineering and Technology (CUET)
            </h4>
            <p className="text-[10px] md:text-sm lg:text-lg text-brand-highlight/70 font-bold leading-relaxed">
              Kaptai Highway, রাউজান পাহাড়তলী সড়ক <br />
              Chattogram 4349, Bangladesh
            </p>
            
            {/* Techy separator */}
            <div className="flex items-center justify-start gap-3 md:gap-4 pt-2 md:pt-4">
               <div className="h-[1.5px] w-16 md:w-24 bg-gradient-to-r from-brand-magenta to-transparent" />
               <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse shadow-[0_0_10px_rgba(166,77,121,0.5)]" />
            </div>
          </motion.div>

          {/* Decorative Image - Bottom Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.6, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            className="absolute bottom-0 right-0 w-56 sm:w-72 md:w-[32rem] lg:w-[45rem] z-20"
          >
            <img 
              src="/Gemini_Generated_Image_3o0hjx3o0hjx3o0h-removebg-preview.png" 
              alt="Vision Decorative" 
              className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(223,161,196,0.3)]"
            />
            {/* Ambient glow behind image */}
            <div className="absolute inset-0 bg-brand-pink/5 blur-[100px] rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </>
  );
}

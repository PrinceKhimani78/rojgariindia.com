"use client";

import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Particles from "react-tsparticles";
import Image from "next/image";

import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaCheckCircle,
  FaWhatsapp,
} from "react-icons/fa";

/* ✅ Success Animation Component */
function SuccessAnim() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("/animations/success.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, []);

  if (!animationData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay
        style={{ width: 28, height: 28 }}
      />
    </motion.div>
  );
}

/* ✅ Main Component */
export default function ComingSoon() {
  const [formData, setFormData] = useState({ email: "", phone: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [progress] = useState(60);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [titleWidth, setTitleWidth] = useState(0);

  useEffect(() => {
    if (titleRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setTitleWidth(titleRef.current?.offsetWidth || 0);
      });
      resizeObserver.observe(titleRef.current);
      setTitleWidth(titleRef.current.offsetWidth);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const triggerConfetti = () => {
    if (typeof window === "undefined") return;
    import("canvas-confetti").then((mod: any) => {
      const confetti = mod.default;
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#FFD633", "#00C9FF", "#ffffff"],
      });
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!formData.email || !formData.phone) return;
    setIsSubscribed(true);
    setShowSuccess(true);
    triggerConfetti();
    setTimeout(() => setShowSuccess(false), 2500);
    setFormData({ email: "", phone: "" });
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#FFFFFF] text-[#000000] px-4 sm:px-6 md:px-8 pt-0">
      {/* 🎥 Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isClient && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full object-cover  animate-[slowZoom_40s_linear_infinite_alternate] h-screen"
          >
            <source src="/images/bg-video.webm" type="video/mp4" />
          </video>
        )}
      </div>

      {/* 🌌 Particles */}
      <Particles
        id="tsparticles"
        options={{
          background: { color: "transparent" },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: { repulse: { distance: 80, duration: 0.4 } },
          },
          particles: {
            number: { value: 30 },
            color: { value: ["#00A3CC", "#F5BE00", "#023052"] },
            links: { enable: true, color: "#ffffff", opacity: 0.1, width: 1 },
            move: { enable: true, speed: 0.6, random: true },
            opacity: { value: 0.25 },
            size: { value: { min: 1, max: 2.5 } },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {/* 🌟 Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[95%]">
        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-16 sm:mb-16"
        >
          <Image
            src="/images/logo.svg"
            alt="Rojgari India"
            width={250}
            height={70}
            className="md:w-[350px]"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          ref={titleRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="fontAL text-2xl sm:text-2xl md:text-4xl font-extrabold mb-2 drop-shadow-lg flex items-center justify-center gap-2 sm:gap-3 leading-[1.2]"
        >
          <span className="bg-gradient-to-r from-[#F5811E] via-[#FFCC23]/70 to-[#F5811E] bg-[length:200%_100%] animate-[shimmer_6s_linear_infinite] text-transparent bg-clip-text">
            Coming
          </span>
          <span className="bg-gradient-to-r from-[#F5811E] via-[#FFCC23]/70 to-[#F5811E] bg-[length:200%_100%] animate-[shimmer_6s_linear_infinite] text-transparent bg-clip-text">
            Soon
          </span>
        </motion.h1>

        {/* Progress Bar */}
        <div
          className="bg-gray-200 rounded-full overflow-hidden mb-5 sm:mb-10 h-1 sm:h-2 border border-[#F5811E]/50"
          style={{
            width: `${titleWidth}px`,
            maxWidth: "90vw",
            transition: "width 0.5s ease",
          }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#F5811E] via-[#FFD633] to-[#F5811E]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="fontAL text-base font-bold text-[#000000] mb-8 sm:mb-8 mt-5 max-w-[90%] sm:max-w-xl"
        >
          For the people creating opportunities, & the people ready to take
          them.
        </motion.p>

        {/* Subscription Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-full overflow-hidden p-4 sm:p-3 shadow-md gap-3 w-full max-w-[90%] sm:max-w-xl text-center"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full sm:flex-1 bg-transparent text-[#000000] placeholder-gray-500 px-4 py-3 text-base text-center sm:text-left outline-none border border-gray-200 sm:border-none rounded-full sm:rounded-none"
          />
          <input
            type="tel"
            placeholder="Mobile number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full sm:flex-1 bg-transparent text-[#000000] placeholder-gray-500 px-4 py-3 text-base text-center sm:text-left outline-none border border-gray-200 sm:border-none rounded-full sm:rounded-none"
          />
          <button
            type="submit"
            disabled={isSubscribed}
            className={`w-full sm:w-auto font-semibold text-base px-6 py-3 rounded-full shadow-md transition-all flex items-center justify-center gap-2 ${
              isSubscribed ? "bg-[#72B76A]" : "bg-[#72B76A] hover:bg-[#558e4e]"
            } text-white`}
          >
            {isSubscribed ? (
              <>
                <span>Subscribed!</span>
                <SuccessAnim />
              </>
            ) : (
              "Notify Me"
            )}
          </button>
        </motion.form>

        {/* Success Popup */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 bg-[#00C9FF]/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 sm:gap-3 z-50 backdrop-blur-md border border-white/20"
            >
              <FaCheckCircle className="text-[#FFD633] text-lg sm:text-2xl" />
              <p className="font-medium text-sm sm:text-base">
                Subscribed successfully!!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="fontAL text-sm sm:text-base text-[#000000] mt-15 sm:mt-15 max-w-[90%] sm:max-w-xl"
        >
          We’re bridging the distance between people seeking work and the
          workplaces that need them...
        </motion.p>

        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex gap-5 sm:gap-6 mt-10 sm:mt-10 text-xl sm:text-2xl"
        >
          <a
            href="#"
            className="transition text-[#000000] hover:text-[#E1306C]"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            className="transition text-[#000000] hover:text-[#0077B5]"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="#"
            className="transition text-[#000000] hover:text-[#1877F2]"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="#"
            className="transition text-[#000000] hover:text-[#25D366]"
            aria-label="WhatsApp"
          >
            <FaWhatsapp />
          </a>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes slowZoom {
          0% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}

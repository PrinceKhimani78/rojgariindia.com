"use client";

const BgVideo = () => (
  <div className="absolute inset-0 -z-10">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    >
      <source src="/images/bg-video.webm" type="video/mp4" />
    </video>
  </div>
);

export default BgVideo;

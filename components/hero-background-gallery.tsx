"use client";

import Image from "next/image";

const HERO_IMAGES = [
  "/2086ffee-e7e2-4783-ae8e-401dcd895463.jpeg",
  "/3c27f3ab-6fdf-48a8-873d-4a66cf72e1ef.jpeg",
  "/44a40acd-41a9-4453-8df9-f1cf2faf9f15.jpeg",
  "/4633bdda-c44f-44e4-9b9c-386aea0c1f3d.jpeg",
] as const;

const marqueeImages = [...HERO_IMAGES, ...HERO_IMAGES];

export const HeroBackgroundGallery = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      <div className="absolute inset-y-0 -left-[10%] flex w-[220%] items-center gap-5 opacity-90 blur-[2px] [animation:hero-marquee_28s_linear_infinite]">
        {marqueeImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`relative h-[220px] w-[180px] shrink-0 overflow-hidden rounded-[1.75rem] border border-white/55 shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:h-[260px] sm:w-[210px] lg:h-[300px] lg:w-[230px] ${
              index % 2 === 0 ? "translate-y-10" : "-translate-y-10"
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index < 2}
              sizes="(min-width: 1024px) 230px, 180px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,242,0.82)_0%,rgba(250,247,242,0.34)_20%,rgba(250,247,242,0.02)_56%,rgba(250,247,242,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.34),transparent_34%)]" />
    </div>
  );
};

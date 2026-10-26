import React from "react";

interface NamasteIconProps {
  className?: string;
  size?: number;
}

export default function NamasteIcon({ className = "w-28 h-28", size }: NamasteIconProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Luxury Gold Gradients */}
        <linearGradient id="namasteGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="namasteGoldLight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="namasteShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>

        {/* Soft Gold Ambient Glow Filter */}
        <filter id="namasteGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter="url(#namasteGlow)">
        {/* Ambient Halo Behind Fingertips */}
        <ellipse cx="80" cy="55" rx="38" ry="45" fill="url(#namasteGoldLight)" opacity="0.08" />

        {/* Left Hand Main Silhouette */}
        <path
          d="M 80 22 
             C 77 22, 73 28, 70 38 
             C 66 50, 62 68, 59 86 
             C 57 97, 54 110, 52 124 
             C 50 138, 52 148, 56 156 
             C 59 162, 64 167, 68 172 
             L 80 172"
          stroke="url(#namasteGold)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Right Hand Main Silhouette (Mirrored) */}
        <path
          d="M 80 22 
             C 83 22, 87 28, 90 38 
             C 94 50, 98 68, 101 86 
             C 103 97, 106 110, 108 124 
             C 110 138, 108 148, 104 156 
             C 101 162, 96 167, 92 172 
             L 80 172"
          stroke="url(#namasteGold)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Center Palm Seam (where palms join) */}
        <path
          d="M 80 23 L 80 126"
          stroke="url(#namasteGoldLight)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Left Hand - Index Finger Line */}
        <path
          d="M 76 35 C 72 48, 68 66, 66 84 C 64 98, 63 112, 63 124"
          stroke="url(#namasteGold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="95"
          strokeDashoffset="0"
          opacity="0.85"
        />

        {/* Right Hand - Index Finger Line */}
        <path
          d="M 84 35 C 88 48, 92 66, 94 84 C 96 98, 97 112, 97 124"
          stroke="url(#namasteGold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="95"
          strokeDashoffset="0"
          opacity="0.85"
        />

        {/* Left Hand - Middle/Ring Finger separation lines */}
        <path
          d="M 71 52 C 67 66, 64 82, 63 98"
          stroke="url(#namasteGold)"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M 89 52 C 93 66, 96 82, 97 98"
          stroke="url(#namasteGold)"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Left Thumb */}
        <path
          d="M 62 120 
             C 67 114, 73 111, 79 111
             C 80 111, 80 122, 80 126"
          stroke="url(#namasteGold)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Thumb */}
        <path
          d="M 98 120 
             C 93 114, 87 111, 81 111
             C 80 111, 80 122, 80 126"
          stroke="url(#namasteGold)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gentle Palm Crease */}
        <path
          d="M 72 135 C 75 142, 78 147, 80 150 C 82 147, 85 142, 88 135"
          stroke="url(#namasteGold)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Wrist Base Highlights */}
        <path
          d="M 64 162 C 70 166, 75 167, 80 167 C 85 167, 90 166, 96 162"
          stroke="url(#namasteGoldLight)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 60 171 C 67 175, 74 176, 80 176 C 86 176, 93 175, 100 171"
          stroke="url(#namasteGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Fingertip Sacred Light Beam */}
        <line
          x1="80"
          y1="10"
          x2="80"
          y2="20"
          stroke="url(#namasteShine)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="80" cy="18" r="1.5" fill="#FFFBEB" />
      </g>
    </svg>
  );
}

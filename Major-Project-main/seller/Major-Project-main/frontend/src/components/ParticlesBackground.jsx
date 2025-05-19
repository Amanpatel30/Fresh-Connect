import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Changed to use slim version

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine); // Use loadSlim instead of loadFull
  }, []);

  return (
    <Particles
      className="absolute inset-0 -z-10"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: "#22c55e",
          },
          links: {
            color: "#22c55e",
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
          },
          collisions: {
            enable: false, // Disabled collisions for better performance
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "out", // Changed from bounce to out for better performance
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 50, // Reduced number of particles
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 2 }, // Reduced max size
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
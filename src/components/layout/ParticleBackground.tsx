import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const aiLogs = [
      "> INITIALIZING LAMORA AI CORE...",
      "> ESTABLISHING NEURAL PATHWAYS...",
      "> BYPASSING STANDARD PROTOCOLS...",
      "> DECRYPTING INCOMING PACKETS...",
      "> SCANNING NETWORK TOPOLOGY...",
      "> ACCESSING MAINFRAME SECTOR 7...",
      "> ANALYZING USER BEHAVIOR PATTERNS...",
      "> QUANTUM ENCRYPTION ACTIVE...",
      "> LAMORA AGENT: READY FOR DIRECTIVE.",
      "> SYSTEM DIAGNOSTICS: OPTIMAL.",
      "> ALLOCATING MEMORY BLOCKS...",
      "> INITIATING HANDSHAKE PROTOCOL...",
      "> OVERRIDING FIREWALL DEFENSES...",
      "> ESTABLISHING SECURE TUNNEL...",
      "> MACHINE LEARNING MODELS UPDATED...",
      "> CALIBRATING SENSOR ARRAYS...",
      "> CROSS-REFERENCING DATABASE...",
      "> EXECUTING COMMAND SEQUENCE: 0x4A8F...",
      "> MONITORING TRAFFIC ANOMALIES...",
      "> LAMORA NEURAL NET SYNCHRONIZED."
    ];

    interface LogLine {
      text: string;
      x: number;
      y: number;
      speed: number;
      opacity: number;
      charsTyped: number;
      typingSpeed: number;
    }

    const lines: LogLine[] = [];

    const createLine = () => {
      const text = aiLogs[Math.floor(Math.random() * aiLogs.length)];
      lines.push({
        text,
        x: Math.random() * (canvas.width * 0.8) + canvas.width * 0.1,
        y: Math.random() * canvas.height,
        speed: (Math.random() * 0.5) + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        charsTyped: 0,
        typingSpeed: Math.random() * 0.5 + 0.1
      });
    };

    // Initial lines
    for (let i = 0; i < 25; i++) {
      createLine();
    }

    // 3D Cube vertices
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];
    
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back
      [4, 5], [5, 6], [6, 7], [7, 4], // front
      [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
    ];

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '14px monospace';
      
      lines.forEach((line, index) => {
        line.charsTyped += line.typingSpeed;
        if (line.charsTyped > line.text.length + 50) {
          lines.splice(index, 1);
          createLine();
        }

        const currentText = line.text.substring(0, Math.floor(line.charsTyped));
        
        ctx.fillStyle = `rgba(16, 185, 129, ${line.opacity})`;
        ctx.fillText(currentText, line.x, line.y);

        line.y -= line.speed;
        
        if (line.y < -50) {
          lines.splice(index, 1);
          createLine();
          lines[lines.length - 1].y = canvas.height + 50;
        }
      });

      // Central large faint text
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.font = '900 15vw Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LAMORA AI', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '600 2vw monospace';
      ctx.fillText('AGENT TERMINAL ACTIVE', canvas.width / 2, canvas.height / 2 + (canvas.width * 0.08));
      ctx.textAlign = 'left';

      // Function to draw a rotating robot core at specific coordinates
      const drawRobotCore = (cx: number, cy: number, size: number, timeOffset: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        
        const angleX = (time + timeOffset) * 0.01;
        const angleY = (time + timeOffset) * 0.015;
        
        const projected = vertices.map(v => {
          let y1 = v[1] * Math.cos(angleX) - v[2] * Math.sin(angleX);
          let z1 = v[1] * Math.sin(angleX) + v[2] * Math.cos(angleX);
          let x2 = v[0] * Math.cos(angleY) + z1 * Math.sin(angleY);
          let z2 = -v[0] * Math.sin(angleY) + z1 * Math.cos(angleY);
          
          const fov = 3;
          const scale = fov / (fov + z2);
          
          return {
            x: x2 * scale * size,
            y: y1 * scale * size,
            z: z2
          };
        });

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.stroke();

        edges.forEach(edge => {
          const p1 = projected[edge[0]];
          const p2 = projected[edge[1]];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${(p1.z + p2.z + 4) / 8})`;
          ctx.stroke();
        });
        
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.restore();
      };

      const size = Math.min(canvas.width, canvas.height) * 0.12;
      
      // Draw left robot core
      drawRobotCore(canvas.width * 0.15, canvas.height / 2, size, 0);
      
      // Draw right robot core
      drawRobotCore(canvas.width * 0.85, canvas.height / 2, size, 500);

      time++;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#000000'
      }}
    />
  );
};

export default ParticleBackground;

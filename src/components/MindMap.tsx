'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MindMapProps {
  mermaidCode: string;
  id: string;
}

export function MindMap({ mermaidCode, id }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !mermaidCode) return;

    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 20
      }
    });

    const renderMindmap = async () => {
      try {
        const { svg } = await mermaid.render(`mindmap-${id}`, mermaidCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        // Fallback to showing the mermaid code
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-6 bg-red-50 rounded-lg border-2 border-red-200">
              <div class="text-red-800 font-semibold mb-2">
                ⚠️ 마인드맵 렌더링 오류
              </div>
              <pre class="text-sm text-gray-700 overflow-x-auto"><code>${mermaidCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            </div>
          `;
        }
      }
    };

    renderMindmap();
  }, [mermaidCode, id]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto p-4 bg-white rounded-lg border border-gray-200"
    />
  );
}

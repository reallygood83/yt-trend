'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MindMapBranch {
  label: string;
  subbranches: string[];
}

interface MindMapData {
  central: string;
  branches: MindMapBranch[];
}

interface MindMapProps {
  data: MindMapData;
  id: string;
}

export function MindMap({ data, id }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      mindmap: {
        padding: 20,
        maxNodeWidth: 200,
      }
    });

    // Generate Mermaid mindmap syntax
    const generateMermaidSyntax = () => {
      let syntax = `mindmap\n  root((${data.central}))\n`;

      data.branches.forEach((branch, branchIdx) => {
        syntax += `    ${branch.label}\n`;
        branch.subbranches.forEach((sub) => {
          syntax += `      ${sub}\n`;
        });
      });

      return syntax;
    };

    const renderMindmap = async () => {
      try {
        const syntax = generateMermaidSyntax();
        const { svg } = await mermaid.render(`mindmap-${id}`, syntax);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        // Fallback to text-based mindmap
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div class="text-center mb-6">
                <div class="inline-block px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-bold">
                  ${data.central}
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-${data.branches.length} gap-4">
                ${data.branches.map(branch => `
                  <div class="bg-white p-4 rounded-lg border border-blue-300 shadow-sm">
                    <div class="font-bold text-blue-700 mb-3">${branch.label}</div>
                    <ul class="space-y-2">
                      ${branch.subbranches.map(sub => `
                        <li class="text-sm text-gray-700 flex items-start gap-2">
                          <span class="text-blue-500 mt-1">•</span>
                          <span>${sub}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      }
    };

    renderMindmap();
  }, [data, id]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto p-4 bg-white rounded-lg border border-gray-200"
    />
  );
}

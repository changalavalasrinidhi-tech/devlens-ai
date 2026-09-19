import React from 'react';

interface MatrixItem {
  name: string;
  category: string;
  status: 'active' | 'pending' | 'deprecated';
  healthScore: number;
}

export const ArchitectureMatrix: React.FC = () => {
  const components: MatrixItem[] = [
    { name: 'FastAPI Backend', category: 'Backend', status: 'active', healthScore: 95 },
    { name: 'React Frontend', category: 'Frontend', status: 'active', healthScore: 90 },
    { name: 'Database Service', category: 'Database', status: 'active', healthScore: 88 },
  ];

  return (
    <div className="p-6 bg-slate-900 text-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-4">Architecture Matrix</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="py-2 px-4">Component</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Health Score</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp, idx) => (
              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-3 px-4 font-medium">{comp.name}</td>
                <td className="py-3 px-4 text-slate-300">{comp.category}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400">
                    {comp.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-orange-400 font-semibold">{comp.healthScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
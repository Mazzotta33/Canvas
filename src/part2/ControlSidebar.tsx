import type { Rect, Size } from '../part1';

export const ControlsSidebar = ({ rects, onSizeChange }: { rects: Rect[], onSizeChange: (index: number, newSize: Size) => void }) => {
    return (
        <div className="w-72 bg-gray-800 p-4 border-r border-gray-700 flex-shrink-0 overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Панель управления</h2>
            {rects.map((rect, index) => (
                <div key={index} className="mb-6 bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-md font-semibold text-emerald-400 mb-3">Прямоугольник {index + 1}</h3>
                    <div className="mb-2">
                        <label htmlFor={`width-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                            Ширина: {rect.size.width}px
                        </label>
                        <input
                            type="range"
                            id={`width-${index}`}
                            min="50"
                            max="400"
                            step="10"
                            value={rect.size.width}
                            onChange={(e) => onSizeChange(index, { ...rect.size, width: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor={`height-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                            Высота: {rect.size.height}px
                        </label>
                        <input
                            type="range"
                            id={`height-${index}`}
                            min="50"
                            max="400"
                            step="10"
                            value={rect.size.height}
                            onChange={(e) => onSizeChange(index, { ...rect.size, height: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
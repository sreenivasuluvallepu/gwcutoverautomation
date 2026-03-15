interface TrafficSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TrafficSlider({ value, onChange }: TrafficSliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-600 dark:text-ink-200">
        <span>Traffic to Kong</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-ink-200 accent-teal-500 dark:bg-ink-800"
      />
      <div className="mt-2 flex justify-between text-[10px] text-ink-500">
        <span>Legacy 100%</span>
        <span>Balanced</span>
        <span>Kong 100%</span>
      </div>
    </div>
  );
}

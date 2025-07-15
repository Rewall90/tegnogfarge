interface UndoButtonProps {
  onUndo: () => void;
  canUndo: boolean;
}

export function UndoButton({ onUndo, canUndo }: UndoButtonProps) {
  return (
    <button
      onClick={onUndo}
      disabled={!canUndo}
      className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 transition-all hover:bg-gray-200 disabled:hover:bg-gray-100"
      aria-label="Undo last action"
    >
      <span className="text-lg">↩️</span>
    </button>
  );
}
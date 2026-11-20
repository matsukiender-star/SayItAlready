/** Mensaje del resumen según la puntuación. */
export function verdict(correct, total) {
  if (correct === 0) return { emoji: '😅', text: '¡Calentando motores!' };
  const ratio = total ? correct / total : 0;
  if (correct >= 15 || (correct >= 10 && ratio >= 0.8)) return { emoji: '🏆', text: '¡Eres una leyenda!' };
  if (correct >= 10) return { emoji: '🔥', text: '¡Estás que ardes!' };
  if (correct >= 6) return { emoji: '🎉', text: '¡Muy bien jugado!' };
  if (correct >= 3) return { emoji: '👏', text: '¡Nada mal!' };
  return { emoji: '💪', text: '¡La próxima es la buena!' };
}

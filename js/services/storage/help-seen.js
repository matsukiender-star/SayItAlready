/** Recuerda si el usuario ya vio «Cómo jugar». */
import { readJSON, writeJSON } from './local-store.js';
import { hasPlayedAny } from './play-history.js';

const HELP_KEY = 'diloya-htp-seen';

export function hasSeenHelp() {
  return readJSON(HELP_KEY, false) === true || hasPlayedAny();
}

export function markHelpSeen() {
  writeJSON(HELP_KEY, true);
}

/**
 * Keyboard-first shortcut to the primary content landmark (#main). The
 * .skip-link styles keep it visually hidden until it receives focus, so
 * sighted mouse users never see it.
 */
export function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  );
}

import type { CSSProperties } from "react";
import SkillIcon, { techAccent } from "./SkillIcon";

type Props = {
  label: string;
  /** small mono text above the label, e.g. "SYS//01" */
  prefix?: string;
  /** optional code line under the label, e.g. "Intermediate // 70%" */
  code?: string;
  /** stagger so tags don't all glitch at once */
  delay?: number;
  /** skip the always-on animations (they still play on hover) */
  lite?: boolean;
  /** position in the reveal sequence (drives the stagger) */
  order?: number;
  onClick?: () => void;
};

export default function GlitchTag({
  label,
  prefix,
  code,
  delay = 0,
  lite = false,
  order = 0,
  onClick,
}: Props) {
  const style = {
    "--tag-accent": techAccent(label),
    "--gd": `${delay}s`,
    "--ei": order,
  } as CSSProperties;

  return (
    <button
      type="button"
      className={`glitch-tag${lite ? " gt-lite" : ""}`}
      style={style}
      onClick={onClick}
    >
      <span className="gt-grid" aria-hidden="true" />
      <span className="gt-noise" aria-hidden="true" />
      <span className="gt-scan" aria-hidden="true" />
      <span className="gt-corner tl" aria-hidden="true" />
      <span className="gt-corner tr" aria-hidden="true" />
      <span className="gt-corner bl" aria-hidden="true" />
      <span className="gt-corner br" aria-hidden="true" />

      <span className="gt-body">
        <SkillIcon
          label={label}
          size={26}
          variant="glyph"
          className="gt-icon"
        />
        <span className="gt-text">
          <span className="gt-top">
            <i className="gt-dot" aria-hidden="true" />
            {prefix && <span className="gt-prefix">{prefix}</span>}
          </span>
          <span className="gt-label" data-text={label}>
            {label}
          </span>
          {code && <span className="gt-code">{code}</span>}
        </span>
      </span>
    </button>
  );
}

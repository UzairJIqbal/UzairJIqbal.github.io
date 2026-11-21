import { Fragment } from "react";

// Splits a line into word spans at render time, so the motion layer can
// animate words without measuring or re-rendering. Spaces stay real text
// nodes: copy, selection and screen readers see the sentence unchanged.
//   mask  — each word slides up inside its own clip (headings)
//   plain — each word is a bare span (scroll-lit paragraphs)
export function Words({ text, mode = "mask" }: { text: string; mode?: "mask" | "plain" }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {mode === "mask" ? (
            <span className="hm-w">
              <span className="hm-wi" style={{ "--i": i } as React.CSSProperties}>
                {w}
              </span>
            </span>
          ) : (
            <span className="hm-sw">{w}</span>
          )}
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

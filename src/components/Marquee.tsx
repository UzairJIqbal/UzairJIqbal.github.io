// A full-width band of oversized type that slides sideways forever. PageMotion speeds it up,
// flips its direction and skews it with the scroll. Duplicated once so the loop is seamless.
export function Marquee({ items, outline, reverse }: { items: string[]; outline?: boolean; reverse?: boolean }) {
  const run = (hidden: boolean) => (
    <span aria-hidden={hidden || undefined} className={`marquee-text ${outline ? "marquee-outline" : ""}`}>
      {items.map((item) => (
        <span key={item}>
          {item}
          <span className="marquee-star">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div data-marquee={reverse ? "reverse" : ""} className="marquee">
      <div className="marquee-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}

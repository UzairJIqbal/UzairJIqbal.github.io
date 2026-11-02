import { Simple } from "@/components/sites/espn-f1/simple";
import { Story } from "@/components/sites/espn-f1/story";

// Without scripts the story can't move, so show the plain view straight away.
const NO_SCRIPT = "<style>.f1-simple-overlay{visibility:visible;animation:none}</style>";

export default function Home() {
  return (
    <>
      <Story />
      <Simple overlay />
      <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT }} />
    </>
  );
}

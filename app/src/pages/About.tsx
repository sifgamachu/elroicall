import { BookOpen, HeartHandshake, ShieldCheck } from "lucide-react";
import ProductShell from "@/components/ProductShell";

const PRINCIPLES = [
  {
    icon: HeartHandshake,
    title: "Listen before explaining",
    body: "People rarely need a slogan when something hurts. El Roi Call should begin with the person's own words before it introduces a biblical story.",
  },
  {
    icon: BookOpen,
    title: "Scripture, not impersonation",
    body: "Biblical people are witnesses and stories, not AI characters. The guide narrates their stories in third person and distinguishes the biblical text from interpretation.",
  },
  {
    icon: ShieldCheck,
    title: "Trust matters more than immersion",
    body: "The guide should never pretend to be God, a biblical figure, clergy, a therapist, or a medical professional. Clear boundaries make the experience more trustworthy, not less meaningful.",
  },
];

export default function About() {
  return (
    <ProductShell
      eyebrow="Why El Roi"
      title="The idea began with a woman in the desert who thought nobody saw her."
      description="In Genesis 16, Hagar names God El Roi — the God who sees me. That moment is the product's center: not spectacle, not roleplay, but the experience of being seen clearly enough to bring your real life into Scripture."
    >
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <blockquote className="border-l border-gold-soft pl-6 font-serif-display text-3xl font-light italic leading-[1.45] text-parchment sm:text-4xl">
            “You are the God who sees me.”
            <span className="mt-3 block font-sans text-[10px] not-italic uppercase tracking-[0.28em] text-gold">Genesis 16:13</span>
          </blockquote>

          <div className="mt-9 space-y-5 text-[14px] font-light leading-[1.9] text-parchment-dim">
            <p>
              El Roi Call is being rebuilt around one simple relationship: one recognizable AI guide, many biblical stories, and one person on the other end of the line who does not need to perform spirituality before they can begin.
            </p>
            <p>
              The guide may help someone sit with Job in grief, Hagar in loneliness, Esther in fear, Peter in failure, Ruth in starting over, or another story from Scripture. But the biblical person remains the biblical person. The AI remains the guide.
            </p>
            <p>
              The goal is not to create a digital Bible character. The goal is to help someone slow down, name what is true, hear a relevant part of Scripture carefully, reflect, and—when they want—pray.
            </p>
          </div>

          <a
            href="/begin/"
            className="mt-9 inline-block bg-[hsl(var(--gold))] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))]"
          >
            Start with what you are carrying
          </a>
        </div>

        <aside className="border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">Three product principles</p>
          <div className="mt-6 space-y-7">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-soft/35 text-gold-bright">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-serif-display text-2xl font-light text-parchment">{title}</h2>
                  <p className="mt-2 text-[12px] font-light leading-[1.75] text-parchment-dim">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-16 border-t border-white/10 pt-9">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">Company</p>
        <p className="mt-3 text-[13px] font-light leading-[1.8] text-parchment-dim">
          El Roi Call is a product of Teregna LLC in the United States. Questions can be sent to{" "}
          <a href="mailto:hello@elroicall.com" className="text-gold hover:text-gold-bright">hello@elroicall.com</a>.
        </p>
      </div>
    </ProductShell>
  );
}
